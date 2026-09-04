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

    const { items, formData, totalAmount } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // 1. Create a pending order in Supabase first
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        status: 'Pending',
        payment_status: 'Pending',
        shipping_address: {
          fullName: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }
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

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 3. Create Razorpay Order
    // Razorpay amount is in paise (multiply by 100)
    const options = {
      amount: Math.round(totalAmount * 100), 
      currency: "INR",
      receipt: `rcpt_${order.id}_${uuidv4().substring(0,8)}`,
      notes: {
        orderId: order.id,
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 4. Update the Supabase order with the Razorpay Order ID
    // Use Admin client to bypass RLS for updates
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq('id', order.id);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
      supabaseOrderId: order.id
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
