import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { User, MapPin, Package, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container-custom py-16 min-h-[calc(100vh-200px)]">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-serif text-textPrimary mb-2">My Account</h1>
        <p className="text-textSecondary mb-12">Welcome back, {user.email}</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0 mb-4 md:mb-0 snap-x border-b md:border-b-0 border-surfaceBorder md:border-none">
            <Link href="/account" className="whitespace-nowrap snap-start flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 text-sm md:text-base text-textSecondary hover:bg-surface hover:text-textPrimary transition-colors focus:bg-surface focus:border-b-2 md:focus:border-b-0 md:focus:border-l-2 focus:border-accent focus:text-accent">
              <User className="w-4 h-4 md:w-5 md:h-5" />
              Profile
            </Link>
            <Link href="/account/orders" className="whitespace-nowrap snap-start flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 text-sm md:text-base text-textSecondary hover:bg-surface hover:text-textPrimary transition-colors focus:bg-surface focus:border-b-2 md:focus:border-b-0 md:focus:border-l-2 focus:border-accent focus:text-accent">
              <Package className="w-4 h-4 md:w-5 md:h-5" />
              Orders
            </Link>
            <Link href="/account/addresses" className="whitespace-nowrap snap-start flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 text-sm md:text-base text-textSecondary hover:bg-surface hover:text-textPrimary transition-colors focus:bg-surface focus:border-b-2 md:focus:border-b-0 md:focus:border-l-2 focus:border-accent focus:text-accent">
              <MapPin className="w-4 h-4 md:w-5 md:h-5" />
              Addresses
            </Link>
            <Link href="/account/settings" className="whitespace-nowrap snap-start flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 text-sm md:text-base text-textSecondary hover:bg-surface hover:text-textPrimary transition-colors focus:bg-surface focus:border-b-2 md:focus:border-b-0 md:focus:border-l-2 focus:border-accent focus:text-accent">
              <Settings className="w-4 h-4 md:w-5 md:h-5" />
              Settings
            </Link>
            
            {/* Show Admin Dashboard Link if User is Admin */}
            {user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
              <Link href="/admin" className="whitespace-nowrap snap-start flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 text-sm md:text-base text-accent bg-accent/5 hover:bg-accent/10 border-l-2 border-accent transition-colors font-semibold mt-4">
                <Settings className="w-4 h-4 md:w-5 md:h-5" />
                Admin Dashboard
              </Link>
            )}
            <form action="/auth/signout" method="post" className="snap-start">
              <button className="whitespace-nowrap flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 text-sm md:text-base text-red-500 hover:bg-red-50 transition-colors text-left">
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                Sign Out
              </button>
            </form>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3 space-y-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
