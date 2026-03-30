import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setToken } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterCustomerPage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.registerCustomer({ email, password, displayName });
      setToken(res.token);
      await refreshUser();
      navigate('/customer', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

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
              Alışveriş ve sipariş hesabı
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              İşletmelerden ürün seçin, sepetinizi yönetin ve siparişlerinizi tek panelden takip edin.
            </p>
          </div>

          <p className="relative z-10 text-xs text-slate-600">PosDemo müşteri portalı</p>
        </div>

        <div className="flex flex-col justify-center bg-white px-8 py-10 sm:px-12">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-sm font-700"
              style={{ background: 'linear-gradient(135deg,#065f46,#059669)' }}
            >
              M
            </div>
            <span className="font-display text-lg font-700 text-slate-900">PosDemo</span>
          </div>

          <div className="mb-7">
            <p className="ui-kicker text-blue-600 mb-1">Müşteri Kaydı</p>
            <h1 className="font-display text-2xl font-700 text-slate-900 mb-1">Hesap oluşturun</h1>
            <p className="text-sm text-slate-500">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="font-600 text-blue-600 hover:text-blue-800">Giriş yapın</Link>
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="ui-label">Ad soyad</label>
              <input
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Adınız"
                autoComplete="name"
                className="ui-input"
              />
            </div>
            <div>
              <label className="ui-label">E-posta</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@eposta.com"
                autoComplete="email"
                className="ui-input"
              />
            </div>
            <div>
              <label className="ui-label">Şifre</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 6 karakter"
                autoComplete="new-password"
                className="ui-input"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm font-500 text-red-700">
                {error}
              </p>
            )}

            <button type="submit" className="ui-btn-primary w-full mt-1">
              Kayıt ol
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <Link
              to="/register/business"
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-600 text-slate-700 hover:bg-white hover:border-slate-300 transition-colors"
            >
              <span>Bunun yerine işletme kaydı</span>
              <span className="text-slate-400">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
