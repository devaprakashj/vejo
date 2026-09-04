// @ts-nocheck
/* eslint-disable */
'use server';

import { createClient } from '@supabase/supabase-js';

// We must use the service role key to bypass RLS for admin updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function updateOrderFulfillment(
  orderId: string, 
  data: {
    status: string;
    meesho_order_id: string;
    tracking_id: string;
    tracking_url: string;
  }
) {
  try {
    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        status: data.status,
        meesho_order_id: data.meesho_order_id,
        tracking_id: data.tracking_id,
        tracking_url: data.tracking_url
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

