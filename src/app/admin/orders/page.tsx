// @ts-nocheck
/* eslint-disable */
import React from 'react';
import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Eye, ExternalLink } from 'lucide-react';

export default async function AdminOrdersPage() {
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

  // Fetch orders with user emails
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Orders</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-6 py-4">Order ID</th>
              <th scope="col" className="px-6 py-4">Customer</th>
              <th scope="col" className="px-6 py-4">Date</th>
              <th scope="col" className="px-6 py-4">Total</th>
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4">Meesho ID</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-900">
                    {order.id.split('-')[0]}...
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {order.shipping_address?.fullName || 'Unknown Customer'}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    ₹{order.total_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {order.meesho_order_id ? (
                      <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {order.meesho_order_id}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1 text-accent hover:underline text-sm font-medium">
                      <Eye className="w-4 h-4" /> View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

