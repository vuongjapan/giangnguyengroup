import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import ChatBot from "@/components/ChatBot";
import FloatingButtons from "@/components/FloatingButtons";
import TrackingPixels from "@/components/TrackingPixels";
import WelcomePopup from "@/components/WelcomePopup";
import ExitIntentPopup from "@/components/ExitIntentPopup";
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
import HotelPartner from "./pages/HotelPartner.tsx";
import PromotionsPage from "./pages/PromotionsPage.tsx";
import RecipesPage from "./pages/RecipesPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
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
              <Route path="/khach-san-tuan-dat" element={<HotelPartner />} />
              <Route path="/khuyen-mai" element={<PromotionsPage />} />
              <Route path="/mon-ngon" element={<RecipesPage />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <TrackingPixels />
            <CartDrawer />
            <ChatBot />
            <FloatingButtons />
            <WelcomePopup />
            <ExitIntentPopup />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
