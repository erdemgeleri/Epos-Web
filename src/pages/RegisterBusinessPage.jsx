import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setToken } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterBusinessPage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    displayName: '',
    businessName: '',
    businessDescription: '',
    addressLine: '',
    city: '',
    phone: '',
    taxId: '',
  });
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.registerBusiness({
        email: form.email,
        password: form.password,
        displayName: form.displayName,
        businessName: form.businessName,
        businessDescription: form.businessDescription || null,
        addressLine: form.addressLine || null,
        city: form.city || null,
        phone: form.phone || null,
        taxId: form.taxId || null,
      });
      setToken(res.token);
      await refreshUser();
      navigate('/business', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="ui-app-shell flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl shadow-slate-900/20
                      lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">

        {/* ── LEFT: Brand Aside ── */}
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
              Mağaza ve operasyon yönetimi
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Ürün kataloğunuzu yönetin, siparişleri izleyin ve müşterilerinizle güvenli sohbet kanalı kullanın.
            </p>

            <div className="space-y-3">
              {['Ürün ve stok yönetimi', 'Sipariş akışı ve takip', 'Müşteri mesajlaşma'].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600/30 ring-1 ring-blue-500/40">
                    <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                      <path d="M2.5 6l2.5 2.5 4.5-5" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-600">PosDemo işletme konsolu</p>
        </div>

        {/* ── RIGHT: Form ── */}
        <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white px-8 py-10 sm:px-12 lg:max-h-none">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-sm font-700"
              style={{ background: 'linear-gradient(135deg,#0369a1,#0891b2)' }}
            >
              İ
            </div>
            <span className="font-display text-lg font-700 text-slate-900">PosDemo</span>
          </div>

          <div className="mb-7">
            <p className="ui-kicker text-blue-600 mb-1">İşletme Kaydı</p>
            <h1 className="font-display text-2xl font-700 text-slate-900 mb-1">İşletme profili</h1>
            <p className="text-sm text-slate-500">
              Hesabınız var mı?{' '}
              <Link to="/login" className="font-600 text-blue-600 hover:text-blue-800">Giriş yapın</Link>
            </p>
          </div>

          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="ui-label">Yetkili adı</label>
              <input required value={form.displayName} onChange={set('displayName')} placeholder="Ad soyad" className="ui-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="ui-label">E-posta</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={set('email')}
                placeholder="isletme@sirket.com"
                className="ui-input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="ui-label">Şifre</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={set('password')}
                placeholder="En az 6 karakter"
                className="ui-input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="ui-label">İşletme adı</label>
              <input required value={form.businessName} onChange={set('businessName')} placeholder="Ticari unvan" className="ui-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="ui-label">Açıklama</label>
              <input
                value={form.businessDescription}
                onChange={set('businessDescription')}
                placeholder="Kısa tanıtım"
                className="ui-input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="ui-label">Adres</label>
              <input value={form.addressLine} onChange={set('addressLine')} placeholder="Açık adres" className="ui-input" />
            </div>
            <div>
              <label className="ui-label">Şehir</label>
              <input value={form.city} onChange={set('city')} placeholder="İl" className="ui-input" />
            </div>
            <div>
              <label className="ui-label">Telefon</label>
              <input value={form.phone} onChange={set('phone')} placeholder="+90 …" className="ui-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="ui-label">Vergi no</label>
              <input value={form.taxId} onChange={set('taxId')} placeholder="İsteğe bağlı" className="ui-input" />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm font-500 text-red-700 sm:col-span-2">
                {error}
              </p>
            )}

            <button type="submit" className="ui-btn-primary w-full sm:col-span-2">
              Kayıt ol
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <Link
              to="/register/customer"
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-600 text-slate-700 hover:bg-white hover:border-slate-300 transition-colors"
            >
              <span>Bunun yerine müşteri kaydı</span>
              <span className="text-slate-400">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
