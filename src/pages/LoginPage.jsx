import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'Business') navigate('/business');
      else navigate('/customer');
    } catch (err) {
      setError(err.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ui-app-shell flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl shadow-slate-900/20
                      lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">

        <div className="ui-auth-aside hidden flex-col justify-between p-10 lg:flex">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900/50">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                  <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                </svg>
              </div>
              <span className="font-display text-xl font-700 text-white">PosDemo</span>
            </div>

            <h2 className="font-display text-3xl font-800 text-white leading-tight mb-4">
              İşletmenizi dijitale taşıyın.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Gerçek zamanlı sipariş ve stok yönetimi, entegre müşteri sohbeti ve
              kapsamlı analitikle rekabet avantajı yakalayın.
            </p>
          </div>

          <div className="relative z-10">
            <div className="border-t border-white/10 pt-8 space-y-4">
              {[
                { label: 'Gerçek Zamanlı Güncellemeler', desc: 'SignalR ile anlık yansıma' },
                { label: 'Çok Rol Desteği', desc: 'Admin · İşletme · Müşteri' },
                { label: 'Güvenli JWT Kimlik Doğrulama', desc: 'Token tabanlı oturum' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600/30 ring-1 ring-blue-500/40">
                    <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                      <path d="M2.5 6l2.5 2.5 4.5-5" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-600 text-white">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center bg-white px-8 py-10 sm:px-12">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
              </svg>
            </div>
            <span className="font-display text-lg font-700 text-slate-900">PosDemo</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-2xl font-700 text-slate-900 mb-1">Hesabınıza giriş yapın</h1>
            <p className="text-sm text-slate-500">
              Hesabınız yok mu?{' '}
              <Link to="/register/customer" className="font-600 text-blue-600 hover:text-blue-800">
                Ücretsiz kayıt olun
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="ui-label">E-posta</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@sirket.com"
                className="ui-input"
              />
            </div>

            <div>
              <label htmlFor="password" className="ui-label">Şifre</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="ui-input"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm font-500 text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="ui-btn-primary w-full mt-2"
            >
              {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6 space-y-2">
            <p className="text-xs text-slate-400 font-500 uppercase tracking-widest mb-3">Yeni hesap</p>
            <Link
              to="/register/business"
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-600 text-slate-700 hover:bg-white hover:border-slate-300 transition-colors"
            >
              <span>İşletme hesabı oluştur</span>
              <span className="text-slate-400">→</span>
            </Link>
            <Link
              to="/register/customer"
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-600 text-slate-700 hover:bg-white hover:border-slate-300 transition-colors"
            >
              <span>Müşteri hesabı oluştur</span>
              <span className="text-slate-400">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
