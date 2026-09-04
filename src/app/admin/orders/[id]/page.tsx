'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, Copy, CheckCircle2, Truck, Package, Save } from 'lucide-react';
import Image from 'next/image';
import { updateOrderFulfillment } from '../actions';

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Form State
  const [status, setStatus] = useState('Pending');
  const [meeshoId, setMeeshoId] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  const supabase = createClient();

  useEffect(() => {
    const fetchOrder = async () => {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .single();
        
      if (orderData) {
        setOrder(orderData);
        setStatus(orderData.status);
        setMeeshoId(orderData.meesho_order_id || '');
        setTrackingId(orderData.tracking_id || '');
        setTrackingUrl(orderData.tracking_url || '');
      }

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*, products(*)')
        .eq('order_id', params.id);
        
      if (itemsData) setItems(itemsData);
      setLoading(false);
    };

    fetchOrder();
  }, [params.id, supabase]);

  const copyAddress = () => {
    if (!order?.shipping_address) return;
    
    // Format address for easy pasting into Meesho
    const addr = order.shipping_address;
    const formattedAddress = `${addr.fullName}\n${addr.phone}\n${addr.addressLine1}\n${addr.addressLine2 ? addr.addressLine2 + '\n' : ''}${addr.city}, ${addr.state} ${addr.pincode}`;
    
    navigator.clipboard.writeText(formattedAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const result = await updateOrderFulfillment(order.id, {
      status,
      meesho_order_id: meeshoId,
      tracking_id: trackingId,
      tracking_url: trackingUrl
    });
      
    if (result.success) {
      alert('Order updated successfully!');
    } else {
      alert('Error updating order: ' + result.error);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading order details...</div>;
  if (!order) return <div className="p-12 text-center text-red-500">Order not found</div>;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orders" className="text-gray-500 hover:text-black bg-white p-2 rounded-full shadow-sm border border-gray-200">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 flex items-center gap-3">
            Order #{order.id.split('-')[0]}
            <span className="px-3 py-1 rounded-full text-xs font-sans font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              {status}
            </span>
          </h1>
          <p className="text-gray-500 mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Items and Customer */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">Items Ordered</h2>
            </div>
            <div className="p-6 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
                    {item.products?.image_url && (
                      <Image src={item.products.image_url} alt="Product" fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.products?.name}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right font-medium">
                    ₹{(item.price_at_time * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
              <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-accent">₹{order.total_amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Customer Details to Copy for Meesho */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative border-l-4 border-l-accent">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Customer Shipping Details</h2>
              <button 
                onClick={copyAddress}
                className="flex items-center gap-2 text-sm font-medium text-accent hover:text-black transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied to Clipboard' : 'Copy for Meesho'}
              </button>
            </div>
            <div className="p-6 bg-gray-50">
              <div className="bg-white p-4 rounded border border-gray-200 font-mono text-sm leading-relaxed text-gray-700 select-all">
                {order.shipping_address?.fullName}<br/>
                {order.shipping_address?.phone}<br/>
                {order.shipping_address?.addressLine1}<br/>
                {order.shipping_address?.addressLine2 && <>{order.shipping_address.addressLine2}<br/></>}
                {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pincode}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                <strong className="text-gray-700">User ID:</strong> {order.user_id.split('-')[0]}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Fulfillment */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-24">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2 bg-gray-50">
              <Truck className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">Fulfillment</h2>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Meesho Order ID</label>
                <input 
                  type="text" 
                  value={meeshoId}
                  onChange={(e) => setMeeshoId(e.target.value)}
                  placeholder="e.g. 847291038"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking ID (AWB)</label>
                <input 
                  type="text" 
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. XPRESS12345"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking URL</label>
                <input 
                  type="url" 
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://track..."
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Customers will see a "Track Order" button with this link.</p>
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-accent text-white px-4 py-2.5 rounded-md font-medium text-sm flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors disabled:opacity-50 mt-6"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Fulfillment Details'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
