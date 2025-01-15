'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { UserCircle, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">AI Chat</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/chat"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Chat
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-gray-900"
                >
                  <UserCircle className="h-6 w-6" />
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-gray-900"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-gray-900"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 