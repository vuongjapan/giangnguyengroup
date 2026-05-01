import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Recovery flow: Supabase auto-creates a session via the URL hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('access_token')) {
      setValidSession(true);
    } else {
      supabase.auth.getSession().then(({ data }) => setValidSession(!!data.session));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Mật khẩu tối thiểu 6 ký tự'); return; }
    if (password !== confirm) { toast.error('Hai mật khẩu không khớp'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) toast.error('Lỗi: ' + error.message);
    else {
      setDone(true);
      toast.success('Đổi mật khẩu thành công!');
      setTimeout(() => navigate('/account', { replace: true }), 1500);
    }
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
            <h1 className="text-xl font-black text-foreground text-center mb-1">Đặt lại mật khẩu</h1>
            <p className="text-xs text-muted-foreground text-center mb-5">Nhập mật khẩu mới cho tài khoản của bạn</p>

            {done ? (
              <div className="text-center py-6">
                <CheckCircle className="h-14 w-14 text-primary mx-auto mb-3" />
                <p className="font-bold text-foreground">Đổi mật khẩu thành công!</p>
                <p className="text-xs text-muted-foreground mt-1">Đang chuyển sang trang cá nhân...</p>
              </div>
            ) : !validSession ? (
              <div className="text-center py-6">
                <p className="text-sm text-destructive font-medium">Liên kết không hợp lệ hoặc đã hết hạn.</p>
                <Link to="/auth" className="inline-block mt-3 text-primary text-sm font-bold hover:underline">
                  Yêu cầu lại liên kết →
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Mật khẩu mới</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự" minLength={6} required
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type={showPwd ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                      placeholder="Nhập lại mật khẩu" minLength={6} required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full ocean-gradient text-primary-foreground font-bold py-3 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Đang đặt lại...' : 'ĐẶT LẠI MẬT KHẨU'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
