// @ts-nocheck
/* eslint-disable */
import React from 'react';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
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

  // Fetch real data
  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  const { data: revenueData } = await supabase.from('orders').select('total_amount, created_at, status');
  
  const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
  
  // Calculate mock percentage increases (for premium feel, ideally from historical data)
  const revGrowth = "+12.5%";
  const orderGrowth = "+8.2%";
  const productGrowth = "+2";

  // Actionable alerts calculation
  const pendingOrders = revenueData?.filter(o => o.status === 'pending')?.length || 0;
  const processingOrders = revenueData?.filter(o => o.status === 'processing')?.length || 0;

  // Recent 5 orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header section with Actionable Alerts */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your store today.</p>
        </div>
        <div className="flex gap-3">
          {pendingOrders > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-200 text-sm font-medium shadow-sm">
              <AlertCircle className="w-4 h-4" />
              {pendingOrders} Pending Payments
            </div>
          )}
          {processingOrders > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 text-sm font-medium shadow-sm">
              <Clock className="w-4 h-4" />
              {processingOrders} Orders to Ship
            </div>
          )}
        </div>
      </div>
      
      {/* Premium Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <DollarSign className="w-16 h-16 text-gray-900" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                <ArrowUpRight className="w-3 h-3 mr-1" /> {revGrowth}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium tracking-wide">Total Revenue</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ShoppingCart className="w-16 h-16 text-gray-900" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                <ArrowUpRight className="w-3 h-3 mr-1" /> {orderGrowth}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium tracking-wide">Total Orders</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{orderCount || 0}</h3>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Package className="w-16 h-16 text-gray-900" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                <ArrowUpRight className="w-3 h-3 mr-1" /> {productGrowth}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium tracking-wide">Active Products</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{productCount || 0}</h3>
          </div>
        </div>

        {/* Conversion Rate (Mocked for premium feel) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-16 h-16 text-gray-900" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <span className="flex items-center text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full border border-rose-100">
                <ArrowDownRight className="w-3 h-3 mr-1" /> -1.2%
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium tracking-wide">Conversion Rate</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">3.4%</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Sales Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Revenue Overview</h2>
              <p className="text-sm text-gray-500">Sales performance over the last 7 days</p>
            </div>
            <select className="text-sm border-gray-300 rounded-md bg-gray-50 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          
          <div className="flex-1 flex items-end gap-2 mt-4 relative h-48">
            {/* CSS Bar Chart Simulation */}
            <div className="absolute w-full border-t border-gray-100 top-0"></div>
            <div className="absolute w-full border-t border-gray-100 top-1/4"></div>
            <div className="absolute w-full border-t border-gray-100 top-2/4"></div>
            <div className="absolute w-full border-t border-gray-100 top-3/4"></div>
            <div className="absolute w-full border-t border-gray-900 bottom-0"></div>
            
            <div className="flex-1 flex flex-col items-center justify-end gap-2 group z-10 h-[40%]">
              <div className="w-full bg-blue-100 rounded-t-md group-hover:bg-blue-200 transition-colors relative h-full">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded transition-opacity">₹12k</div>
              </div>
              <span className="text-xs text-gray-500 font-medium">Mon</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-end gap-2 group z-10 h-[65%]">
              <div className="w-full bg-accent rounded-t-md group-hover:bg-accent/90 transition-colors relative h-full shadow-[0_0_15px_rgba(200,169,110,0.4)]">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded transition-opacity">₹19k</div>
              </div>
              <span className="text-xs text-gray-900 font-bold">Tue</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-end gap-2 group z-10 h-[30%]">
              <div className="w-full bg-blue-100 rounded-t-md group-hover:bg-blue-200 transition-colors relative h-full">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded transition-opacity">₹9k</div>
              </div>
              <span className="text-xs text-gray-500 font-medium">Wed</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-end gap-2 group z-10 h-[50%]">
              <div className="w-full bg-blue-100 rounded-t-md group-hover:bg-blue-200 transition-colors relative h-full">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded transition-opacity">₹15k</div>
              </div>
              <span className="text-xs text-gray-500 font-medium">Thu</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-end gap-2 group z-10 h-[80%]">
              <div className="w-full bg-blue-100 rounded-t-md group-hover:bg-blue-200 transition-colors relative h-full">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded transition-opacity">₹24k</div>
              </div>
              <span className="text-xs text-gray-500 font-medium">Fri</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-end gap-2 group z-10 h-[45%]">
              <div className="w-full bg-blue-100 rounded-t-md group-hover:bg-blue-200 transition-colors relative h-full">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded transition-opacity">₹14k</div>
              </div>
              <span className="text-xs text-gray-500 font-medium">Sat</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-end gap-2 group z-10 h-[60%]">
              <div className="w-full bg-blue-100 rounded-t-md group-hover:bg-blue-200 transition-colors relative h-full">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded transition-opacity">₹18k</div>
              </div>
              <span className="text-xs text-gray-500 font-medium">Sun</span>
            </div>
          </div>
        </div>

        {/* Top Performing Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Top Products</h2>
            <Link href="/admin/products" className="text-sm font-medium text-accent hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {/* Mocked Top Products for UI Premiumness */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">Premium Linen Shirt {i}</p>
                  <p className="text-xs text-gray-500 truncate">45 Sales this week</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">₹{45 * 1999}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <p className="text-sm text-gray-500">Latest transactions from your store</p>
          </div>
          <Link href="/admin/orders" className="text-sm font-medium bg-white border border-gray-200 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            View All Orders
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">#{order.id.split('-')[0].toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                          {order.user_id?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="text-gray-700 font-medium truncate max-w-[120px]">{order.user_id.split('-')[0]}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' :
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 text-right">₹{order.total_amount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/orders/${order.id}`} className="text-accent hover:text-accent/80 font-medium underline-offset-4 hover:underline">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 bg-gray-50/50">
                    <div className="flex flex-col items-center justify-center">
                      <ShoppingCart className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-lg font-medium text-gray-900">No recent orders found</p>
                      <p className="text-sm mt-1">Your latest sales will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
