import React from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, Settings, LayoutDashboard, LogOut } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Admin Route Protection
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!user || (adminEmail && user.email !== adminEmail)) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Hide global storefront Header and Footer in Admin Panel */}
      <style dangerouslySetInnerHTML={{ __html: 'header, footer { display: none !important; }' }} />
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="VEJO" className="h-8 object-contain" />
            <span className="text-[10px] tracking-widest font-bold uppercase text-accent bg-accent/10 px-2 py-0.5 rounded-sm">Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-gray-500" />
            Dashboard
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
            <ShoppingCart className="w-5 h-5 text-gray-500" />
            Orders
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
            <Package className="w-5 h-5 text-gray-500" />
            Products
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5 text-gray-500" />
            Settings
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700">
            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold uppercase">
              {user.email?.charAt(0)}
            </div>
            <div className="flex-1 truncate">
              <span className="block truncate">{user.email}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
