// @ts-nocheck
/* eslint-disable */
import React from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, Settings, LayoutDashboard, Users, BarChart3, Store, ExternalLink } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { PushNotificationManager } from './PushNotificationManager';

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
    <div className="flex min-h-screen bg-[#F3F4F6] pb-20 md:pb-0">
      {/* Hide global storefront Header and Footer in Admin Panel */}
      <style dangerouslySetInnerHTML={{ __html: 'header, footer { display: none !important; }' }} />
      
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 w-full h-14 bg-[#111827] text-white flex items-center justify-between px-4 z-40 shadow-md">
        <Link href="/admin" className="flex items-center gap-2">
          <Store className="w-5 h-5 text-accent" />
          <span className="font-serif text-md tracking-wide">Seller Central</span>
        </Link>
        <div className="flex items-center gap-2">
          <PushNotificationManager />
        </div>
      </div>

      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-64 bg-[#111827] text-white flex-col fixed h-full z-10 shadow-2xl">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <Store className="w-6 h-6 text-accent" />
            <span className="font-serif text-lg tracking-wide">Seller Central</span>
          </Link>
        </div>
        
        <div className="p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">Overview</p>
          <nav className="space-y-1">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-all group">
              <LayoutDashboard className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors" />
              Dashboard
            </Link>
          </nav>

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2 px-4">Manage</p>
          <nav className="space-y-1">
            <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-all group">
              <ShoppingCart className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors" />
              Orders
            </Link>
            <Link href="/admin/customers" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-all group">
              <Users className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors" />
              Customers
            </Link>
          </nav>

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2 px-4">Configuration</p>
          <nav className="space-y-1">
            <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-all group">
              <Settings className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors" />
              Store Settings
            </Link>
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t border-gray-800">
          <Link href="/" target="_blank" className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-sm font-medium rounded-lg transition-colors mb-4 text-gray-300">
            <ExternalLink className="w-4 h-4" />
            View Live Store
          </Link>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold uppercase border border-accent/30">
              {user.email?.charAt(0)}
            </div>
            <div className="flex-1 truncate">
              <span className="block truncate text-sm font-medium text-white">{user.email?.split('@')[0]}</span>
              <span className="block truncate text-xs text-gray-500">Administrator</span>
            </div>
          </div>
          <PushNotificationManager />
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-[#111827] border-t border-gray-800 text-gray-400 flex justify-around items-center h-16 z-40 pb-safe">
        <Link href="/admin" className="flex flex-col items-center gap-1 p-2 hover:text-accent transition-colors focus:text-accent">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Home</span>
        </Link>
        <Link href="/admin/orders" className="flex flex-col items-center gap-1 p-2 hover:text-accent transition-colors focus:text-accent relative">
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Orders</span>
        </Link>
        <Link href="/admin/settings" className="flex flex-col items-center gap-1 p-2 hover:text-accent transition-colors focus:text-accent">
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Settings</span>
        </Link>
        <Link href="/" target="_blank" className="flex flex-col items-center gap-1 p-2 hover:text-accent transition-colors focus:text-accent">
          <ExternalLink className="w-5 h-5" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Store</span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

