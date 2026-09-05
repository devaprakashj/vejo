import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: Request) {
  try {
    if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@vejo.in',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    } else {
      console.warn('VAPID keys are missing. Push notifications will not work.');
    }

    const payload = await request.json();
    
    // Validate Supabase Webhook payload (optional: you could check a secret header here)
    if (payload.type !== 'INSERT' || payload.table !== 'orders') {
      return NextResponse.json({ message: 'Ignored' });
    }

    const order = payload.record;

    // Use Service Role to bypass RLS and fetch admin subscriptions
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get() { return undefined; },
          set() {},
          remove() {}
        }
      }
    );

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error) {
      console.error('Failed to fetch subscriptions:', error);
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscriptions found' });
    }

    const notificationPayload = JSON.stringify({
      title: 'New Order Received! 🎉',
      body: `Order #${order.id.slice(0,8)} for ₹${order.total_amount}`,
      url: `/admin/orders/${order.id}`
    });

    const sendPromises = subscriptions.map(sub => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };
      
      return webpush.sendNotification(pushSubscription, notificationPayload)
        .catch(err => {
          console.error('Error sending to endpoint:', sub.endpoint, err);
          // If subscription is invalid/expired (status 410 or 404), we should delete it
          if (err.statusCode === 410 || err.statusCode === 404) {
            return supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
          }
        });
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, notified: subscriptions.length });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
