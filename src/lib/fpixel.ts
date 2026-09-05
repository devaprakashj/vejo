// Facebook Pixel helper library
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

export const pageview = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

export const event = (name: string, options?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', name, options);
  }
};

// Standard FB Pixel Events
export const purchase = (value: number, currency: string = 'INR', orderId?: string) => {
  event('Purchase', {
    value: value,
    currency: currency,
    ...(orderId && { order_id: orderId }),
  });
};

export const addToCart = (value: number, currency: string = 'INR', contentName?: string) => {
  event('AddToCart', {
    value,
    currency,
    content_name: contentName,
  });
};

export const initiateCheckout = (value: number, currency: string = 'INR') => {
  event('InitiateCheckout', {
    value,
    currency,
  });
};

export const viewContent = (contentName: string, contentId: string, value?: number) => {
  event('ViewContent', {
    content_name: contentName,
    content_ids: [contentId],
    content_type: 'product',
    ...(value && { value }),
    currency: 'INR',
  });
};
