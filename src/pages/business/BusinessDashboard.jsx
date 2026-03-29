/* eslint-disable react-hooks/set-state-in-effect -- panel verisi ilk yüklemede effect ile çekiliyor */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FloatingChatWidget from '../../components/FloatingChatWidget';
import { useAuth } from '../../context/AuthContext';
import { subscribeOrderEvents, subscribeProductChanged, useLive } from '../../context/LiveContext';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/format';
import { StatusBadge } from '../../lib/orderStatus';

export default function BusinessDashboard() {
  const { logout, user } = useAuth();
  const { connectionState, pushToast } = useLive();
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [pForm, setPForm] = useState({ name: '', description: '', price: '', stockQuantity: '' });

  const loadProducts = useCallback(async () => {
    setProducts(await api.businessProducts());
  }, []);
  const loadOrders = useCallback(async () => {
    setOrders(await api.businessOrders());
  }, []);

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, [loadProducts, loadOrders]);

  useEffect(() => {
    if (!user?.businessId) {
      return undefined;
    }
    return subscribeProductChanged((p) => {
      const bid = p.businessId ?? p.BusinessId;
      if (!bid || String(bid) !== String(user.businessId)) {
        return;
      }
      void loadProducts();
    });
  }, [user?.businessId, loadProducts]);

  useEffect(() => {
    if (!user?.businessId) {
      return undefined;
    }
    return subscribeOrderEvents((_event, payload) => {
      const bid = payload?.businessId ?? payload?.BusinessId;
      if (!bid || String(bid) !== String(user.businessId)) {
        return;
      }
      void loadOrders();
    });
  }, [user?.businessId, loadOrders]);

  const createProduct = async (e) => {
    e.preventDefault();
    try {
      await api.businessCreateProduct({
        name: pForm.name,
        description: pForm.description || null,
        price: Number(pForm.price),
        stockQuantity: Number(pForm.stockQuantity),
      });
      pushToast('Ürün eklendi', 'success');
      setPForm({ name: '', description: '', price: '', stockQuantity: '' });
      await loadProducts();
    } catch (err) {
      pushToast(err.message, 'warning');
    }
  };

  return (
    <div className="min-h-dvh min-w-0">
      <FloatingChatWidget variant="business" />

      <header className="ui-panel-header">
        <div className="px-3 py-3 sm:px-4">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#0369a1,#0891b2)' }}
              >
                İ
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-base font-700 text-white">İşletme Paneli</h1>
                <p className="truncate text-xs text-slate-400">
                  <span className="font-500 text-slate-300">{user?.email}</span>
                  {' · '}SignalR{' '}
                  <span className="font-500 text-slate-300">{connectionState}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/" className="ui-btn-nav no-underline">
                Ana sayfa
              </Link>
              <button type="button" onClick={() => logout()} className="ui-btn-nav-primary">
                Çıkış
              </button>
            </div>
          </div>
          <nav className="mx-auto max-w-6xl">
            <div className="ui-tab-bar min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
              {['products', 'orders'].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`ui-tab ${tab === id ? 'ui-tab-active' : 'ui-tab-inactive'}`}
                >
                  {id === 'products' ? 'Ürünler' : 'Siparişler'}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
        {tab === 'products' && (
          <div className="space-y-6">
            <form onSubmit={createProduct} className="ui-card p-4 sm:p-5">
              <h2 className="font-display text-base font-semibold text-slate-900">Yeni ürün</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input
                  required
                  value={pForm.name}
                  onChange={(e) => setPForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ad"
                  className="ui-input"
                />
                <input
                  value={pForm.description}
                  onChange={(e) => setPForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Açıklama"
                  className="ui-input sm:col-span-2"
                />
                <input
                  required
                  type="number"
                  step="0.01"
                  value={pForm.price}
                  onChange={(e) => setPForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="Fiyat"
                  className="ui-input"
                />
                <input
                  required
                  type="number"
                  value={pForm.stockQuantity}
                  onChange={(e) => setPForm((f) => ({ ...f, stockQuantity: e.target.value }))}
                  placeholder="Stok"
                  className="ui-input"
                />
                <button type="submit" className="ui-btn-primary">
                  Kaydet
                </button>
              </div>
            </form>
            <div className="touch-pan-x overflow-x-auto overscroll-x-contain ui-table-shell">
              <table className="min-w-[480px] w-full">
                <thead>
                  <tr>
                    <th className="ui-th">Ad</th>
                    <th className="ui-th">Fiyat</th>
                    <th className="ui-th">Stok</th>
                    <th className="ui-th">Aktif</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="ui-tr">
                      <td className="ui-td font-medium text-slate-800">{p.name}</td>
                      <td className="ui-td">{formatCurrency(p.price)}</td>
                      <td className="ui-td">{p.stockQuantity}</td>
                      <td className="ui-td">{p.isActive ? 'Evet' : 'Hayır'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="touch-pan-x overflow-x-auto overscroll-x-contain ui-table-shell">
            <table className="min-w-[640px] w-full">
              <thead>
                <tr>
                  <th className="ui-th">Tarih</th>
                  <th className="ui-th">Müşteri</th>
                  <th className="ui-th">Durum</th>
                  <th className="ui-th">Tutar</th>
                  <th className="ui-th">Kalem</th>
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
                    <td className="ui-td max-w-[120px] break-words sm:max-w-none">{o.customerEmail}</td>
                    <td className="ui-td"><StatusBadge status={o.status} /></td>
                    <td className={`ui-td font-medium ${o.status === 'Cancelled' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {formatCurrency(o.totalAmount)}
                    </td>
                    <td className="ui-td">{o.itemCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
