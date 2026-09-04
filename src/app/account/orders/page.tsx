import { createClient } from '@/utils/supabase/server';
import { Package, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default async function AccountOrdersPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Fetch orders for this user
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'text-yellow-600 bg-yellow-50';
      case 'Processing': return 'text-blue-600 bg-blue-50';
      case 'Shipped': return 'text-purple-600 bg-purple-50';
      case 'Delivered': return 'text-green-600 bg-green-50';
      case 'Cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white p-8 border border-surfaceBorder rounded-sm shadow-sm">
      <h2 className="text-xl font-serif mb-6">Recent Orders</h2>
      
      {orders && orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-surfaceBorder rounded-lg overflow-hidden">
              <div className="bg-[#fcfcfc] px-6 py-4 border-b border-surfaceBorder flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-xs text-textSecondary uppercase tracking-widest mb-1">Order Placed</p>
                  <p className="font-medium text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-textSecondary uppercase tracking-widest mb-1">Total</p>
                  <p className="font-medium text-sm">₹{order.total_amount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-textSecondary uppercase tracking-widest mb-1">Order #</p>
                  <p className="font-medium text-sm font-mono">{order.id.split('-')[0]}</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      Status: <span className={`px-2 py-1 rounded text-sm ${getStatusColor(order.status)}`}>{order.status}</span>
                    </h3>
                    {order.status === 'Shipped' && order.tracking_url && (
                      <a 
                        href={order.tracking_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:underline mt-2"
                      >
                        Track Package <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden border border-surfaceBorder flex-shrink-0 relative">
                        {item.products?.image_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.products.image_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Link href={`/products/${item.products?.id}`} className="font-semibold hover:text-accent transition-colors">
                          {item.products?.name}
                        </Link>
                        <p className="text-sm text-textSecondary mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-bold">
                        ₹{(item.price_at_time * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface rounded-sm border border-dashed border-gray-300">
          <Package className="w-8 h-8 mx-auto text-gray-400 mb-3" />
          <p className="text-textSecondary">You haven't placed any orders yet.</p>
          <Link href="/products" className="inline-block mt-4 text-sm font-bold uppercase tracking-widest text-accent hover:underline">
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
