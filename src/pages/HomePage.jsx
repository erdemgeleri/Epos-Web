import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Gerçek Zamanlı',
    body: 'SignalR ile stok, sipariş ve sohbet anlık güncellenir; sayfayı yenilemenize gerek kalmaz.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Rol Bazlı Güvenlik',
    body: 'JWT kimlik doğrulaması ve sıkı rol ayrımı: Admin, İşletme ve Müşteri rolleri ayrı izinlerle çalışır.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
      </svg>
    ),
    title: 'Çoklu İşletme',
    body: 'Tek panelden birden fazla işletmeyi yönetin. Stok, ürün ve sipariş kontrolü merkezi bir ekranda.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    title: 'Entegre Sohbet',
    body: 'İşletme-müşteri iletişimi için yerleşik mesajlaşma; yanıt alıntılama ve yazıyor göstergesiyle.',
  },
];

function FeatureCard({ icon, title, body }) {
  return (
    <div className="flex gap-4 rounded-xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>
      <div>
        <h3 className="font-display text-[15px] font-700 text-slate-900 mb-1">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-500">{body}</p>
      </div>
    </div>
  );
}

function StatPill({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-display text-2xl font-800 text-white">{value}</span>
      <span className="text-xs font-500 text-blue-300 uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default function HomePage() {
  const { user, logout } = useAuth();

  const dashboardPath =
    user?.role === 'Admin'
      ? '/admin'
      : user?.role === 'Business'
      ? '/business'
      : '/customer';

  return (
    <div className="ui-app-shell">

      <section className="ui-hero relative">
        <div className="relative z-10">

          <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900/40">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                  <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                </svg>
              </div>
              <span className="font-display text-xl font-700 text-white tracking-tight">PosDemo</span>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    to={dashboardPath}
                    className="ui-btn-nav"
                  >
                    Dashboard
                  </Link>
                  <button onClick={logout} className="ui-btn-nav">
                    Çıkış
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="ui-btn-nav">Giriş Yap</Link>
                  <Link to="/register/customer" className="ui-btn-nav-primary">Üye Ol</Link>
                </>
              )}
            </div>
          </nav>

          <div className="max-w-7xl mx-auto px-6 pt-14 pb-24">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 mb-8">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs font-600 uppercase tracking-widest text-blue-300">
                  Enterprise EPOS Platform
                </span>
              </div>

              <h1 className="font-display text-5xl sm:text-6xl font-800 text-white leading-[1.08] mb-6">
                Satış noktanızı{' '}
                <span
                  style={{
                    background: 'linear-gradient(90deg, #60a5fa, #38bdf8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  dijitalleştirin.
                </span>
              </h1>

              <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-xl">
                Stok yönetimi, gerçek zamanlı sipariş takibi ve müşteri iletişimini tek bir panelde
                birleştiren profesyonel EPOS çözümü.
              </p>

              <div className="flex flex-wrap gap-3">
                {user ? (
                  <Link to={dashboardPath} className="ui-btn-primary text-base px-7 py-3">
                    Dashboard'a Git →
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register/business"
                      className="ui-btn-primary text-base px-7 py-3"
                    >
                      İşletme Kaydı Oluştur
                    </Link>
                    <Link
                      to="/register/customer"
                      className="ui-btn-nav text-base px-7 py-3"
                    >
                      Müşteri Kaydı
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="mt-16 flex flex-wrap gap-10 border-t border-white/10 pt-10">
              <StatPill value="3" label="Rol" />
              <StatPill value="∞" label="İşletme" />
              <StatPill value="<1ms" label="Güncelleme" />
              <StatPill value="JWT" label="Güvenlik" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 text-center">
            <p className="ui-kicker text-blue-600 mb-3">Platform Özellikleri</p>
            <h2 className="font-display text-3xl font-700 text-slate-900">
              İhtiyacınız olan her şey, tek çatı altında
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          {user ? (
            <div className="ui-card p-8 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white text-xl font-800 mb-4">
                {user.email?.[0]?.toUpperCase()}
              </div>
              <h2 className="font-display text-xl font-700 text-slate-900 mb-1">Hoş geldiniz</h2>
              <p className="text-slate-500 text-sm mb-6">{user.email} — {user.role}</p>
              <Link to={dashboardPath} className="ui-btn-primary px-8">
                Dashboard'a Git →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="ui-card p-6 flex flex-col items-start gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white text-sm font-700"
                  style={{ background: 'linear-gradient(135deg,#1e40af,#1d4ed8)' }}
                >
                  A
                </div>
                <div>
                  <h3 className="font-display text-base font-700 text-slate-900 mb-1">Admin</h3>
                  <p className="text-sm text-slate-500">Tüm sistemi, kullanıcıları ve işletmeleri yönet.</p>
                </div>
                <Link to="/login" className="ui-btn-primary mt-auto text-sm px-5">
                  Admin Girişi →
                </Link>
              </div>

              <div className="ui-card p-6 flex flex-col items-start gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white text-sm font-700"
                  style={{ background: 'linear-gradient(135deg,#0369a1,#0891b2)' }}
                >
                  İ
                </div>
                <div>
                  <h3 className="font-display text-base font-700 text-slate-900 mb-1">İşletme</h3>
                  <p className="text-sm text-slate-500">Ürünleri, siparişleri ve müşteri sohbetlerini yönet.</p>
                </div>
                <Link to="/register/business" className="ui-btn-primary mt-auto text-sm px-5">
                  İşletme Kaydı →
                </Link>
              </div>

              <div className="ui-card p-6 flex flex-col items-start gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white text-sm font-700"
                  style={{ background: 'linear-gradient(135deg,#065f46,#059669)' }}
                >
                  M
                </div>
                <div>
                  <h3 className="font-display text-base font-700 text-slate-900 mb-1">Müşteri</h3>
                  <p className="text-sm text-slate-500">İşletmeleri keşfet, ürün sipariş et, iletişime geç.</p>
                </div>
                <Link to="/register/customer" className="ui-btn-primary mt-auto text-sm px-5">
                  Müşteri Kaydı →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-xl border border-blue-200 bg-blue-50/60 p-6"
          >
            <p className="text-xs font-700 uppercase tracking-widest text-blue-600 mb-3">
              Demo Hesapları
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-mono">
              <div>
                <span className="block text-xs font-600 text-slate-500 mb-1">Admin</span>
                <span className="text-slate-700">admin@posdemo.local</span>
              </div>
              <div>
                <span className="block text-xs font-600 text-slate-500 mb-1">İşletme</span>
                <span className="text-slate-700">business@posdemo.local</span>
              </div>
              <div>
                <span className="block text-xs font-600 text-slate-500 mb-1">Müşteri</span>
                <span className="text-slate-700">customer@posdemo.local</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-600">
              <span className="font-600 text-slate-700">Şifre (tümü):</span>{' '}
              <span className="font-mono text-slate-800">PosDemo2026!</span>
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
              </svg>
            </div>
            <span className="font-display text-sm font-700 text-slate-700">PosDemo</span>
          </div>
          <p className="text-xs text-slate-400">Enterprise EPOS Platform — Demo</p>
        </div>
      </footer>
    </div>
  );
}
