'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Clock, Package, Truck, CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
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
    switch(status) {
      case 'Pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Processing': return <Package className="w-4 h-4 text-blue-600" />;
      case 'Shipped': return <Truck className="w-4 h-4 text-purple-600" />;
      case 'Delivered': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Cancelled': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

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

  const getNextAction = (status: string) => {
    switch(status) {
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
      // Optimistic update
      setOrders(orders.map(o => o.id === order.id ? { ...o, status: nextStatus } : o));
      router.refresh();
    } else {
      alert('Failed to update order status');
    }
    setLoadingAction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Orders</h1>
        
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
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => {
            const action = getNextAction(order.status);
            
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row gap-4 md:items-center transition-all hover:shadow-md">
                
                {/* Status Indicator (Mobile friendly) */}
                <div className="flex items-center gap-3 md:w-48">
                  <div className={`p-2 rounded-full ${getStatusColor(order.status).split(' ')[0]}`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      #{order.id.split('-')[0]}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900">{order.shipping_address?.fullName || 'Unknown Customer'}</h3>
                  <div className="text-xs text-gray-500 mt-1 flex flex-col sm:flex-row sm:gap-4">
                    <span>{new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{order.shipping_address?.phone || 'No phone'}</span>
                  </div>
                </div>

                {/* Amount */}
                <div className="md:text-right flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end">
                  <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Total</span>
                  <span className="text-lg font-bold text-gray-900">₹{order.total_amount.toLocaleString('en-IN')}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <Link href={`/admin/orders/${order.id}`} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                    <Eye className="w-4 h-4" /> <span className="md:hidden">View</span>
                  </Link>
                  
                  {action && (
                    <button 
                      onClick={() => handleQuickAction(order, action.nextStatus)}
                      disabled={loadingAction === order.id}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-70 ${action.color}`}
                    >
                      {loadingAction === order.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {action.label} <ArrowRight className="w-4 h-4" />
                        </>
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
