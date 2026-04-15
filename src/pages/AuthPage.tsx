import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/account', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast.error(error === 'Invalid login credentials' ? 'Email hoặc mật khẩu không đúng' : error);
      setLoading(false);
    }
    // Navigation handled by useEffect above
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Mật khẩu tối thiểu 6 ký tự'); return; }
    if (loading) return;
    setLoading(true);
    const { error } = await signUp(email, password, { full_name: name, phone });
    if (error) {
      toast.error(error);
    } else {
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
      setMode('login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" /> Về trang chủ
          </Link>

          <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
            {/* Tab switch */}
            <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${mode === 'login' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${mode === 'signup' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
              >
                Đăng ký
              </button>
            </div>

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full ocean-gradient text-primary-foreground font-bold py-3 rounded-lg text-sm hover:opacity-90 disabled:opacity-50">
                  {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Họ tên *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="0912345678"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Mật khẩu *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full ocean-gradient text-primary-foreground font-bold py-3 rounded-lg text-sm hover:opacity-90 disabled:opacity-50">
                  {loading ? 'Đang đăng ký...' : 'ĐĂNG KÝ THÀNH VIÊN'}
                </button>
              </form>
            )}

            <p className="text-xs text-muted-foreground text-center mt-4">
              {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
              <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-primary font-bold hover:underline">
                {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
              </button>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
