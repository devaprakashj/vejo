'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingCart, Users, DollarSign, TrendingUp, AlertCircle, ArrowUpRight,
  Clock, Package, CheckCircle, Truck, Calendar, BarChart2
} from 'lucide-react';

type Order = {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  shipping_address: any;
  cart_items: any[];
  user_id: string;
};

type DateRange = 'today' | '7days' | '30days' | 'all';

function getDateRange(range: DateRange): Date | null {
  const now = new Date();
  switch (range) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case '7days':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30days':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

export default function DashboardClient({ allOrders, productCount }: { allOrders: Order[], productCount: number }) {
  const [dateRange, setDateRange] = useState<DateRange>('7days');

  const filteredOrders = useMemo(() => {
    const cutoff = getDateRange(dateRange);
    if (!cutoff) return allOrders;
    return allOrders.filter(o => new Date(o.created_at) >= cutoff!);
  }, [allOrders, dateRange]);

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const pendingOrders = allOrders.filter(o => o.status === 'Pending').length;
  const processingOrders = allOrders.filter(o => o.status === 'Processing').length;
  const shippedOrders = allOrders.filter(o => o.status === 'Shipped').length;

  // Previous period for growth calculation
  const prevOrders = useMemo(() => {
    const cutoff = getDateRange(dateRange);
    if (!cutoff) return [];
    const durationMs = new Date().getTime() - cutoff.getTime();
    const prevStart = new Date(cutoff.getTime() - durationMs);
    return allOrders.filter(o => {
      const d = new Date(o.created_at);
      return d >= prevStart && d < cutoff;
    });
  }, [allOrders, dateRange]);

  const prevRevenue = prevOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : null;

  // Chart: last 7 or 30 days buckets
  const chartData = useMemo(() => {
    const days = dateRange === 'today' ? 24 : dateRange === '30days' ? 30 : 7;
    const isHourly = dateRange === 'today';
    const buckets: { label: string; revenue: number }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      if (isHourly) {
        const hour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - i);
        buckets.push({ label: `${hour.getHours()}:00`, revenue: 0 });
      } else {
        const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        buckets.push({ label: day.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }), revenue: 0 });
      }
    }

    filteredOrders.forEach(order => {
      const d = new Date(order.created_at);
      let idx = -1;
      if (isHourly) {
        idx = buckets.findIndex(b => b.label === `${d.getHours()}:00`);
      } else {
        const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
        idx = buckets.findIndex(b => b.label === label);
      }
      if (idx !== -1) {
        buckets[idx].revenue += order.total_amount;
      }
    });
    return buckets;
  }, [filteredOrders, dateRange]);

  const maxRevenue = Math.max(...chartData.map(b => b.revenue), 1);

  // Top Products: extract from cart_items
  const topProducts = useMemo(() => {
    const productMap = new Map<string, { name: string; count: number; revenue: number }>();
    filteredOrders.forEach(order => {
      const items = Array.isArray(order.cart_items) ? order.cart_items : [];
      items.forEach((item: any) => {
        const name = item.name || item.title || 'Unknown Product';
        const key = item.id || name;
        if (!productMap.has(key)) {
          productMap.set(key, { name, count: 0, revenue: 0 });
        }
        const p = productMap.get(key)!;
        p.count += item.quantity || 1;
        p.revenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    return Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [filteredOrders]);

  const recentOrders = allOrders.slice(0, 6);

  const statusColors: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Processing: 'bg-blue-100 text-blue-800',
    Shipped: 'bg-purple-100 text-purple-800',
    Delivered: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
  };

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your store.</p>
        </div>
        {/* Date Filter */}
        <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm overflow-x-auto gap-1">
          {dateRangeOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDateRange(opt.value as DateRange)}
              className={`flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                dateRange === opt.value
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Alerts */}
      {(pendingOrders > 0 || processingOrders > 0 || shippedOrders > 0) && (
        <div className="flex flex-wrap gap-3">
          {pendingOrders > 0 && (
            <Link href="/admin/orders" className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-200 text-sm font-medium shadow-sm hover:bg-amber-100 transition-colors">
              <AlertCircle className="w-4 h-4" /> {pendingOrders} Pending Orders
            </Link>
          )}
          {processingOrders > 0 && (
            <Link href="/admin/orders" className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 text-sm font-medium shadow-sm hover:bg-blue-100 transition-colors">
              <Clock className="w-4 h-4" /> {processingOrders} To Ship
            </Link>
          )}
          {shippedOrders > 0 && (
            <Link href="/admin/orders" className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg border border-purple-200 text-sm font-medium shadow-sm hover:bg-purple-100 transition-colors">
              <Truck className="w-4 h-4" /> {shippedOrders} Out for Delivery
            </Link>
          )}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            {revenueGrowth !== null && (
              <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
                parseFloat(revenueGrowth) >= 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                <ArrowUpRight className="w-3 h-3 mr-1" /> {revenueGrowth}%
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Revenue</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</h3>
        </div>

        {/* Orders */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Orders</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalOrders}</h3>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Avg Order</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{Math.round(avgOrderValue).toLocaleString('en-IN')}</h3>
        </div>

        {/* Products */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Products</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{productCount || 0}</h3>
        </div>
      </div>

      {/* Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-accent" /> Revenue Chart
              </h2>
              <p className="text-xs text-gray-500 mt-1">Based on your selected filter</p>
            </div>
            <span className="text-sm font-medium text-accent">₹{totalRevenue.toLocaleString('en-IN')}</span>
          </div>

          {totalRevenue === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400">
              <BarChart2 className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">No revenue data for this period</p>
            </div>
          ) : (
            <div className="flex items-end gap-1 h-48 overflow-x-auto pb-1">
              {chartData.map((bucket, i) => {
                const heightPct = (bucket.revenue / maxRevenue) * 100;
                return (
                  <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1 group" style={{ minWidth: `${Math.max(28, 100 / chartData.length)}px` }}>
                    <div className="relative w-full" style={{ height: '168px', display: 'flex', alignItems: 'flex-end' }}>
                      <div
                        className={`w-full rounded-t-md transition-all ${bucket.revenue > 0 ? 'bg-accent hover:bg-accent/80' : 'bg-gray-100'}`}
                        style={{ height: `${Math.max(heightPct, 2)}%` }}
                      >
                        {bucket.revenue > 0 && (
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 transition-opacity">
                            ₹{bucket.revenue.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[9px] text-gray-400 font-medium rotate-45 origin-left truncate max-w-[32px]">{bucket.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-accent" /> Top Products
          </h2>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.count} sold</p>
                  </div>
                  <p className="text-sm font-bold text-emerald-600">₹{p.revenue.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <Package className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No product data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', icon: <AlertCircle className="w-4 h-4" />, count: allOrders.filter(o => o.status === 'Pending').length, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
          { label: 'Processing', icon: <Clock className="w-4 h-4" />, count: allOrders.filter(o => o.status === 'Processing').length, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Shipped', icon: <Truck className="w-4 h-4" />, count: allOrders.filter(o => o.status === 'Shipped').length, color: 'bg-purple-50 text-purple-700 border-purple-200' },
          { label: 'Delivered', icon: <CheckCircle className="w-4 h-4" />, count: allOrders.filter(o => o.status === 'Delivered').length, color: 'bg-green-50 text-green-700 border-green-200' },
        ].map(({ label, icon, count, color }) => (
          <Link href="/admin/orders" key={label} className={`flex items-center gap-3 p-4 rounded-xl border shadow-sm ${color} hover:opacity-80 transition-opacity`}>
            {icon}
            <div>
              <p className="text-xs font-medium opacity-70">{label}</p>
              <p className="text-xl font-bold">{count}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-accent hover:underline">View All →</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentOrders.length > 0 ? (
            recentOrders.map(order => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                    {(order.shipping_address?.fullName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{order.shipping_address?.fullName || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold hidden sm:inline-flex ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-bold text-gray-900">₹{order.total_amount.toLocaleString('en-IN')}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p>No orders yet. Your latest sales will appear here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
