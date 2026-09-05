// @ts-nocheck
/* eslint-disable */
import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import DashboardClient from './DashboardClient';

export default async function AdminDashboard() {
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

  // Fetch all orders (client will do date filtering)
  const { data: allOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch real product count
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  return (
    <DashboardClient
      allOrders={allOrders || []}
      productCount={productCount || 0}
    />
  );
}
