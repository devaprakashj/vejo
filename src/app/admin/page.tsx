import React from 'react';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

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

  // Fetch real data for stats
  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  const { data: revenueData } = await supabase.from('orders').select('total_amount');
  
  const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
  
  // Fetch recent 5 orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-gray-900">Dashboard Overview</h1>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-full">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">{orderCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Products</p>
            <h3 className="text-2xl font-bold text-gray-900">{productCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-full">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Customers</p>
            <h3 className="text-2xl font-bold text-gray-900">--</h3>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mt-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-accent hover:underline">View All</Link>
        </div>
        
        {recentOrders && recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">Order #{order.id.split('-')[0]}</p>
                  <p className="text-sm text-gray-500">User: {order.user_id.split('-')[0]}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">₹{order.total_amount.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 py-12">
            No recent orders to display.
          </div>
        )}
      </div>
    </div>
  );
}
