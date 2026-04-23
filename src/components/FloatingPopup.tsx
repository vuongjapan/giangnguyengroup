import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface PopupCampaign {
  id: string;
  name: string;
  type: string;
  image_url: string;
  headline: string;
  button_text: string;
  coupon_code: string;
  target_url: string;
  is_active: boolean;
  start_at: string | null;
  end_at: string | null;
}

const STORAGE_KEY = 'gn-floating-popup-dismissed';
const DISMISS_HOURS = 12;

export default function FloatingPopup() {
  const [popup, setPopup] = useState<PopupCampaign | null>(null);
  const [show, setShow] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Skip on admin & checkout pages
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/checkout')) return;

    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const ts = Number(dismissed);
      if (Date.now() - ts < DISMISS_HOURS * 3600 * 1000) return;
    }

    (async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('popup_campaigns')
        .select('*')
        .eq('is_active', true)
        .eq('type', 'home')
        .order('updated_at', { ascending: false })
        .limit(1);

      const c = data?.[0] as PopupCampaign | undefined;
      if (!c) return;
      if (c.start_at && c.start_at > now) return;
      if (c.end_at && c.end_at < now) return;

      setPopup(c);
      const t = setTimeout(() => {
        setShow(true);
        // Track view
        supabase.rpc as any;
        supabase.from('popup_campaigns').select('views').eq('id', c.id).single().then(({ data: row }: any) => {
          if (row) supabase.from('popup_campaigns').update({ views: (row.views || 0) + 1 }).eq('id', c.id);
        });
      }, 2500);
      return () => clearTimeout(t);
    })();
  }, [location.pathname]);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  };

  const handleClick = async () => {
    if (!popup) return;
    const { data: row } = await supabase.from('popup_campaigns').select('clicks').eq('id', popup.id).single();
    if (row) await supabase.from('popup_campaigns').update({ clicks: (row.clicks || 0) + 1 }).eq('id', popup.id);
    dismiss();
  };

  if (!show || !popup) return null;

  const isExternal = popup.target_url?.startsWith('http');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4" onClick={dismiss}>
      <div
        className="bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          aria-label="Đóng"
          className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-background/80 hover:bg-background flex items-center justify-center text-foreground shadow"
        >
          <X className="h-4 w-4" />
        </button>

        {popup.image_url && (
          <img
            src={popup.image_url}
            alt={popup.headline || popup.name}
            className="w-full h-auto max-h-[60vh] object-cover"
          />
        )}

        <div className="p-5 text-center space-y-3">
          {popup.headline && (
            <h3 className="text-xl font-black text-foreground leading-snug whitespace-pre-line">
              {popup.headline}
            </h3>
          )}

          {popup.coupon_code && (
            <div className="inline-block bg-coral/10 border border-coral/30 text-coral font-mono font-bold px-4 py-1.5 rounded-lg tracking-wider">
              {popup.coupon_code}
            </div>
          )}

          {popup.target_url && (
            isExternal ? (
              <a
                href={popup.target_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                className="block w-full ocean-gradient text-primary-foreground font-bold py-3 rounded-lg text-sm hover:opacity-90 transition"
              >
                {popup.button_text || 'Xem ngay'}
              </a>
            ) : (
              <Link
                to={popup.target_url}
                onClick={handleClick}
                className="block w-full ocean-gradient text-primary-foreground font-bold py-3 rounded-lg text-sm hover:opacity-90 transition"
              >
                {popup.button_text || 'Xem ngay'}
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}
