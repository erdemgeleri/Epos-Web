import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createLiveHubConnection } from '../lib/signalr';
import { useAuth } from './AuthContext';

const LiveContext = createContext(null);

let toastSeq = 0;

const chatSubscribersRef = new Set();
const typingSubscribersRef = new Set();
const productChangedSubscribersRef = new Set();
const orderEventSubscribersRef = new Set();

const adminRefreshEvents = new Set([
  'orderCreated',
  'orderCancelled',
  'productChanged',
  'userChanged',
  'businessChanged',
]);

export function subscribeChatMessage(fn) {
  chatSubscribersRef.add(fn);
  return () => chatSubscribersRef.delete(fn);
}

export function subscribeChatTyping(fn) {
  typingSubscribersRef.add(fn);
  return () => typingSubscribersRef.delete(fn);
}

export function subscribeProductChanged(fn) {
  productChangedSubscribersRef.add(fn);
  return () => productChangedSubscribersRef.delete(fn);
}

export function subscribeOrderEvents(fn) {
  orderEventSubscribersRef.add(fn);
  return () => orderEventSubscribersRef.delete(fn);
}

export function LiveProvider({ children }) {
  const { user, ready } = useAuth();
  const [toasts, setToasts] = useState([]);
  const [connectionState, setConnectionState] = useState('Disconnected');
  const [liveLog, setLiveLog] = useState([]);
  const [adminDataRevision, setAdminDataRevision] = useState(0);
  const hubRef = useRef(null);
  const userRef = useRef(user);
  userRef.current = user;

  const bumpAdminData = useCallback(() => {
    setAdminDataRevision((n) => n + 1);
  }, []);

  const pushToast = useCallback((message, tone = 'info') => {
    const id = ++toastSeq;
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const pushLog = useCallback((type, payload) => {
    setLiveLog((prev) =>
      [{ id: ++toastSeq, type, payload, at: new Date().toISOString() }, ...prev].slice(0, 80),
    );
  }, []);

  const joinRoleGroups = useCallback(async (connection) => {
    const u = userRef.current;
    if (!u) {
      return;
    }
    if (u.role === 'Admin') {
      await connection.invoke('JoinAdminPanel');
    } else if (u.role === 'Business') {
      await connection.invoke('JoinBusinessPanel');
    } else if (u.role === 'Customer') {
      await connection.invoke('JoinCustomerPanel');
    }
  }, []);

  const sendChatTyping = useCallback(async (businessId, customerUserId, isTyping) => {
    const hub = hubRef.current;
    if (!hub || hub.state !== 'Connected') {
      return;
    }
    try {
      await hub.invoke('SetChatTyping', businessId, customerUserId, isTyping);
    } catch {}
  }, []);

  useEffect(() => {
    if (!ready || !user) {
      hubRef.current = null;
      return undefined;
    }

    const connection = createLiveHubConnection();
    hubRef.current = connection;

    const onEvent =
      (label) =>
      (payload) => {
        pushLog(label, payload);
        if (label !== 'chatMessage') {
          pushToast(
            {
              orderCreated: 'Yeni sipariş',
              orderCancelled: 'Sipariş iptal',
              productChanged: 'Ürün / stok güncellendi',
              userChanged: 'Kullanıcı güncellendi',
              businessChanged: 'İşletme güncellendi',
            }[label] ?? label,
            label === 'orderCancelled' ? 'warning' : 'info',
          );
        }

        if (userRef.current?.role === 'Admin' && adminRefreshEvents.has(label)) {
          bumpAdminData();
        }
      };

    const notifyOrderSubscribers = (event, payload) => {
      orderEventSubscribersRef.forEach((fn) => {
        try {
          fn(event, payload);
        } catch {}
      });
    };

    connection.on('orderCreated', (payload) => {
      pushLog('orderCreated', payload);
      pushToast('Yeni sipariş', 'info');
      if (userRef.current?.role === 'Admin') {
        bumpAdminData();
      }
      notifyOrderSubscribers('orderCreated', payload);
    });
    connection.on('orderCancelled', (payload) => {
      pushLog('orderCancelled', payload);
      pushToast('Sipariş iptal', 'warning');
      if (userRef.current?.role === 'Admin') {
        bumpAdminData();
      }
      notifyOrderSubscribers('orderCancelled', payload);
    });
    connection.on('userChanged', onEvent('userChanged'));
    connection.on('businessChanged', onEvent('businessChanged'));

    connection.on('productChanged', (payload) => {
      pushLog('productChanged', payload);
      productChangedSubscribersRef.forEach((fn) => {
        try {
          fn(payload);
        } catch {}
      });
      if (userRef.current?.role === 'Admin' && adminRefreshEvents.has('productChanged')) {
        bumpAdminData();
      }
      pushToast('Ürün / stok güncellendi', 'info');
    });

    connection.on('chatMessage', (payload) => {
      pushLog('chatMessage', payload);
      chatSubscribersRef.forEach((fn) => {
        try {
          fn(payload);
        } catch {}
      });
    });

    connection.on('chatTyping', (payload) => {
      typingSubscribersRef.forEach((fn) => {
        try {
          fn(payload);
        } catch {}
      });
    });

    connection.onreconnecting(() => setConnectionState('Reconnecting'));
    connection.onreconnected(async () => {
      setConnectionState('Connected');
      try {
        await joinRoleGroups(connection);
      } catch {}
      if (userRef.current?.role === 'Admin') {
        bumpAdminData();
      }
    });
    connection.onclose(() => setConnectionState('Disconnected'));

    let cancelled = false;

    (async () => {
      try {
        await connection.start();
        if (cancelled) {
          return;
        }
        setConnectionState('Connected');
        await joinRoleGroups(connection);
      } catch (e) {
        if (!cancelled) {
          setConnectionState('Error');
          pushToast(`Canlı bağlantı: ${e.message}`, 'warning');
        }
      }
    })();

    return () => {
      cancelled = true;
      hubRef.current = null;
      connection.stop().catch(() => {});
    };
  }, [ready, user, pushToast, pushLog, bumpAdminData, joinRoleGroups]);

  const joinConversation = useCallback(async (businessId, customerUserId) => {
    const hub = hubRef.current;
    if (!hub || hub.state !== 'Connected') {
      return;
    }
    await hub.invoke('JoinConversation', businessId, customerUserId);
  }, []);

  const value = useMemo(
    () => ({
      toasts,
      connectionState,
      liveLog,
      adminDataRevision,
      pushToast,
      joinConversation,
      sendChatTyping,
    }),
    [toasts, connectionState, liveLog, adminDataRevision, pushToast, joinConversation, sendChatTyping],
  );

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export function useLive() {
  const ctx = useContext(LiveContext);
  if (!ctx) {
    throw new Error('useLive must be used within LiveProvider');
  }
  return ctx;
}
