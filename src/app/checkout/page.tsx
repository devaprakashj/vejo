// @ts-nocheck
/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { ChevronLeft, ShieldCheck, Zap, CheckCircle2, Truck, Tag, CreditCard, Banknote, AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Script from 'next/script';
import * as fpixel from '@/lib/fpixel';

const PREPAID_DISCOUNT_PERCENT = 5; // 5% off for online payment

type PaymentMethod = 'prepaid' | 'cod';

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();
  const { items, clearCart } = useCartStore();
  
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('prepaid');
  const [orderIdForSuccess, setOrderIdForSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
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
  const shipping = 0; // Always FREE
  const prepaidDiscount = paymentMethod === 'prepaid' ? Math.round(subtotal * PREPAID_DISCOUNT_PERCENT / 100) : 0;
  const total = subtotal - prepaidDiscount + shipping;

  const shippingAddress = {
    fullName: `${formData.firstName} ${formData.lastName}`,
    phone: formData.phone,
    email: formData.email,
    addressLine1: formData.addressLine1,
    addressLine2: formData.addressLine2,
    city: formData.city,
    state: formData.state,
    pincode: formData.pincode,
    country: 'India',
  };

  // COD Order Placement
  const handleCODOrder = async () => {
    if (!userId) {
      alert("Please log in to place an order.");
      router.push('/login?redirect=/checkout');
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          formData,
          totalAmount: total,
          paymentMethod: 'cod',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');
      
      setOrderIdForSuccess(data.supabaseOrderId);
      clearCart();
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      fpixel.event('Purchase', { value: total, currency: 'INR', payment_method: 'COD' });
    } catch (err: any) {
      alert('Error placing order: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Razorpay (Prepaid) Order
  const handlePrepaidPayment = async () => {
    if (!userId) {
      alert("Please log in to place an order.");
      router.push('/login?redirect=/checkout');
      return;
    }
    setIsProcessing(true);
    try {
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, formData, totalAmount: total, paymentMethod: 'prepaid' }),
      });
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkoutData.error || 'Failed to initialize payment');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: checkoutData.amount,
        currency: checkoutData.currency,
        name: "VEJO STUDIO",
        description: "Premium Essentials",
        order_id: checkoutData.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                supabaseOrderId: checkoutData.supabaseOrderId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              fpixel.event('Purchase', { value: total, currency: 'INR', order_id: response.razorpay_order_id });
              setIsProcessing(false);
              setIsSuccess(true);
              setOrderIdForSuccess(checkoutData.supabaseOrderId);
              clearCart();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              alert("Payment verification failed. Please contact support.");
              setIsProcessing(false);
            }
          } catch (err) {
            alert("An error occurred during verification.");
            setIsProcessing(false);
          }
        },
        prefill: { name: `${formData.firstName} ${formData.lastName}`, email: formData.email, contact: formData.phone },
        theme: { color: "#1e293b" },
        modal: { ondismiss: () => setIsProcessing(false) }
      };
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        alert("Payment Failed: " + response.error.description);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error: any) {
      alert("Error: " + error.message);
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (paymentMethod === 'cod') {
      handleCODOrder();
    } else {
      handlePrepaidPayment();
    }
  };

  if (!mounted) return null;

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-serif text-textPrimary mb-2">Order Confirmed! 🎉</h1>
          {paymentMethod === 'cod' ? (
            <p className="text-textSecondary mb-6 leading-relaxed">
              Your COD order is placed! Our team will dispatch it shortly. You'll receive a confirmation message on your phone.
            </p>
          ) : (
            <p className="text-textSecondary mb-6 leading-relaxed">
              Payment successful! Your order is being prepared for dispatch. Thank you for shopping with VEJO Studio.
            </p>
          )}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-left border border-gray-100">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-semibold">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (Prepaid)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount</span>
              <span className="font-bold text-accent">₹{total.toLocaleString()}</span>
            </div>
          </div>
          <Link href="/account/orders" className="inline-block w-full px-8 py-3 bg-accent text-white font-bold tracking-widest uppercase text-sm rounded-lg hover:bg-opacity-90 transition-colors">
            Track My Order →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="container-custom py-6 border-b border-surfaceBorder mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary hover:text-accent transition-colors">
          <ChevronLeft className="w-4 h-4" /> Return to Store
        </Link>
      </div>

      <div className="container-custom">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left: Form */}
          <div className="w-full lg:w-3/5">
            <div className="bg-white border border-surfaceBorder rounded-2xl p-6 md:p-8 shadow-sm">
              <h1 className="text-2xl font-serif mb-6">Checkout Securely</h1>
              
              {!userId && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Wait!</strong> You must be logged in to place an order. <Link href="/login" className="underline font-bold">Log in here</Link>.</span>
                </div>
              )}

              {/* Free Shipping Banner */}
              <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">🎉 Free Delivery All Over India! No minimum order value.</span>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Info */}
                <div>
                  <h2 className="text-sm font-bold tracking-widest uppercase text-textSecondary mb-4">1. Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" className="w-full p-3.5 border border-surfaceBorder rounded-lg bg-[#fafafa] focus:outline-none focus:border-accent transition-colors" />
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" className="w-full p-3.5 border border-surfaceBorder rounded-lg bg-[#fafafa] focus:outline-none focus:border-accent transition-colors" />
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" className="w-full p-3.5 border border-surfaceBorder rounded-lg bg-[#fafafa] focus:outline-none focus:border-accent transition-colors md:col-span-2" />
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone Number (for delivery updates)" className="w-full p-3.5 border border-surfaceBorder rounded-lg bg-[#fafafa] focus:outline-none focus:border-accent transition-colors md:col-span-2" maxLength={10} />
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="pt-6 border-t border-surfaceBorder">
                  <h2 className="text-sm font-bold tracking-widest uppercase text-textSecondary mb-4">2. Shipping Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input required type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} placeholder="Street Address, House No." className="w-full p-3.5 border border-surfaceBorder rounded-lg bg-[#fafafa] focus:outline-none focus:border-accent transition-colors md:col-span-2" />
                    <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} placeholder="Apartment, Landmark (optional)" className="w-full p-3.5 border border-surfaceBorder rounded-lg bg-[#fafafa] focus:outline-none focus:border-accent transition-colors md:col-span-2" />
                    <input required type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City / Town" className="w-full p-3.5 border border-surfaceBorder rounded-lg bg-[#fafafa] focus:outline-none focus:border-accent transition-colors" />
                    <input required type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="w-full p-3.5 border border-surfaceBorder rounded-lg bg-[#fafafa] focus:outline-none focus:border-accent transition-colors" />
                    <input required type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="PIN Code" maxLength={6} className="w-full p-3.5 border border-surfaceBorder rounded-lg bg-[#fafafa] focus:outline-none focus:border-accent transition-colors" />
                    <input type="text" value="India" disabled className="w-full p-3.5 border border-surfaceBorder rounded-lg bg-gray-100 text-textSecondary cursor-not-allowed" />
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="pt-6 border-t border-surfaceBorder">
                  <h2 className="text-sm font-bold tracking-widest uppercase text-textSecondary mb-4">3. Payment Method</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Prepaid Option */}
                    <label className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col gap-2 transition-all ${paymentMethod === 'prepaid' ? 'border-accent bg-accent/5 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value="prepaid" checked={paymentMethod === 'prepaid'} onChange={() => setPaymentMethod('prepaid')} className="sr-only" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className={`w-5 h-5 ${paymentMethod === 'prepaid' ? 'text-accent' : 'text-gray-400'}`} />
                          <span className="font-semibold text-sm">Online Payment</span>
                        </div>
                        {paymentMethod === 'prepaid' && <CheckCircle2 className="w-5 h-5 text-accent" />}
                      </div>
                      <p className="text-xs text-gray-500">UPI, Cards, Net Banking via Razorpay</p>
                      <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full w-fit text-xs font-bold">
                        <Tag className="w-3 h-3" />
                        {PREPAID_DISCOUNT_PERCENT}% Instant Discount!
                      </div>
                    </label>

                    {/* COD Option */}
                    <label className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col gap-2 transition-all ${paymentMethod === 'cod' ? 'border-accent bg-accent/5 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="sr-only" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Banknote className={`w-5 h-5 ${paymentMethod === 'cod' ? 'text-accent' : 'text-gray-400'}`} />
                          <span className="font-semibold text-sm">Cash on Delivery</span>
                        </div>
                        {paymentMethod === 'cod' && <CheckCircle2 className="w-5 h-5 text-accent" />}
                      </div>
                      <p className="text-xs text-gray-500">Pay with cash when your order arrives</p>
                      <p className="text-xs text-gray-400 italic">Standard price — no discount</p>
                    </label>
                  </div>
                </div>

                {/* Place Order Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isProcessing || items.length === 0 || !userId}
                    className="w-full h-14 bg-[#1e293b] text-white flex items-center justify-center gap-3 font-bold tracking-widest uppercase text-sm rounded-xl hover:bg-opacity-90 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                    ) : paymentMethod === 'cod' ? (
                      <><Banknote className="w-5 h-5" /> Place COD Order — ₹{total.toLocaleString()}</>
                    ) : (
                      <><Zap className="w-5 h-5 fill-current text-yellow-400" /> Pay ₹{total.toLocaleString()} Online</>
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-textSecondary font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    SSL Encrypted & Secure Checkout
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-2/5">
            <div className="bg-[#f8f8f8] p-6 md:p-8 rounded-2xl sticky top-8 border border-surfaceBorder">
              <h2 className="text-lg font-serif mb-6 border-b border-surfaceBorder pb-4">Order Summary</h2>
              
              {items.length === 0 ? (
                <p className="text-textSecondary text-sm">Your cart is empty.</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-24 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-surfaceBorder">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-semibold text-textPrimary text-sm line-clamp-2">{item.name}</h3>
                        <p className="text-xs text-textSecondary mt-1">Qty: {item.quantity}</p>
                        <p className="font-bold text-accent mt-2">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-surfaceBorder pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-textSecondary">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                
                {paymentMethod === 'prepaid' && prepaidDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {PREPAID_DISCOUNT_PERCENT}% Prepaid Discount</span>
                    <span>− ₹{prepaidDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-textSecondary">
                  <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Shipping</span>
                  <span className="text-green-600 font-semibold">FREE 🎉</span>
                </div>

                <div className="flex justify-between text-xl font-bold text-textPrimary pt-4 border-t border-surfaceBorder mt-2">
                  <span>Total</span>
                  <span className="text-accent">₹{total.toLocaleString()}</span>
                </div>
                
                {paymentMethod === 'prepaid' && prepaidDiscount > 0 && (
                  <div className="text-center text-xs text-green-700 bg-green-50 py-2 rounded-lg font-medium border border-green-100">
                    🎉 You save ₹{prepaidDiscount.toLocaleString()} by paying online!
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
