import { createClient } from '@/utils/supabase/server';

export default async function AccountProfilePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <div className="bg-white p-8 border border-surfaceBorder rounded-sm shadow-sm">
      <h2 className="text-xl font-serif mb-6">Profile Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-textSecondary mb-2">First Name</label>
          <p className="font-medium">{user.user_metadata?.first_name || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-textSecondary mb-2">Last Name</label>
          <p className="font-medium">{user.user_metadata?.last_name || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-textSecondary mb-2">Email Address</label>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-textSecondary mb-2">Account Status</label>
          <p className="font-medium text-green-600">Active</p>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-surfaceBorder flex justify-end">
        <button className="text-sm font-bold uppercase tracking-widest text-accent hover:underline">
          Edit Profile
        </button>
      </div>
    </div>
  );
}
