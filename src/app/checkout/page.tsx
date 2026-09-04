'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { ChevronLeft, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Script from 'next/script';
import * as fpixel from '@/lib/fpixel';

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();
  const { items, clearCart } = useCartStore();
  
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Form State
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
    // Fetch logged in user
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setFormData(prev => ({ ...prev, email: user.email || '' }));
      }
    };
    checkUser();
    
    // Track InitiateCheckout
    fpixel.event('InitiateCheckout');
  }, [supabase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.18); // 18% GST (dummy)
  const total = subtotal + tax;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    if (!userId) {
      alert("Please log in to place an order.");
      router.push('/login?redirect=/checkout');
      return;
    }
    
    setIsProcessing(true);

    try {
      // 1. Call our API to create Order in Supabase and Razorpay
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          formData,
          totalAmount: total
        }),
      });

      const checkoutData = await checkoutRes.json();

      if (!checkoutRes.ok) {
        throw new Error(checkoutData.error || 'Failed to initialize payment');
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        amount: checkoutData.amount, // Amount is in currency subunits.
        currency: checkoutData.currency,
        name: "VEJO STUDIO",
        description: "Test Transaction",
        image: "https://your-logo-url.com/logo.png", // Replace with actual logo if needed
        order_id: checkoutData.id, // This is the order_id created in the backend
        handler: async function (response: any) {
          try {
            // 3. Verify the payment signature on our server
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                supabaseOrderId: checkoutData.supabaseOrderId
              }),
            });
            
            const verifyData = await verifyRes.json();
            
            if (verifyRes.ok && verifyData.success) {
              // Track Purchase event
              fpixel.event('Purchase', {
                value: checkoutData.amount / 100, // Amount is in subunits (paise)
                currency: checkoutData.currency,
                order_id: response.razorpay_order_id,
              });
              
              setIsProcessing(false);
              setIsSuccess(true);
              clearCart();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              alert("Payment verification failed. Please contact support.");
              setIsProcessing(false);
            }
          } catch (err) {
            console.error(err);
            alert("An error occurred during verification.");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#1e293b",
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      // @ts-ignore - Razorpay is loaded via script tag
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        alert("Payment Failed! Reason: " + response.error.description);
        setIsProcessing(false);
      });
      rzp.open();

    } catch (error: any) {
      alert("Error: " + error.message);
      setIsProcessing(false);
    }
  };

  if (!mounted) return null;

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] bg-background flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-lg text-center mx-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-serif text-textPrimary mb-4">Order Confirmed!</h1>
          <p className="text-textSecondary mb-8 leading-relaxed">
            Thank you for shopping with VEJO STUDIO. Your payment was successful and your order is being prepared for dispatch.
          </p>
          <Link 
            href="/account/orders"
            className="inline-block px-8 py-3 bg-accent text-white font-bold tracking-widest uppercase text-sm rounded hover:bg-opacity-90 transition-colors"
          >
            Track My Order
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* Header */}
      <div className="container-custom py-8 border-b border-surfaceBorder mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary hover:text-accent transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Return to Store
        </Link>
      </div>

      <div className="container-custom">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Shipping & Payment Form */}
          <div className="w-full lg:w-3/5">
            <div className="bg-white border border-surfaceBorder rounded-xl p-6 md:p-8 shadow-sm">
              <h1 className="text-2xl font-serif mb-6">Checkout securely</h1>
              
              {!userId && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded text-sm">
                  <strong>Wait!</strong> You must be logged in to place an order. <Link href="/login" className="underline font-bold">Log in here</Link>.
                </div>
              )}
              
              <form onSubmit={handlePayment} className="space-y-8">
                
                {/* Contact Info */}
                <div>
                  <h2 className="text-sm font-bold tracking-widest uppercase text-textSecondary mb-4">1. Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" className="w-full p-3.5 border border-surfaceBorder rounded-md bg-[#fafafa] focus:outline-none focus:border-accent transition-colors" />
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" className="w-full p-3.5 border border-surfaceBorder rounded-md bg-[#fafafa] focus:outline-none focus:border-accent transition-colors" />
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" className="w-full p-3.5 border border-surfaceBorder rounded-md bg-[#fafafa] focus:outline-none focus:border-accent transition-colors md:col-span-2" />
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone Number (for delivery updates)" className="w-full p-3.5 border border-surfaceBorder rounded-md bg-[#fafafa] focus:outline-none focus:border-accent transition-colors md:col-span-2" />
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="pt-6 border-t border-surfaceBorder">
                  <h2 className="text-sm font-bold tracking-widest uppercase text-textSecondary mb-4">2. Shipping Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input required type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} placeholder="Street Address" className="w-full p-3.5 border border-surfaceBorder rounded-md bg-[#fafafa] focus:outline-none focus:border-accent transition-colors md:col-span-2" />
                    <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} placeholder="Apartment, suite, etc. (optional)" className="w-full p-3.5 border border-surfaceBorder rounded-md bg-[#fafafa] focus:outline-none focus:border-accent transition-colors md:col-span-2" />
                    <input required type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="w-full p-3.5 border border-surfaceBorder rounded-md bg-[#fafafa] focus:outline-none focus:border-accent transition-colors" />
                    <input required type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State / Province" className="w-full p-3.5 border border-surfaceBorder rounded-md bg-[#fafafa] focus:outline-none focus:border-accent transition-colors" />
                    <input required type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="PIN Code" className="w-full p-3.5 border border-surfaceBorder rounded-md bg-[#fafafa] focus:outline-none focus:border-accent transition-colors" />
                    <input type="text" value="India" disabled className="w-full p-3.5 border border-surfaceBorder rounded-md bg-gray-100 text-textSecondary cursor-not-allowed" />
                  </div>
                </div>

                {/* Payment Section */}
                <div className="pt-8 mt-4 border-t border-surfaceBorder">
                  <button 
                    type="submit"
                    disabled={isProcessing || items.length === 0 || !userId}
                    className="w-full h-14 bg-[#1e293b] text-white flex items-center justify-center gap-3 font-bold tracking-widest uppercase text-sm rounded hover:bg-opacity-90 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed relative"
                  >
                    {isProcessing ? (
                      <span className="animate-pulse">Processing Secure Payment...</span>
                    ) : (
                      <>
                        Pay ₹{total.toLocaleString()} with UPI <Zap className="w-5 h-5 fill-current text-yellow-400" />
                      </>
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-textSecondary font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    Secure SSL Encrypted Checkout
                  </div>
                </div>

              </form>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-2/5">
            <div className="bg-[#f8f8f8] p-8 rounded-xl sticky top-8">
              <h2 className="text-lg font-serif mb-6 border-b border-surfaceBorder pb-4">Order Summary</h2>
              
              {items.length === 0 ? (
                <p className="text-textSecondary text-sm">Your cart is empty.</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-24 bg-white rounded overflow-hidden flex-shrink-0 border border-surfaceBorder">
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
                <div className="flex justify-between text-textSecondary">
                  <span>Estimated Tax (18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-textSecondary">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-textPrimary pt-4 border-t border-surfaceBorder mt-2">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
