import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { HotelProvider } from "@/contexts/HotelContext";
import CartDrawer from "@/components/CartDrawer";
import ChatBot from "@/components/ChatBot";
import FloatingButtons from "@/components/FloatingButtons";
import MobileBottomNav from "@/components/MobileBottomNav";
import TrackingPixels from "@/components/TrackingPixels";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import SmartExitPopup from "@/components/SmartExitPopup";
import FloatingPopup from "@/components/FloatingPopup";

import Index from "./pages/Index.tsx";
import ProductsPage from "./pages/ProductsPage.tsx";
import ComboPage from "./pages/ComboPage.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Checkout from "./pages/Checkout.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import Account from "./pages/Account.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import SalesPolicy from "./pages/SalesPolicy.tsx";
import BrandStory from "./pages/BrandStory.tsx";
import ContentHub from "./pages/ContentHub.tsx";
import HotelsPage from "./pages/HotelsPage.tsx";
import HotelDetail from "./pages/HotelDetail.tsx";
import StoreSystemPage from "./pages/StoreSystemPage.tsx";
import PromotionsPage from "./pages/PromotionsPage.tsx";
import RecipesPage from "./pages/RecipesPage.tsx";
import NewsPage from "./pages/NewsPage.tsx";
import RecipeDetail from "./pages/RecipeDetail.tsx";
import NewsDetail from "./pages/NewsDetail.tsx";
import NotFound from "./pages/NotFound.tsx";
import WholesalePage from "./pages/WholesalePage.tsx";
import SeoLandingPage from "./pages/SeoLandingPage.tsx";
import AuctionsPage from "./pages/AuctionsPage.tsx";
import AuctionDetail from "./pages/AuctionDetail.tsx";
import LivePage from "./pages/LivePage.tsx";
import AgentsPage from "./pages/AgentsPage.tsx";
import OrderTracking from "./pages/OrderTracking.tsx";
import AbandonedCartTracker from "./components/AbandonedCartTracker.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <HotelProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/san-pham" element={<ProductsPage />} />
                <Route path="/combo" element={<ComboPage />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/account" element={<Account />} />
                <Route path="/gioi-thieu" element={<BrandStory />} />
                <Route path="/ve-chung-toi" element={<Navigate to="/gioi-thieu" replace />} />
                <Route path="/chinh-sach" element={<SalesPolicy />} />
                <Route path="/chinh-sach-ban-hang" element={<Navigate to="/chinh-sach" replace />} />
                <Route path="/blog" element={<ContentHub />} />
                <Route path="/blog/:slug" element={<ContentHub />} />
                <Route path="/khach-san" element={<HotelsPage />} />
                <Route path="/khach-san/:slug" element={<HotelDetail />} />
                <Route path="/khach-san-tuan-dat" element={<Navigate to="/khach-san/tuan-dat-luxury-hotel" replace />} />
                <Route path="/he-thong-cua-hang" element={<StoreSystemPage />} />
                <Route path="/khuyen-mai" element={<PromotionsPage />} />
                <Route path="/mon-ngon" element={<RecipesPage />} />
                <Route path="/mon-ngon/:id" element={<RecipeDetail />} />
                <Route path="/tin-tuc" element={<NewsPage />} />
                <Route path="/tin-tuc/:id" element={<NewsDetail />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/dai-ly" element={<WholesalePage />} />
                <Route path="/ban-si" element={<Navigate to="/dai-ly" replace />} />
                <Route path="/lp/:slug" element={<SeoLandingPage />} />
                <Route path="/dau-gia" element={<AuctionsPage />} />
                <Route path="/dau-gia/:slug" element={<AuctionDetail />} />
                <Route path="/live" element={<LivePage />} />
                <Route path="/dai-ly-phan-phoi" element={<AgentsPage />} />
                <Route path="/tra-cuu-don" element={<OrderTracking />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <TrackingPixels />
              <CartDrawer />
              <ChatBot />
              <FloatingButtons />
              <MobileBottomNav />
              <ExitIntentPopup />
              <SmartExitPopup />
              <FloatingPopup />
              <AbandonedCartTracker />
            </BrowserRouter>
          </HotelProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
