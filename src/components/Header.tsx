import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Phone, Menu, X, MapPin, Clock, ChevronDown, ChevronRight, User, Gift, BookOpen, ShieldCheck, Package, Tag, Newspaper, UtensilsCrossed, Hotel, Store, MessageCircle, Mail } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { products, formatPrice, categories } from '@/data/products';
import { useSiteContent } from '@/hooks/useSiteContent';

const BEST_SELLERS = [
  { name: 'Mực khô loại 1', slug: 'muc-kho-loai-1' },
  { name: 'Cá chỉ vàng', slug: 'ca-chi-vang' },
  { name: 'Mực 1 nắng', slug: 'muc-1-nang' },
];

const MAIN_MENU = [
  { label: 'SẢN PHẨM', to: '/san-pham', icon: Package, hasDropdown: true },
  { label: 'COMBO QUÀ BIẾU', to: '/combo', icon: Gift },
  { label: 'KHUYẾN MÃI', to: '/khuyen-mai', icon: Tag },
  { label: 'MÓN NGON', to: '/mon-ngon', icon: UtensilsCrossed },
  { label: 'TIN TỨC', to: '/tin-tuc', icon: Newspaper },
  { label: 'BLOG', to: '/blog', icon: BookOpen },
  { label: 'GIỚI THIỆU', to: '/gioi-thieu', icon: BookOpen },
  { label: 'HỆ THỐNG CỬA HÀNG', to: '/he-thong-cua-hang', icon: Store },
  { label: 'CHÍNH SÁCH', to: '/chinh-sach', icon: ShieldCheck },
  { label: 'KHÁCH SẠN LIÊN KẾT', to: '/khach-san', icon: Hotel },
];

const DEFAULT_TICKER = [
  '🔥 FLASH SALE hải sản khô Sầm Sơn – Giảm 10% đơn đầu tiên',
  '🚚 FREE SHIP toàn quốc đơn từ 500K',
  '⭐ Cam kết 100% hải sản sạch, hoàn tiền nếu không hài lòng',
  '🎁 Mua 2 tặng 1 Nem chua Thanh Hóa',
];

export default function Header() {
  const { totalItems, totalPrice, setIsOpen } = useCart();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [mobileProductExpanded, setMobileProductExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { data: tickerItems } = useSiteContent<string[]>('ticker_banner', DEFAULT_TICKER);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const suggestions = searchQuery.length > 0
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const isActive = (path: string) => location.pathname === path;

  const tickerText = (tickerItems || DEFAULT_TICKER).map(t => t + ' \u00a0\u00a0|\u00a0\u00a0').join('');

  return (
    <header className={`sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-lg' : 'shadow-sm'}`}>
      {/* Promo ticker bar */}
      <div className="bg-coral text-primary-foreground py-1 overflow-hidden">
        <div className="promo-ticker">
          <div className="promo-ticker-content text-xs font-medium">
            {tickerText}{tickerText}
          </div>
        </div>
      </div>
