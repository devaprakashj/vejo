import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Package, MapPin, User, Shield, Headset, LogOut } from 'lucide-react';

export default async function AccountProfilePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-accent to-black text-white p-8 rounded-xl shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-serif mb-2">Hello, {user.user_metadata?.first_name || 'User'}!</h2>
          <p className="text-white/80 max-w-md">Manage your orders, track shipments, and update your profile details all in one place.</p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-full bg-white/10 skew-x-12 translate-x-16"></div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Your Orders */}
        <Link href="/account/orders" className="group p-6 bg-white border border-surfaceBorder rounded-xl hover:shadow-lg transition-all hover:border-accent">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Package className="w-6 h-6 text-accent" />
          </div>
          <h3 className="text-lg font-bold mb-1">Your Orders</h3>
          <p className="text-sm text-textSecondary">Track, return, or view past purchases</p>
        </Link>

        {/* Login & Security */}
        <Link href="/account/settings" className="group p-6 bg-white border border-surfaceBorder rounded-xl hover:shadow-lg transition-all hover:border-accent">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <h3 className="text-lg font-bold mb-1">Login & Security</h3>
          <p className="text-sm text-textSecondary">Update password and secure your account</p>
        </Link>

        {/* Your Addresses */}
        <Link href="/account/addresses" className="group p-6 bg-white border border-surfaceBorder rounded-xl hover:shadow-lg transition-all hover:border-accent">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MapPin className="w-6 h-6 text-accent" />
          </div>
          <h3 className="text-lg font-bold mb-1">Your Addresses</h3>
          <p className="text-sm text-textSecondary">Manage delivery locations and defaults</p>
        </Link>

        {/* Contact Support */}
        <Link href="/help/contact" className="group p-6 bg-white border border-surfaceBorder rounded-xl hover:shadow-lg transition-all hover:border-accent">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Headset className="w-6 h-6 text-accent" />
          </div>
          <h3 className="text-lg font-bold mb-1">Contact Support</h3>
          <p className="text-sm text-textSecondary">Need help? Get in touch with us</p>
        </Link>

        {/* Profile Details summary card */}
        <div className="p-6 bg-white border border-surfaceBorder rounded-xl md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-accent" />
              </div>
              <button className="text-sm font-bold uppercase tracking-widest text-accent hover:underline">
                Edit Profile
              </button>
            </div>
            <h3 className="text-lg font-bold mb-1">Profile Details</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-textSecondary mb-1">Full Name</p>
                <p className="font-medium text-sm">{user.user_metadata?.first_name || ''} {user.user_metadata?.last_name || ''}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-textSecondary mb-1">Email</p>
                <p className="font-medium text-sm">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
