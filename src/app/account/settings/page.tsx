// @ts-nocheck
/* eslint-disable */
import { Settings } from 'lucide-react';

export default function AccountSettingsPage() {
  return (
    <div className="bg-white p-8 border border-surfaceBorder rounded-sm shadow-sm space-y-8">
      <h2 className="text-xl font-serif">Account Settings</h2>
      
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-textPrimary mb-4">Email Preferences</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent" defaultChecked />
            <span className="text-sm text-textSecondary">Receive order updates via email</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent" />
            <span className="text-sm text-textSecondary">Receive exclusive offers and newsletters</span>
          </label>
        </div>
      </div>

      <div className="pt-6 border-t border-surfaceBorder">
        <h3 className="text-sm font-bold uppercase tracking-widest text-textPrimary mb-4">Security</h3>
        <button className="px-6 py-2 border border-surfaceBorder text-sm font-medium hover:bg-surface transition-colors rounded-sm">
          Change Password
        </button>
      </div>

      <div className="pt-6 border-t border-surfaceBorder">
        <h3 className="text-sm font-bold uppercase tracking-widest text-red-600 mb-4">Danger Zone</h3>
        <button className="px-6 py-2 border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors rounded-sm">
          Delete Account
        </button>
      </div>
    </div>
  );
}

