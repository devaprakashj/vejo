'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Clock, Package, Truck, CheckCircle, XCircle, ArrowRight, Loader2, Banknote, CreditCard, ExternalLink } from 'lucide-react';
import { updateOrderFulfillment } from './actions';
import { useRouter } from 'next/navigation';

export default function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [activeTab, setActiveTab] = useState('All');
  const [orders, setOrders] = useState(initialOrders);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const router = useRouter();

  const tabs = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const filteredOrders = activeTab === 'All'
    ? orders
    : orders.filter(o => o.status === activeTab);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Processing': return <Package className="w-4 h-4 text-blue-600" />;
      case 'Shipped': return <Truck className="w-4 h-4 text-purple-600" />;
      case 'Delivered': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Cancelled': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNextAction = (status: string) => {
    switch (status) {
      case 'Pending': return { label: 'Start Processing', nextStatus: 'Processing', color: 'bg-blue-600 hover:bg-blue-700' };
      case 'Processing': return { label: 'Mark as Shipped', nextStatus: 'Shipped', color: 'bg-purple-600 hover:bg-purple-700' };
      case 'Shipped': return { label: 'Mark as Delivered', nextStatus: 'Delivered', color: 'bg-green-600 hover:bg-green-700' };
      default: return null;
    }
  };

  const handleQuickAction = async (order: any, nextStatus: string) => {
    setLoadingAction(order.id);
    const res = await updateOrderFulfillment(order.id, {
      status: nextStatus,
      meesho_order_id: order.meesho_order_id || '',
      tracking_id: order.tracking_id || '',
      tracking_url: order.tracking_url || ''
    });

    if (res.success) {
      setOrders(orders.map(o => o.id === order.id ? { ...o, status: nextStatus } : o));
      router.refresh();
    } else {
      alert('Failed to update order status');
    }
    setLoadingAction(null);
  };

  // Meesho deep link builder
  const getMeeshoLink = (order: any) => {
    const addr = order.shipping_address || {};
    const params = new URLSearchParams({
      name: addr.fullName || '',
      phone: addr.phone || '',
      address: addr.addressLine1 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
    });
    return `https://supplier.meesho.com/listings?${params.toString()}`;
  };

  // Payment method helpers
  const getPaymentBadge = (order: any) => {
    const method = order.payment_method;
    const status = order.payment_status;
    if (method === 'cod') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 border border-orange-200 rounded-full text-[10px] font-bold uppercase tracking-wide">
          <Banknote className="w-3 h-3" /> COD
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
        status === 'Paid' || status === 'paid'
          ? 'bg-green-100 text-green-700 border-green-200'
          : 'bg-blue-100 text-blue-700 border-blue-200'
      }`}>
        <CreditCard className="w-3 h-3" />
        {status === 'Paid' || status === 'paid' ? 'Paid Online' : 'Online'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            {orders.length} total · COD: {orders.filter(o => o.payment_method === 'cod').length} · Online: {orders.filter(o => o.payment_method !== 'cod').length}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar bg-white rounded-lg p-1 border border-gray-200 shadow-sm w-full md:w-auto">
          {tabs.map(tab => {
            const count = tab === 'All' ? orders.length : orders.filter(o => o.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                  activeTab === tab
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {tab}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => {
            const action = getNextAction(order.status);
            const canOrderMeesho = order.status === 'Pending' || order.status === 'Processing';

            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row gap-4 md:items-center transition-all hover:shadow-md">

                {/* Status */}
                <div className="flex items-center gap-3 md:w-44">
                  <div className={`p-2 rounded-full ${getStatusColor(order.status).split(' ')[0]}`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1 font-mono">#{order.id.split('-')[0]}</p>
                  </div>
                </div>

                {/* Customer + Date */}
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900">{order.shipping_address?.fullName || 'Unknown'}</h3>
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span>{new Date(order.created_at).toLocaleDateString('en-IN')} · {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>{order.shipping_address?.phone || '—'}</span>
                    <span className="text-gray-400">{order.shipping_address?.city || ''}{order.shipping_address?.state ? `, ${order.shipping_address.state}` : ''}</span>
                  </div>
                </div>

                {/* Amount + Payment */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-1">
                  <span className="text-lg font-bold text-gray-900">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                  {getPaymentBadge(order)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* View */}
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </Link>

                  {/* Order on Meesho */}
                  {canOrderMeesho && (
                    <a
                      href="https://supplier.meesho.com/listings"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-medium rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Meesho
                    </a>
                  )}

                  {/* Status Advance */}
                  {action && (
                    <button
                      onClick={() => handleQuickAction(order, action.nextStatus)}
                      disabled={loadingAction === order.id}
                      className={`flex items-center gap-1.5 px-3 py-2 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-70 ${action.color}`}
                    >
                      {loadingAction === order.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>{action.label} <ArrowRight className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  )}
                </div>

              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
            <p className="text-gray-500 mt-1">There are no orders in the '{activeTab}' section right now.</p>
          </div>
        )}
      </div>

    </div>
  );
}
