'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';

export function PushNotificationManager({ vapidPublicKey }: { vapidPublicKey: string }) {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  }

  async function subscribeToPush() {
    setLoading(true);
    setMessage('');
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      setSubscription(sub);

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }

      setMessage('Subscribed successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error subscribing:', error);
      setMessage(error.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  }

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg text-sm text-gray-400 mt-4 mx-4 border border-gray-700">
        <BellOff className="w-4 h-4" />
        <span className="flex-1">Push Not Supported</span>
      </div>
    );
  }

  return (
    <div className="mt-4 mx-4">
      {subscription ? (
        <div className="flex items-center gap-2 p-3 bg-green-900/30 rounded-lg text-sm text-green-400 border border-green-900/50">
          <Bell className="w-4 h-4" />
          <span className="flex-1">Alerts Enabled</span>
        </div>
      ) : (
        <button
          onClick={subscribeToPush}
          disabled={loading}
          className="flex items-center gap-2 w-full p-3 bg-accent hover:bg-opacity-90 rounded-lg text-sm font-medium text-white transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
          <span className="flex-1 text-left">Enable Order Alerts</span>
        </button>
      )}
      {message && <p className="text-xs text-red-400 mt-2 px-1">{message}</p>}
    </div>
  );
}
