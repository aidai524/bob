'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AvatarUpload } from '@/app/components/AvatarUpload';
import { PasswordChange } from '@/app/components/PasswordChange';
import { Navigation } from '@/app/components/Navigation';
import { Profile } from '@/app/types';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    id: '',
    username: '',
    avatar_url: null
  });
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile({
          id: data.id,
          username: data.username || '',
          avatar_url: data.avatar_url
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [supabase, user?.id]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user, loadProfile]);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      alert('个人资料已更新');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('更新个人资料失败');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="ml-24">
        <div className="max-w-2xl mx-auto p-6 space-y-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">个人资料</h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div className="mb-8">
              <AvatarUpload
                uid={user.id}
                url={profile.avatar_url}
                onUpload={(url) => {
                  setProfile({ ...profile, avatar_url: url });
                }}
              />
            </div>

            <form onSubmit={updateProfile} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  用户名
                </label>
                <input
                  type="text"
                  id="username"
                  value={profile.username || ''}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="请输入用户名"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱
                </label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? '保存中...' : '保存更改'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <PasswordChange />
          </div>
        </div>
      </main>
    </div>
  );
} 