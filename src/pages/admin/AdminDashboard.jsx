import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLive } from '../../context/LiveContext';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/format';
import { StatusBadge } from '../../lib/orderStatus';

const tabs = [
  { id: 'overview', label: 'Özet' },
  { id: 'users', label: 'Kullanıcılar' },
  { id: 'businesses', label: 'İşletmeler' },
  { id: 'orders', label: 'Siparişler' },
  { id: 'live', label: 'Canlı kayıt' },
];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const { connectionState, liveLog, pushToast, adminDataRevision } = useLive();
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOverview = useCallback(async () => {
    setOverview(await api.adminOverview());
  }, []);
  const loadUsers = useCallback(async () => {
    setUsers(await api.adminUsers(false));
  }, []);
  const loadBusinesses = useCallback(async () => {
    setBusinesses(await api.adminBusinesses());
  }, []);
  const loadOrders = useCallback(async () => {
    setOrders(await api.adminOrders());
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadOverview(), loadUsers(), loadBusinesses(), loadOrders()]);
    } finally {
      setLoading(false);
    }
  }, [loadOverview, loadUsers, loadBusinesses, loadOrders]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (adminDataRevision < 1) {
      return;
    }
    void refreshAll();
  }, [adminDataRevision, refreshAll]);

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'Customer',
    businessId: '',
  });

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await api.adminCreateUser({
        email: newUser.email,
        password: newUser.password,
        displayName: newUser.displayName,
        role: newUser.role,
        businessId: newUser.role === 'Business' && newUser.businessId ? newUser.businessId : null,
      });
      pushToast('Kullanıcı oluşturuldu', 'success');
      setNewUser({ email: '', password: '', displayName: '', role: 'Customer', businessId: '' });
      await loadUsers();
      await loadOverview();
    } catch (err) {
      pushToast(err.message, 'warning');
    }
  };

  const deactivateUser = async (id) => {
    if (!window.confirm('Kullanıcıyı pasifleştirmek istiyor musunuz?')) {
      return;
    }
    try {
      await api.adminDeleteUser(id);
      pushToast('Kullanıcı pasifleştirildi', 'info');
      await loadUsers();
      await loadOverview();
    } catch (err) {
      pushToast(err.message, 'warning');
    }
  };

  const [newBiz, setNewBiz] = useState({ name: '', city: '', phone: '' });

  const createBusiness = async (e) => {
    e.preventDefault();
    try {
      await api.adminCreateBusiness({
        name: newBiz.name,
        city: newBiz.city || null,
        phone: newBiz.phone || null,
      });
      pushToast('İşletme eklendi', 'success');
      setNewBiz({ name: '', city: '', phone: '' });
      await loadBusinesses();
      await loadOverview();
    } catch (err) {
      pushToast(err.message, 'warning');
    }
  };

  const deactivateBusiness = async (id) => {
    if (!window.confirm('İşletmeyi pasifleştir?')) {
      return;
    }
    try {
      await api.adminDeleteBusiness(id);
      pushToast('İşletme pasifleştirildi', 'info');
      await loadBusinesses();
    } catch (err) {
      pushToast(err.message, 'warning');
    }
  };

  return (
    <div className="min-h-dvh min-w-0">
      <header className="ui-panel-header">
        <div className="px-3 py-3 sm:px-4">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#1e40af,#1d4ed8)' }}
              >
                A
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-base font-700 text-white">Admin Paneli</h1>
                <p className="truncate text-xs text-slate-400">
                  SignalR: <span className="font-500 text-slate-300">{connectionState}</span>
                  {loading ? ' · yenileniyor…' : ''}
                  {connectionState === 'Connected' ? (
                    <span className="ml-1.5 rounded-md bg-sky-900/50 px-1.5 py-0.5 text-xs font-600 text-sky-300 ring-1 ring-sky-500/30">
                      canlı
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => refreshAll()} className="ui-btn-nav">
                Yenile
              </button>
              <Link to="/" className="ui-btn-nav no-underline">
                Ana sayfa
              </Link>
              <button type="button" onClick={() => logout()} className="ui-btn-nav-primary">
                Çıkış
              </button>
            </div>
          </div>
          <nav className="mx-auto max-w-7xl">
            <div className="ui-tab-bar min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`ui-tab ${tab === t.id ? 'ui-tab-active' : 'ui-tab-inactive'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        {tab === 'overview' && overview && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Kullanıcı', overview.userCount],
              ['İşletme', overview.businessCount],
              ['Ürün', overview.productCount],
              ['Sipariş', overview.orderCount],
            ].map(([k, v]) => (
              <div key={k} className="ui-stat">
                <p className="ui-stat-label">{k}</p>
                <p className="ui-stat-value">{v}</p>
              </div>
            ))}
            <div className="ui-stat sm:col-span-2 lg:col-span-4">
              <p className="ui-stat-label">Açık Sipariş (iptal dışı)</p>
              <p className="ui-stat-value">{overview.openOrderCount}</p>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-6">
            <form onSubmit={createUser} className="ui-card p-4 sm:p-5">
              <h2 className="font-display text-base font-semibold text-slate-900">Kullanıcı ekle</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <input
                  required
                  value={newUser.displayName}
                  onChange={(e) => setNewUser((u) => ({ ...u, displayName: e.target.value }))}
                  placeholder="Ad"
                  className="ui-input"
                />
                <input
                  required
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))}
                  placeholder="E-posta"
                  className="ui-input"
                />
                <input
                  required
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))}
                  placeholder="Şifre"
                  className="ui-input"
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser((u) => ({ ...u, role: e.target.value }))}
                  className="ui-select"
                >
                  <option value="Admin">Admin</option>
                  <option value="Business">İşletme</option>
                  <option value="Customer">Müşteri</option>
                </select>
                {newUser.role === 'Business' && (
                  <select
                    required
                    value={newUser.businessId}
                    onChange={(e) => setNewUser((u) => ({ ...u, businessId: e.target.value }))}
                    className="ui-select sm:col-span-2"
                  >
                    <option value="">İşletme seçin</option>
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                )}
                <button type="submit" className="ui-btn-primary">
                  Oluştur
                </button>
              </div>
            </form>

            <div className="touch-pan-x overflow-x-auto overscroll-x-contain ui-table-shell">
              <table className="min-w-[720px] w-full">
                <thead>
                  <tr>
                    <th className="ui-th">E-posta</th>
                    <th className="ui-th">Ad</th>
                    <th className="ui-th">Rol</th>
                    <th className="ui-th">İşletme</th>
                    <th className="ui-th">Aktif</th>
                    <th className="ui-th">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="ui-tr">
                      <td className="ui-td max-w-[140px] break-words sm:max-w-none">{u.email}</td>
                      <td className="ui-td">{u.displayName}</td>
                      <td className="ui-td">{u.role}</td>
                      <td className="ui-td">{u.businessId ?? '—'}</td>
                      <td className="ui-td">{u.isActive ? 'Evet' : 'Hayır'}</td>
                      <td className="ui-td">
                        {u.isActive && (
                          <button
                            type="button"
                            onClick={() => deactivateUser(u.id)}
                            className="text-sm font-medium text-rose-600 hover:text-rose-700 hover:underline"
                          >
                            Pasifleştir
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'businesses' && (
          <div className="space-y-6">
            <form onSubmit={createBusiness} className="ui-card p-4 sm:p-5">
              <h2 className="font-display text-base font-semibold text-slate-900">İşletme ekle</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
                <input
                  required
                  value={newBiz.name}
                  onChange={(e) => setNewBiz((b) => ({ ...b, name: e.target.value }))}
                  placeholder="İşletme adı"
                  className="ui-input lg:min-w-[200px] lg:flex-1"
                />
                <input
                  value={newBiz.city}
                  onChange={(e) => setNewBiz((b) => ({ ...b, city: e.target.value }))}
                  placeholder="Şehir"
                  className="ui-input lg:min-w-[140px]"
                />
                <input
                  value={newBiz.phone}
                  onChange={(e) => setNewBiz((b) => ({ ...b, phone: e.target.value }))}
                  placeholder="Telefon"
                  className="ui-input lg:min-w-[160px]"
                />
                <button type="submit" className="ui-btn-primary sm:col-span-2 lg:col-span-1">
                  Ekle
                </button>
              </div>
            </form>
            <div className="touch-pan-x overflow-x-auto overscroll-x-contain ui-table-shell">
              <table className="min-w-[520px] w-full">
                <thead>
                  <tr>
                    <th className="ui-th">Ad</th>
                    <th className="ui-th">Şehir</th>
                    <th className="ui-th">Aktif</th>
                    <th className="ui-th">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map((b) => (
                    <tr key={b.id} className="ui-tr">
                      <td className="ui-td">{b.name}</td>
                      <td className="ui-td">{b.city ?? '—'}</td>
                      <td className="ui-td">{b.isActive ? 'Evet' : 'Hayır'}</td>
                      <td className="ui-td">
                        {b.isActive && (
                          <button
                            type="button"
                            onClick={() => deactivateBusiness(b.id)}
                            className="text-sm font-medium text-rose-600 hover:text-rose-700 hover:underline"
                          >
                            Pasifleştir
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="touch-pan-x overflow-x-auto overscroll-x-contain ui-table-shell">
            <table className="min-w-[800px] w-full">
              <thead>
                <tr>
                  <th className="ui-th">Tarih</th>
                  <th className="ui-th">Müşteri</th>
                  <th className="ui-th">İşletme</th>
                  <th className="ui-th">Durum</th>
                  <th className="ui-th">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className={`ui-tr${o.status === 'Cancelled' ? ' opacity-60' : ''}`}>
                    <td className="ui-td">
                      <div>{new Date(o.createdAt).toLocaleString('tr-TR')}</div>
                      {o.cancelledAt && (
                        <div className="mt-0.5 text-[11px] text-rose-500">
                          İptal: {new Date(o.cancelledAt).toLocaleString('tr-TR')}
                        </div>
                      )}
                    </td>
                    <td className="ui-td">{o.customerEmail}</td>
                    <td className="ui-td">{o.businessName}</td>
                    <td className="ui-td"><StatusBadge status={o.status} /></td>
                    <td className={`ui-td font-medium ${o.status === 'Cancelled' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {formatCurrency(o.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'live' && (
          <div className="ui-card p-4 sm:p-5">
            <h2 className="font-display text-base font-700 text-slate-900">Son Olaylar</h2>
            <ul className="mt-4 max-h-[480px] space-y-2 overflow-y-auto text-xs text-slate-600">
              {liveLog.map((e) => (
                <li key={e.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="font-700 text-blue-700">{e.type}</span>
                  <span className="ml-2 text-slate-400">{e.at}</span>
                  <pre className="mt-1 overflow-x-auto whitespace-pre-wrap font-mono text-[11px] text-slate-500">
                    {JSON.stringify(e.payload, null, 0)}
                  </pre>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
