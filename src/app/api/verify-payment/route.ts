import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, supabaseOrderId } = await req.json();

    // Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Update Order in Supabase
    // Use Admin client to bypass RLS for updates
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'Processing', // Changed to Processing since payment is successful
        payment_status: 'Success'
      })
      .eq('id', supabaseOrderId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: 'Payment verified successfully' });

  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
