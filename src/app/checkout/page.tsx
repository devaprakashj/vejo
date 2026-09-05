// @ts-nocheck
/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import {
  ChevronLeft, ShieldCheck, CheckCircle2, Truck, Tag,
  CreditCard, Banknote, AlertCircle, Loader2, Package, Lock
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Script from 'next/script';
import * as fpixel from '@/lib/fpixel';

const PREPAID_DISCOUNT_PERCENT = 5;
type PaymentMethod = 'prepaid' | 'cod';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh'
];

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();
  const { items, clearCart } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('prepaid');

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    addressLine1: '', addressLine2: '', city: '', state: '', pincode: ''
  });

  useEffect(() => {
    setMounted(true);
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setFormData(prev => ({ ...prev, email: user.email || '' }));
      }
    };
    checkUser();
    fpixel.event('InitiateCheckout');
  }, [supabase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const prepaidDiscount = paymentMethod === 'prepaid' ? Math.round(subtotal * PREPAID_DISCOUNT_PERCENT / 100) : 0;
  const total = subtotal - prepaidDiscount;

  const deliveryDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + (d.getHours() < 14 ? 2 : 3));
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
  })();

  const handleCODOrder = async () => {
    if (!userId) { router.push('/login?redirect=/checkout'); return; }
    setIsProcessing(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, formData, totalAmount: total, paymentMethod: 'cod' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');
      clearCart();
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      fpixel.event('Purchase', { value: total, currency: 'INR', payment_method: 'COD' });
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrepaidPayment = async () => {
    if (!userId) { router.push('/login?redirect=/checkout'); return; }
    setIsProcessing(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, formData, totalAmount: total, paymentMethod: 'prepaid' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize payment');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "VEJO STUDIO",
        description: "Premium Essentials",
        order_id: data.id,
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              supabaseOrderId: data.supabaseOrderId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            fpixel.event('Purchase', { value: total, currency: 'INR' });
            clearCart();
            setIsSuccess(true);
            setIsProcessing(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            alert("Payment verification failed. Please contact support.");
            setIsProcessing(false);
          }
        },
        prefill: { name: `${formData.firstName} ${formData.lastName}`, email: formData.email, contact: formData.phone },
        theme: { color: "#111827" },
        modal: { ondismiss: () => setIsProcessing(false) }
      };
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r: any) => { alert("Payment failed: " + r.error.description); setIsProcessing(false); });
      rzp.open();
    } catch (error: any) {
      alert("Error: " + error.message);
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    paymentMethod === 'cod' ? handleCODOrder() : handlePrepaidPayment();
  };

  if (!mounted) return null;

  // ── Success Screen ──────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Order Confirmed!</h1>
          <p className="text-sm text-gray-500 text-center mb-8">
            {paymentMethod === 'cod'
              ? 'Your order is placed. We\'ll send updates on your phone.'
              : 'Payment received! Your order is being processed.'}
          </p>

          {/* Receipt card */}
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 mb-6 overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4">
              <span className="text-sm text-gray-500">Payment</span>
              <span className="text-sm font-semibold text-gray-900">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</span>
            </div>
            <div className="flex justify-between items-center px-5 py-4">
              <span className="text-sm text-gray-500">Estimated Delivery</span>
              <span className="text-sm font-semibold text-gray-900">{deliveryDate}</span>
            </div>
            <div className="flex justify-between items-center px-5 py-4">
              <span className="text-sm text-gray-500">Total Paid</span>
              <span className="text-base font-bold text-gray-900">₹{total.toLocaleString()}</span>
            </div>
          </div>

          <Link href="/account/orders" className="block w-full text-center py-4 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors mb-3">
            Track My Order
          </Link>
          <Link href="/" className="block w-full text-center py-3.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ── Main Checkout ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
        <span className="font-serif font-bold text-gray-900 text-xl tracking-widest">VEJO</span>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Lock className="w-3.5 h-3.5" />
          <span>Secure</span>
        </div>
      </header>

      {/* Not logged in banner */}
      {mounted && !userId && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            You must <Link href="/login?redirect=/checkout" className="font-bold underline">log in</Link> to place an order.
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-57px)]">

          {/* ──── LEFT COLUMN ──────────────────── */}
          <div className="w-full lg:w-[55%] bg-white border-r border-gray-100 px-6 sm:px-10 lg:px-16 py-8 space-y-6">

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Section 1 — Contact */}
              <section className="bg-white rounded-2xl overflow-hidden border border-gray-200/70">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <h2 className="font-semibold text-gray-900 text-sm">Contact Information</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">First Name *</label>
                      <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                        placeholder="Ravi"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5 transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Last Name *</label>
                      <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                        placeholder="Kumar"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5 transition-all bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Email Address *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange}
                      placeholder="you@email.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5 transition-all bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone Number *</label>
                    <div className="flex">
                      <span className="px-4 py-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500 font-medium">+91</span>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                        placeholder="9876543210" maxLength={10} pattern="[0-9]{10}"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5 transition-all bg-white" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 ml-1">Delivery updates will be sent here</p>
                  </div>
                </div>
              </section>

              {/* Section 2 — Address */}
              <section className="bg-white rounded-2xl overflow-hidden border border-gray-200/70">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                    <h2 className="font-semibold text-gray-900 text-sm">Delivery Address</h2>
                  </div>
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Free Delivery
                  </span>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">House / Flat / Block No., Street *</label>
                    <input required type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange}
                      placeholder="e.g. 12B, Gandhi Street, Anna Nagar"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5 transition-all bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Landmark <span className="font-normal text-gray-400">(optional)</span></label>
                    <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange}
                      placeholder="e.g. Near Big Bazaar"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5 transition-all bg-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">PIN Code *</label>
                      <input required type="text" name="pincode" value={formData.pincode} onChange={handleInputChange}
                        placeholder="600001" maxLength={6} pattern="[0-9]{6}"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5 transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">City / Town *</label>
                      <input required type="text" name="city" value={formData.city} onChange={handleInputChange}
                        placeholder="Chennai"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5 transition-all bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">State *</label>
                    <select required name="state" value={formData.state} onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5 transition-all bg-white appearance-none"
                      style={{ color: formData.state ? '#111827' : '#9ca3af' }}>
                      <option value="" disabled>Select your state</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s} style={{ color: '#111827' }}>{s}</option>)}
                    </select>
                  </div>

                  {/* Delivery estimate */}
                  <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                    <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <p className="text-xs text-green-800">
                      <span className="font-semibold">Free delivery</span> · Estimated by <span className="font-semibold">{deliveryDate}</span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3 — Payment */}
              <section className="bg-white rounded-2xl overflow-hidden border border-gray-200/70">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <h2 className="font-semibold text-gray-900 text-sm">Payment Method</h2>
                </div>
                <div className="p-6">
                  {/* Toggle */}
                  <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
                    <button type="button" onClick={() => setPaymentMethod('prepaid')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${paymentMethod === 'prepaid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                      <CreditCard className="w-4 h-4" />
                      Pay Online
                      <span className="text-[10px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full leading-none">5% OFF</span>
                    </button>
                    <button type="button" onClick={() => setPaymentMethod('cod')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${paymentMethod === 'cod' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                      <Banknote className="w-4 h-4" />
                      Cash on Delivery
                    </button>
                  </div>

                  {paymentMethod === 'prepaid' ? (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500">Choose from UPI, Debit/Credit Cards, or Net Banking</p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-5 object-contain opacity-80" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-5 object-contain opacity-80" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-5 object-contain opacity-80" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-4 object-contain opacity-80" />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Pay in cash when your package is delivered. No advance payment required.
                    </p>
                  )}
                </div>
              </section>

              {/* CTA */}
              <button
                type="submit"
                disabled={isProcessing || items.length === 0 || !userId}
                className="w-full py-4 rounded-2xl text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                style={{ background: 'linear-gradient(135deg, #111827, #1f2937)', boxShadow: '0 4px 24px rgba(17,24,39,0.2)' }}
              >
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="relative">
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</span>
                  ) : paymentMethod === 'cod' ? (
                    `Confirm Order · ₹${total.toLocaleString()}`
                  ) : (
                    `Pay ₹${total.toLocaleString()} Securely`
                  )}
                </span>
              </button>

              <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5 pb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                256-bit SSL encrypted · Your data is safe
              </p>

            </form>
          </div>

          {/* ──── RIGHT COLUMN — Order Summary ──── */}
          <div className="w-full lg:w-[45%] bg-gray-50 border-l border-gray-100 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
            <div className="px-6 sm:px-10 lg:px-12 py-8">

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  Order Summary
                </h2>
                <Link href="/" className="text-xs text-gray-400 hover:text-gray-700 underline transition-colors">Edit cart</Link>
              </div>

              {/* Items */}
              {items.length === 0 ? (
                <p className="py-8 text-sm text-gray-400 text-center">Your cart is empty</p>
              ) : (
                <div className="space-y-5 mb-6">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="relative flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name}
                          className="w-16 h-20 object-cover rounded-xl border border-gray-200" />
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">{item.quantity}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 flex-shrink-0 ml-2">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="bg-white rounded-2xl p-5 space-y-3 border border-gray-200/70">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>

                {paymentMethod === 'prepaid' && prepaidDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Online discount</span>
                    <span>−₹{prepaidDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>

                <div className="flex justify-between font-bold text-gray-900 text-base pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Savings callout */}
              {paymentMethod === 'prepaid' && prepaidDiscount > 0 && (
                <div className="mt-4 text-center text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl py-3 font-medium">
                  🎉 You save ₹{prepaidDiscount.toLocaleString()} by paying online!
                </div>
              )}

              {/* Delivery chip */}
              <div className="mt-4 flex items-center gap-2.5 text-xs text-gray-500 bg-white rounded-xl px-4 py-3 border border-gray-200/70">
                <Truck className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                <span>Free delivery · Est. by <span className="font-semibold text-gray-700">{deliveryDate}</span></span>
              </div>

              {/* Trust */}
              <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Secure Payments</span>
              </div>

            </div>
          </div>

        </div>
    </div>
  );
}
