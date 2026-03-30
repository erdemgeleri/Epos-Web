import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FloatingChatWidget from '../../components/FloatingChatWidget';
import { useAuth } from '../../context/AuthContext';
import { subscribeOrderEvents, subscribeProductChanged, useLive } from '../../context/LiveContext';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/format';
import { StatusBadge } from '../../lib/orderStatus';

export default function CustomerDashboard() {
  const { logout, user } = useAuth();
  const { connectionState, pushToast } = useLive();
  const [tab, setTab] = useState('shop');

  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  const loadBusinesses = useCallback(async () => {
    setBusinesses(await api.catalogBusinesses());
  }, []);
  const loadOrders = useCallback(async () => {
    setOrders(await api.customerOrders());
  }, []);

  useEffect(() => {
    loadBusinesses();
    loadOrders();
  }, [loadBusinesses, loadOrders]);

  useEffect(() => {
    if (!selectedBusiness?.id) {
      setProducts([]);
      return;
    }
    const id = selectedBusiness.id;
    void (async () => {
      setProducts(await api.catalogProducts(id));
    })();
  }, [selectedBusiness?.id]);

  useEffect(() => {
    const bizId = selectedBusiness?.id;
    if (!bizId) {
      return undefined;
    }
    return subscribeProductChanged((p) => {
      const bid = p.businessId ?? p.BusinessId;
      if (!bid || String(bid) !== String(bizId)) {
        return;
      }
      void (async () => {
        try {
          setProducts(await api.catalogProducts(bizId));
        } catch {}
      })();
    });
  }, [selectedBusiness?.id]);

  useEffect(() => {
    return subscribeOrderEvents(() => {
      void loadOrders();
    });
  }, [loadOrders]);

  const addToCart = (product) => {
    if (selectedBusiness && cart.length > 0) {
      const first = cart[0];
      if (first.businessId !== product.businessId) {
        pushToast('Sepet tek işletmeden ürün içermeli. Sepeti temizleyin.', 'warning');
        return;
      }
    }
    setCart((c) => {
      const i = c.findIndex((x) => x.productId === product.id);
      if (i >= 0) {
        const next = [...c];
        next[i] = { ...next[i], quantity: next[i].quantity + 1 };
        return next;
      }
      return [...c, { productId: product.id, name: product.name, price: product.price, businessId: product.businessId, quantity: 1 }];
    });
  };

  const clearCart = () => setCart([]);

  const placeOrder = async () => {
    if (cart.length === 0) {
      return;
    }
    const businessId = cart[0].businessId;
    try {
      await api.customerCreateOrder({
        businessId,
        items: cart.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      });
      pushToast('Sipariş oluşturuldu', 'success');
      setCart([]);
      await loadOrders();
    } catch (err) {
      pushToast(err.message, 'warning');
    }
  };

  const cancelOrder = async (id) => {
    const reason = window.prompt('İptal nedeni (isteğe bağlı)', '') ?? '';
    try {
      await api.customerCancelOrder(id, { reason: reason || null });
      pushToast('Sipariş iptal edildi', 'info');
      await loadOrders();
    } catch (err) {
      pushToast(err.message, 'warning');
    }
  };

  const cartTotal = cart.reduce((s, l) => s + l.price * l.quantity, 0);

  return (
    <div className="min-h-dvh min-w-0">
      <FloatingChatWidget variant="customer" businesses={businesses} />

      <header className="ui-panel-header">
        <div className="px-3 py-3 sm:px-4">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#065f46,#059669)' }}
              >
                M
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-base font-700 text-white">Müşteri Paneli</h1>
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
              {[
                ['shop', 'Alışveriş'],
                ['orders', 'Siparişlerim'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`ui-tab ${tab === id ? 'ui-tab-active' : 'ui-tab-inactive'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
        {tab === 'shop' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <h2 className="font-display text-base font-semibold text-slate-900">İşletmeler</h2>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
                {businesses.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedBusiness(b);
                      setCart([]);
                    }}
                    className={`shrink-0 rounded-xl border px-3.5 py-2.5 text-left text-sm font-600 transition ${
                      selectedBusiness?.id === b.id
                        ? 'border-blue-700 bg-blue-700 text-white shadow-md shadow-blue-900/20'
                        : 'border-slate-200 bg-white text-slate-800 shadow-sm hover:border-blue-300 hover:text-blue-700'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
              {selectedBusiness && (
                <>
                  <h3 className="mt-2 font-display text-sm font-semibold text-slate-800">Ürünler</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {products.map((p) => (
                      <div key={p.id} className="ui-card p-4">
                        <p className="font-semibold text-slate-900">{p.name}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {formatCurrency(p.price)} · Stok {p.stockQuantity}
                        </p>
                        <button
                          type="button"
                          onClick={() => addToCart(p)}
                          disabled={p.stockQuantity < 1}
                          className="ui-btn-primary mt-3 w-full disabled:pointer-events-none disabled:opacity-40 sm:w-auto"
                        >
                          Sepete ekle
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="ui-card p-5 lg:sticky lg:top-28 lg:self-start">
              <h2 className="font-display text-base font-semibold text-slate-900">Sepet</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {cart.map((l) => (
                  <li key={l.productId} className="flex justify-between border-b border-slate-100 py-2">
                    <span className="text-slate-700">
                      {l.name} × {l.quantity}
                    </span>
                    <span className="font-medium text-slate-900">{formatCurrency(l.price * l.quantity)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-display text-lg font-bold text-slate-900">Toplam {formatCurrency(cartTotal)}</p>
              <div className="mt-4 flex flex-col gap-2">
                <button type="button" onClick={placeOrder} className="ui-btn-primary w-full">
                  Sipariş ver
                </button>
                <button type="button" onClick={clearCart} className="ui-btn-secondary w-full">
                  Sepeti temizle
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="touch-pan-x overflow-x-auto overscroll-x-contain ui-table-shell">
            <table className="min-w-[640px] w-full">
              <thead>
                <tr>
                  <th className="ui-th">Tarih</th>
                  <th className="ui-th">İşletme</th>
                  <th className="ui-th">Durum</th>
                  <th className="ui-th">Tutar</th>
                  <th className="ui-th">İşlem</th>
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
                    <td className="ui-td">{o.businessName}</td>
                    <td className="ui-td"><StatusBadge status={o.status} /></td>
                    <td className={`ui-td font-medium ${o.status === 'Cancelled' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {formatCurrency(o.totalAmount)}
                    </td>
                    <td className="ui-td">
                      {o.status !== 'Cancelled' && (
                        <button
                          type="button"
                          onClick={() => cancelOrder(o.id)}
                          className="text-sm font-medium text-rose-600 hover:text-rose-700 hover:underline"
                        >
                          İptal
                        </button>
                      )}
                    </td>
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
