'use client';

import { Navigation } from '@/app/components/Navigation';
import { Footer } from '@/app/components/Footer';

export default function HelpPage() {
  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="ml-24 p-8 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Help Center</h1>
          
          {/* About section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">About Us</h2>
            <div className="prose prose-indigo">
              <p className="text-gray-600 mb-4">
                Welcome to our AI Assistant! This is an intelligent conversation platform built on advanced AI technology.
                Whether it's daily communication, learning guidance, or professional consultation, we provide accurate and timely responses.
              </p>
              <p className="text-gray-600 mb-4">
                Key Features:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4">
                <li>Intelligent Dialogue: Natural language interaction with accurate understanding and detailed responses</li>
                <li>History Records: Automatically saves all conversations for easy review</li>
                <li>Personalization: Customize user information for a personalized chat experience</li>
                <li>Security: Advanced encryption technology to protect user privacy and data</li>
              </ul>
            </div>
          </div>

          {/* FAQ section */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">How to start a new conversation?</h3>
                <p className="text-gray-600 mb-2">You can start a new conversation in two ways:</p>
                <ol className="list-decimal list-inside text-gray-600 space-y-1 ml-2">
                  <li>Click the &quot;+&quot; button in the left navigation bar</li>
                  <li>Enter your question directly on the homepage and send</li>
                </ol>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">How to view chat history?</h3>
                <p className="text-gray-600">
                  Click the "History" icon in the left navigation bar to view all chat records. 
                  You can browse by time or search for specific content.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">How to modify profile?</h3>
                <p className="text-gray-600">
                  Click the "Profile" icon in the left navigation bar to enter the profile page. 
                  Here you can update your avatar, username, and password settings.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">How long are conversations stored?</h3>
                <p className="text-gray-600">
                  All conversations are permanently stored in your account unless you choose to delete them. 
                  You can view and manage these contents at any time.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">What to do if issues occur?</h3>
                <p className="text-gray-600 mb-2">If you encounter any problems while using the platform, you can:</p>
                <ol className="list-decimal list-inside text-gray-600 space-y-1 ml-2">
                  <li>Check this help documentation</li>
                  <li>Refresh the page</li>
                  <li>Verify your network connection</li>
                  <li>Contact technical support</li>
                </ol>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">How to ensure account security?</h3>
                <p className="text-gray-600 mb-2">We recommend:</p>
                <ol className="list-decimal list-inside text-gray-600 space-y-1 ml-2">
                  <li>Use strong passwords and change them regularly</li>
                  <li>Never share account information</li>
                  <li>Check login records periodically</li>
                  <li>Keep personal information up to date</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 