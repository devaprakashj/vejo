import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Users, Mail, Phone, Calendar, ShoppingBag, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default async function CustomersPage() {
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

  // Fetch all orders to aggregate customer data
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  // Aggregate customers
  const customersMap = new Map();

  if (orders) {
    orders.forEach((order) => {
      const email = order.shipping_address?.email || 'Unknown Email';
      if (!customersMap.has(email)) {
        customersMap.set(email, {
          name: order.shipping_address?.fullName || 'Unknown Customer',
          email: email,
          phone: order.shipping_address?.phone || 'N/A',
          totalSpent: 0,
          totalOrders: 0,
          lastOrderDate: order.created_at,
          ordersList: []
        });
      }
      
      const customer = customersMap.get(email);
      customer.totalSpent += order.total_amount;
      customer.totalOrders += 1;
      customer.ordersList.push(order.id);
      
      // Update last order date if this order is newer
      if (new Date(order.created_at) > new Date(customer.lastOrderDate)) {
        customer.lastOrderDate = order.created_at;
      }
    });
  }

  const customers = Array.from(customersMap.values());

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-accent" />
            Customers
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage and view your top buyers.</p>
        </div>
        
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-700">
          Total Customers: <span className="text-accent font-bold ml-1">{customers.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.length > 0 ? (
          customers.map((customer, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-gray-50 to-transparent rounded-bl-full -z-0 opacity-50 group-hover:from-blue-50 transition-colors"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" /> {customer.email}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" /> {customer.phone}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1 flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" /> Orders
                    </p>
                    <p className="text-xl font-bold text-gray-900">{customer.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> Total Spent
                    </p>
                    <p className="text-xl font-bold text-green-600">₹{customer.totalSpent.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Last order: {new Date(customer.lastOrderDate).toLocaleDateString()}
                  </div>
                  <Link href="/admin/orders" className="text-xs font-semibold text-accent hover:underline">
                    View Orders
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No customers yet</h3>
            <p className="text-gray-500 mt-1">When customers place orders, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
