import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ============================================================
// TRACKING PIXELS – Thay placeholder ID bằng ID thật của bạn
// ============================================================
const FB_PIXEL_ID = 'YOUR_FB_PIXEL_ID';
const TIKTOK_PIXEL_ID = 'YOUR_TIKTOK_PIXEL_ID';
const GA_MEASUREMENT_ID = 'YOUR_GA_MEASUREMENT_ID';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
    ttq: any;
    gtag: any;
    dataLayer: any[];
  }
}

function initFacebookPixel() {
  if (window.fbq) return;
  const n: any = (window.fbq = function (...args: any[]) {
    n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
  });
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  window.fbq('init', FB_PIXEL_ID);
  window.fbq('track', 'PageView');
}

function initTikTokPixel() {
  if (window.ttq) return;
  const ttq: any = (window.ttq = function (...args: any[]) {
    ttq.methods?.forEach?.((m: string) => {
      ttq[m] = (...a: any[]) => {
        ttq._i?.push?.([m, ...a]);
      };
    });
  });
  ttq._i = [];
  ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
  ttq.methods.forEach((m: string) => {
    ttq[m] = (...a: any[]) => {
      ttq._i.push([m, ...a]);
    };
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + TIKTOK_PIXEL_ID;
  document.head.appendChild(script);

  window.ttq.load(TIKTOK_PIXEL_ID);
  window.ttq.page();
}

function initGoogleAnalytics() {
  if (window.gtag) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: any[]) {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);
}

// Track custom events
export function trackEvent(eventName: string, data?: Record<string, any>) {
  try {
    window.fbq?.('track', eventName, data);
    window.ttq?.track?.(eventName, data);
    window.gtag?.('event', eventName, data);
  } catch {}
}

export function trackViewContent(productName: string, price: number, category: string) {
  trackEvent('ViewContent', {
    content_name: productName,
    content_category: category,
    value: price,
    currency: 'VND',
  });
}

export function trackAddToCart(productName: string, price: number, quantity: number) {
  trackEvent('AddToCart', {
    content_name: productName,
    value: price * quantity,
    currency: 'VND',
    num_items: quantity,
  });
}

export function trackInitiateCheckout(totalValue: number, numItems: number) {
  trackEvent('InitiateCheckout', {
    value: totalValue,
    currency: 'VND',
    num_items: numItems,
  });
}

export default function TrackingPixels() {
  const location = useLocation();

  useEffect(() => {
    if (FB_PIXEL_ID !== 'YOUR_FB_PIXEL_ID') initFacebookPixel();
    if (TIKTOK_PIXEL_ID !== 'YOUR_TIKTOK_PIXEL_ID') initTikTokPixel();
    if (GA_MEASUREMENT_ID !== 'YOUR_GA_MEASUREMENT_ID') initGoogleAnalytics();
  }, []);

  // Track page views on route change
  useEffect(() => {
    window.fbq?.('track', 'PageView');
    window.ttq?.page?.();
    window.gtag?.('config', GA_MEASUREMENT_ID, { page_path: location.pathname });
  }, [location.pathname]);

  return null;
}
