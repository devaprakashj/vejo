// @ts-nocheck
/* eslint-disable */
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, formData, totalAmount, paymentMethod } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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

    // 1. Create order in Supabase
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        status: 'Pending',
        payment_status: paymentMethod === 'cod' ? 'COD' : 'Pending',
        payment_method: paymentMethod || 'prepaid',
        shipping_address: shippingAddress,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: Number(item.id),
      quantity: item.quantity,
      price_at_time: item.price
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items insert error (non-fatal):', itemsError);
    }

    // --- COD: No Razorpay needed ---
    if (paymentMethod === 'cod') {
      return NextResponse.json({
        success: true,
        supabaseOrderId: order.id,
        paymentMethod: 'cod',
      });
    }

    // --- Prepaid: Create Razorpay Order ---
    const options = {
      amount: Math.round(totalAmount * 100), // in paise
      currency: "INR",
      receipt: `rcpt_${order.id.substring(0, 16)}`,
      notes: { orderId: order.id },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 4. Update Supabase order with Razorpay Order ID
    await supabaseAdmin
      .from('orders')
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq('id', order.id);

    return NextResponse.json({
      id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
      supabaseOrderId: order.id,
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
