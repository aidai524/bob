'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { UserCircle } from 'lucide-react';
import Image from 'next/image';

interface AvatarUploadProps {
  uid: string;
  url: string | null;
  onUpload: (url: string) => void;
}

export function AvatarUpload({ uid, url, onUpload }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClientComponentClient();

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      console.log('Starting upload process...');

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Please select an image to upload');
      }

      const file = event.target.files[0];
      console.log('Selected file:', { name: file.name, type: file.type, size: file.size });
      
      // 检查文件类型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Unsupported file type. Please upload JPG, PNG, GIF or WebP images');
      }

      // 检查文件大小（5MB）
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size cannot exceed 5MB');
      }

      const fileExt = file.type.split('/')[1];
      const fileName = `${uid}/${Math.random()}.${fileExt}`;
      console.log('Generated file name:', fileName);

      // 如果存在旧头像，先删除
      if (url) {
        console.log('Removing old avatar...');
        const oldFileName = url.split('/').pop();
        if (oldFileName) {
          const oldFilePath = `${uid}/${oldFileName}`;
          const { error: removeError } = await supabase.storage
            .from('avatars')
            .remove([oldFilePath]);
          
          if (removeError) {
            console.error('Error removing old avatar:', removeError);
          }
        }
      }

      // 上传新头像
      console.log('Uploading new avatar...');
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // 获取公共 URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('Generated public URL:', urlData.publicUrl);

      // 更新数据库中的头像 URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', uid);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      onUpload(urlData.publicUrl);
      alert('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('上传头像失败: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32">
        {url ? (
          <Image
            src={url}
            alt="Avatar"
            className="rounded-full object-cover"
            fill
            sizes="128px"
          />
        ) : (
          <UserCircle className="w-32 h-32 text-gray-400" />
        )}
        <label
          className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700"
          htmlFor="avatar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </label>
      </div>
      <input
        type="file"
        id="avatar"
        accept="image/*"
        onChange={uploadAvatar}
        disabled={uploading}
        className="hidden"
      />
      {uploading && (
        <div className="text-sm text-gray-500">上传中...</div>
      )}
    </div>
  );
} 