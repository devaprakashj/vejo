// @ts-nocheck
/* eslint-disable */
import { MapPin } from 'lucide-react';

export default function AccountAddressesPage() {
  return (
    <div className="bg-white p-8 border border-surfaceBorder rounded-sm shadow-sm">
      <h2 className="text-xl font-serif mb-6 flex items-center justify-between">
        Saved Addresses
        <button className="text-sm font-bold uppercase tracking-widest text-accent hover:underline">
          Add New
        </button>
      </h2>
      <div className="text-center py-12 bg-surface rounded-sm border border-dashed border-gray-300">
        <MapPin className="w-8 h-8 mx-auto text-gray-400 mb-3" />
        <p className="text-textSecondary">You don't have any saved addresses yet.</p>
      </div>
    </div>
  );
}

