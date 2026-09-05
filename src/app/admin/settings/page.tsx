import React from 'react';
import { Settings, Construction } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
        <div className="w-16 h-16 bg-gray-50 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Settings className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Store Settings</h1>
        <p className="text-gray-500 mb-8">
          The settings dashboard is currently under construction. You will be able to manage your store preferences here soon.
        </p>
        
        <div className="inline-flex items-center gap-2 bg-gray-50 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200">
          <Construction className="w-4 h-4 text-orange-500" />
          Coming Soon
        </div>
      </div>
    </div>
  );
}
