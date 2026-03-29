/* eslint-disable react-hooks/set-state-in-effect -- sohbet paneli yükleme / SignalR senkron */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { subscribeChatMessage, subscribeChatTyping, useLive } from '../context/LiveContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

function TypingDots() {
  return (
    <span className="chat-typing-dots" aria-hidden>
      <span />
      <span />
      <span />
    </span>
  );
}

function sameGuid(a, b) {
  return String(a ?? '') === String(b ?? '');
}

function convKey(businessId, customerUserId) {
  return `${businessId ?? ''}:${customerUserId ?? ''}`;
}

/**
 * @param {'business' | 'customer'} variant
 * @param {{ id: string, name: string }[]} [businesses] — müşteri: katalog işletmeleri
 */
export default function FloatingChatWidget({ variant, businesses = [] }) {
  const { user } = useAuth();
  const { sendChatTyping, pushToast } = useLive();
  const [expanded, setExpanded] = useState(false);
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [peerTyping, setPeerTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  // { convKey: count } — konuşma başına okunmamış sayısı
  const [unreadMap, setUnreadMap] = useState({});
  const [isSmUp, setIsSmUp] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches,
  );
  // Masaüstünde sol liste panelini kapat/aç
  const [listCollapsed, setListCollapsed] = useState(false);

  const typingStopTimer = useRef(null);
  const typingSentRef = useRef(false);
  const threadRefreshTimer = useRef(null);

  const loadThreads = useCallback(async () => {
    try {
      const list = await api.chatThreads();
      setThreads(list);
    } catch (e) {
      pushToast(e.message, 'warning');
    }
  }, [pushToast]);

  const scheduleThreadRefresh = useCallback(() => {
    if (threadRefreshTimer.current) {
      window.clearTimeout(threadRefreshTimer.current);
    }
    threadRefreshTimer.current = window.setTimeout(() => {
      threadRefreshTimer.current = null;
      void loadThreads();
    }, 350);
  }, [loadThreads]);

  const loadMessages = useCallback(
    async (sel) => {
      if (!sel) {
        return;
      }
      try {
        if (variant === 'business') {
          const list = await api.chatMessages(sel.businessId, sel.customerUserId);
          setMessages(list);
        } else {
          const list = await api.chatMessages(sel.businessId, null);
          setMessages(list);
        }
      } catch (e) {
        pushToast(e.message, 'warning');
      }
    },
    [variant, pushToast],
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const onChange = () => setIsSmUp(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!user || (variant === 'business' && !user.businessId)) {
      return undefined;
    }
    void loadThreads();
    const t = window.setInterval(() => void loadThreads(), 60000);
    return () => {
      window.clearInterval(t);
      if (threadRefreshTimer.current) {
        window.clearTimeout(threadRefreshTimer.current);
        threadRefreshTimer.current = null;
      }
    };
  }, [user, variant, loadThreads]);

  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return undefined;
    }
    void loadMessages(selected);
    return undefined;
  }, [selected, loadMessages]);

  const threadRows = useMemo(() => {
    if (variant === 'business') {
      return threads;
    }
    if (!user) {
      return [];
    }
    return businesses.map((b) => {
      const th = threads.find((t) => sameGuid(t.businessId, b.id));
      return {
        businessId: b.id,
        businessName: b.name,
        customerUserId: user.id,
        customerEmail: user.email,
        lastMessageAt: th?.lastMessageAt ?? '1970-01-01T00:00:00Z',
        preview: th?.preview ?? null,
      };
    });
  }, [variant, threads, businesses, user]);

  const sortedRows = useMemo(() => {
    return [...threadRows].sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    );
  }, [threadRows]);

  /** Mobil sohbet başlığı (seçili konuşma) */
  const selectedConversationTitle = useMemo(() => {
    if (!selected) {
      return '';
    }
    if (variant === 'business') {
      const row = sortedRows.find(
        (r) =>
          sameGuid(r.customerUserId, selected.customerUserId) && sameGuid(r.businessId, selected.businessId),
      );
      return row?.customerEmail ?? 'Sohbet';
    }
    const row = sortedRows.find((r) => sameGuid(r.businessId, selected.businessId));
    return row?.businessName ?? 'Sohbet';
  }, [selected, sortedRows, variant]);

  const matchesThread = useCallback(
    (p) => {
      if (!selected) {
        return false;
      }
      if (variant === 'business') {
        return sameGuid(p.businessId, selected.businessId) && sameGuid(p.customerUserId, selected.customerUserId);
      }
      return sameGuid(p.businessId, selected.businessId) && sameGuid(p.customerUserId, user?.id);
    },
    [selected, variant, user?.id],
  );

  const isForMe = useCallback(
    (p) => {
      if (variant === 'business') {
        return user?.businessId && sameGuid(p.businessId, user.businessId);
      }
      return sameGuid(p.customerUserId, user?.id);
    },
    [variant, user?.businessId, user?.id],
  );

  useEffect(() => {
    const unsubMsg = subscribeChatMessage((p) => {
      if (!isForMe(p)) {
        return;
      }

      scheduleThreadRefresh();
      const open = expanded && matchesThread(p);

      if (open) {
        setMessages((prev) => {
          const id = p.id ?? p.Id;
          if (prev.some((m) => sameGuid(m.id, id))) {
            return prev;
          }
          const normalized = normalizeMessage(p);
          return [...prev, normalized].sort(
            (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
          );
        });
        setPeerTyping(false);
      } else {
        const sid = p.senderUserId ?? p.SenderUserId;
        if (!sameGuid(sid, user?.id)) {
          const bid = p.businessId ?? p.BusinessId;
          const cid = p.customerUserId ?? p.CustomerUserId;
          const key = convKey(bid, cid);
          setUnread((n) => n + 1);
          setUnreadMap((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
        }
      }
    });

    const unsubTyping = subscribeChatTyping((ev) => {
      if (!isForMe(ev)) {
        return;
      }
      const uid = ev.userId ?? ev.UserId;
      if (sameGuid(uid, user?.id)) {
        return;
      }
      const biz = ev.businessId ?? ev.BusinessId;
      const cust = ev.customerUserId ?? ev.CustomerUserId;
      const typing = ev.isTyping ?? ev.IsTyping;
      if (!selected) {
        return;
      }
      if (variant === 'business') {
        if (!sameGuid(biz, selected.businessId) || !sameGuid(cust, selected.customerUserId)) {
          return;
        }
      } else if (!sameGuid(biz, selected.businessId)) {
        return;
      }
      setPeerTyping(!!typing);
    });

    return () => {
      unsubMsg();
      unsubTyping();
    };
  }, [user?.id, expanded, matchesThread, isForMe, selected, variant, scheduleThreadRefresh]);

  const flushTypingStop = useCallback(() => {
    if (typingStopTimer.current) {
      window.clearTimeout(typingStopTimer.current);
      typingStopTimer.current = null;
    }
    if (typingSentRef.current && selected) {
      const custId = variant === 'business' ? selected.customerUserId : user.id;
      void sendChatTyping(selected.businessId, custId, false);
      typingSentRef.current = false;
    }
  }, [selected, variant, user, sendChatTyping]);

  const goBackToThreadList = useCallback(() => {
    flushTypingStop();
    setSelected(null);
    setReplyTo(null);
    setPeerTyping(false);
  }, [flushTypingStop]);

  const onInputChange = (e) => {
    const v = e.target.value;
    setInput(v);
    if (!selected) {
      return;
    }
    const custId = variant === 'business' ? selected.customerUserId : user.id;
    if (!v.trim()) {
      flushTypingStop();
      return;
    }
    if (!typingSentRef.current) {
      typingSentRef.current = true;
      void sendChatTyping(selected.businessId, custId, true);
    }
    if (typingStopTimer.current) {
      window.clearTimeout(typingStopTimer.current);
    }
    typingStopTimer.current = window.setTimeout(() => {
      typingStopTimer.current = null;
      if (typingSentRef.current) {
        void sendChatTyping(selected.businessId, custId, false);
        typingSentRef.current = false;
      }
    }, 1600);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    flushTypingStop();
    if (!selected || !input.trim()) {
      return;
    }
    try {
      const body = {
        businessId: selected.businessId,
        customerUserId: variant === 'business' ? selected.customerUserId : null,
        body: input.trim(),
        replyToMessageId: replyTo?.id ?? null,
      };
      const dto = await api.chatSend(body);
      setInput('');
      setReplyTo(null);
      setMessages((prev) => {
        if (prev.some((m) => sameGuid(m.id, dto.id))) {
          return prev;
        }
        return [...prev, dto].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
      });
      void loadThreads();
    } catch (err) {
      pushToast(err.message, 'warning');
    }
  };

  const openExpanded = () => {
    setExpanded(true);
    setUnread(0);
    // Açık konuşmanın sayacını da temizle
    if (selected) {
      const key = convKey(selected.businessId, selected.customerUserId);
      setUnreadMap((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const closeExpanded = () => {
    flushTypingStop();
    setExpanded(false);
  };

  const handleSelectRow = useCallback(
    (row) => {
      if (variant === 'business') {
        setSelected({ businessId: row.businessId, customerUserId: row.customerUserId });
      } else {
        setSelected({ businessId: row.businessId });
      }
      setReplyTo(null);
      setPeerTyping(false);
      // Bu konuşmanın okunmamış sayısını temizle
      const key = convKey(row.businessId, row.customerUserId);
      setUnreadMap((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [variant],
  );

  const threadListButtons = useMemo(
    () =>
      sortedRows.map((row) => {
        const isSel =
          variant === 'business'
            ? selected && sameGuid(selected.customerUserId, row.customerUserId)
            : selected && sameGuid(selected.businessId, row.businessId);
        const label = variant === 'business' ? row.customerEmail : row.businessName;
        const initial = label?.[0]?.toUpperCase() ?? '?';
        const key = convKey(row.businessId, row.customerUserId);
        const unreadCount = unreadMap[key] ?? 0;

        return (
          <li key={`${row.businessId}-${row.customerUserId}`}>
            <button
              type="button"
              onClick={() => handleSelectRow(row)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors active:bg-blue-50
                sm:gap-2 sm:rounded-lg sm:px-2 sm:py-2
                ${isSel ? 'bg-blue-50 sm:bg-blue-100' : 'hover:bg-slate-50 sm:hover:bg-slate-50'}`}
            >
              {/* Avatar — relative ile badge için */}
              <div className="relative shrink-0">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-700 text-white shadow-sm
                    sm:h-7 sm:w-7 sm:text-xs
                    ${isSel ? 'bg-blue-600' : 'bg-slate-600'}`}
                >
                  {initial}
                </div>
                {unreadCount > 0 && !isSel && (
                  <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 py-px text-[10px] font-700 leading-none text-white ring-1 ring-white sm:min-w-[14px] sm:text-[9px]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>

              {/* Label + preview */}
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm sm:text-xs ${
                    unreadCount > 0 && !isSel
                      ? 'font-700 text-slate-900'
                      : isSel
                        ? 'font-600 text-blue-900'
                        : 'font-600 text-slate-800'
                  }`}
                >
                  {label}
                </p>
                {row.preview ? (
                  <p
                    className={`mt-0.5 truncate text-xs sm:text-[10px] ${
                      unreadCount > 0 && !isSel ? 'font-500 text-slate-700' : 'text-slate-500'
                    }`}
                  >
                    {row.preview}
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs italic text-slate-400 sm:hidden">Henüz mesaj yok</p>
                )}
              </div>

              {/* Sağ taraf — mobilde ok, masaüstünde sayac */}
              <div className="shrink-0">
                {unreadCount > 0 && !isSel ? (
                  <span className="hidden min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 py-px text-[9px] font-700 leading-none text-white sm:flex">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : (
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-slate-300 group-hover:text-slate-400 sm:hidden">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </button>
          </li>
        );
      }),
    [sortedRows, selected, variant, handleSelectRow, unreadMap],
  );

  if (!user || (variant === 'business' && user.role !== 'Business')) {
    return null;
  }
  if (variant === 'customer' && user.role !== 'Customer') {
    return null;
  }

  const messageThreadColumn = (
    <div className="flex min-h-0 min-w-0 flex-col overflow-hidden sm:h-full">
      {selected ? (
        <>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden overscroll-contain p-2">
            {messages.map((m) => {
              const mine = sameGuid(m.senderUserId, user.id);
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      mine ? 'rounded-br-md bg-blue-600 text-white' : 'rounded-bl-md bg-slate-100 text-slate-800'
                    }`}
                  >
                    {!mine ? (
                      <p className="mb-1 text-[10px] font-semibold text-slate-500">{m.senderEmail}</p>
                    ) : null}
                    {m.replyToMessageId && (m.replyToBodyPreview || m.replyToSenderEmail) ? (
                      <div
                        className={`mb-2 border-l-2 pl-2 text-xs opacity-90 ${
                          mine ? 'border-white/50' : 'border-blue-400'
                        }`}
                      >
                        <span className="font-medium">{m.replyToSenderEmail}</span>
                        <p className="truncate">{m.replyToBodyPreview}</p>
                      </div>
                    ) : null}
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className={`text-[10px] font-semibold underline ${
                          mine ? 'text-blue-100' : 'text-blue-700'
                        }`}
                        onClick={() => setReplyTo(m)}
                      >
                        Yanıtla
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {peerTyping ? (
              <div className="flex justify-start pl-1">
                <div className="rounded-2xl rounded-bl-md bg-slate-100 px-3 py-2 text-xs text-slate-500">
                  <TypingDots /> <span className="sr-only">Karşı taraf yazıyor</span>
                  <span className="ml-1 align-middle">yazıyor…</span>
                </div>
              </div>
            ) : null}
          </div>
          {replyTo ? (
            <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-2 py-1.5 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-semibold text-slate-600">Yanıt: </span>
                  <span className="text-slate-700">{replyTo.senderEmail}</span>
                  <p className="truncate text-slate-500">{replyTo.body}</p>
                </div>
                <button type="button" className="shrink-0 text-slate-500 hover:text-slate-800" onClick={() => setReplyTo(null)}>
                  ✕
                </button>
              </div>
            </div>
          ) : null}
          <form onSubmit={onSubmit} className="shrink-0 border-t border-slate-100 p-2">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={onInputChange}
                onBlur={() => flushTypingStop()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                rows={2}
                className="ui-input max-h-24 min-h-10 flex-1 resize-none text-sm leading-snug"
                placeholder="Mesaj yazın…"
                autoComplete="off"
              />
              <button type="submit" className="ui-btn-primary min-h-10 shrink-0 px-3 text-sm">
                Gönder
              </button>
            </div>
          </form>
        </>
      ) : (
        <p className="m-auto px-4 text-center text-sm text-slate-500">Sohbet seçin</p>
      )}
    </div>
  );

  const chatPanelContent = (
    <>
      {/* Mobil: geri + başlık + kapat */}
      <div
        className={`flex shrink-0 items-center gap-2 border-b border-slate-200 bg-gradient-to-r from-blue-800 to-blue-700 px-2 py-3 text-white ${isSmUp ? 'hidden' : ''}`}
      >
        {selected ? (
          <button
            type="button"
            onClick={goBackToThreadList}
            className="shrink-0 rounded-lg px-2 py-1 text-2xl leading-none text-white/95 hover:bg-white/10"
            aria-label="Konuşmalara dön"
          >
            ←
          </button>
        ) : (
          <span className="w-9 shrink-0" aria-hidden />
        )}
        <span className="min-w-0 flex-1 truncate text-center font-display text-sm font-bold">
          {selected ? selectedConversationTitle : variant === 'business' ? 'Müşteriler' : 'İşletmeler'}
        </span>
        <button
          type="button"
          onClick={closeExpanded}
          className="shrink-0 rounded-lg px-2 py-1 text-2xl leading-none text-white/90 hover:bg-white/10"
          aria-label="Kapat"
        >
          ×
        </button>
      </div>

      {/* Masaüstü: klasik başlık */}
      <div
        className={`shrink-0 items-center justify-between border-b border-slate-200 bg-gradient-to-r from-blue-800 to-blue-700 px-3 py-2.5 text-white ${isSmUp ? 'flex' : 'hidden'}`}
      >
        <span className="font-display text-sm font-bold">Mesajlar</span>
        <button
          type="button"
          onClick={closeExpanded}
          className="rounded-lg px-2 py-1 text-lg leading-none text-white/90 hover:bg-white/10"
          aria-label="Kapat"
        >
          ×
        </button>
      </div>

      {/* Mobil: tam genişlikte ya liste ya sohbet — tek sütun, patlama yok */}
      {!isSmUp ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
          {!selected ? (
            <>
              {/* Açıklama başlığı */}
              <div className="shrink-0 border-b border-slate-100 bg-white px-4 py-4">
                <p className="font-display text-base font-700 text-slate-800">
                  {variant === 'business' ? 'Müşterileriniz' : 'İşletmeler'}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {variant === 'business'
                    ? 'Sohbet başlatmak için bir müşteriyi seçin'
                    : 'Mesaj göndermek için bir işletme seçin'}
                </p>
              </div>

              {/* Liste ya da boş durum */}
              {sortedRows.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl">
                    💬
                  </div>
                  <p className="text-sm font-600 text-slate-700">
                    {variant === 'business' ? 'Henüz müşteri yok' : 'Henüz işletme yok'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {variant === 'business'
                      ? 'Müşteriler sipariş verdikçe burada görünür'
                      : 'Katalogdan bir işletme seçerek alışveriş yapabilirsiniz'}
                  </p>
                </div>
              ) : (
                <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain divide-y divide-slate-100/80 px-2 py-1">
                  {threadListButtons}
                </ul>
              )}
            </>
          ) : (
            messageThreadColumn
          )}
        </div>
      ) : null}

      {/* Masaüstü: yan yana (tek mount — messageThreadColumn yalnızca burada) */}
      {isSmUp ? (
        <div
          className={`grid min-h-0 flex-1 overflow-hidden bg-white divide-x divide-slate-100 transition-[grid-template-columns] duration-200
            ${listCollapsed ? 'grid-cols-[0px_minmax(0,1fr)]' : 'grid-cols-[minmax(0,38%)_minmax(0,1fr)]'}`}
        >
          {/* Sol liste paneli */}
          <div className={`relative min-h-0 flex flex-col overflow-hidden border-slate-100 border-r ${listCollapsed ? 'w-0' : ''}`}>
            {/* Liste başlığı + kapatma butonu */}
            <div className="sticky top-0 z-[1] flex shrink-0 items-center justify-between bg-slate-50 px-2 py-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {variant === 'business' ? 'Müşteriler' : 'İşletmeler'}
              </p>
              <button
                type="button"
                onClick={() => setListCollapsed(true)}
                className="flex h-5 w-5 items-center justify-center rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600"
                title="Listeyi gizle"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                  <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1">{threadListButtons}</ul>
          </div>

          {/* Sağ mesaj alanı */}
          <div className="relative flex min-h-0 min-w-0 flex-col overflow-hidden">
            {/* Liste kapalıyken sol kenarında aç butonu */}
            {listCollapsed && (
              <button
                type="button"
                onClick={() => setListCollapsed(false)}
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 flex h-12 w-5 items-center justify-center rounded-r-lg bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 shadow-sm"
                title={variant === 'business' ? 'Müşterileri göster' : 'İşletmeleri göster'}
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {/* Toplam okunmamış varsa kırmızı nokta */}
                {Object.keys(unreadMap).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-1 ring-white" />
                )}
              </button>
            )}
            {messageThreadColumn}
          </div>
        </div>
      ) : null}
    </>
  );

  return (
    <>
      {expanded ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sohbet"
          className="pointer-events-auto fixed z-50 flex max-h-[100dvh] w-full flex-col overflow-hidden bg-white
            inset-0 rounded-none
            pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]
            sm:inset-auto sm:left-auto sm:top-auto sm:bottom-[calc(3.5rem+0.75rem)] sm:right-[max(0.75rem,env(safe-area-inset-right,0px))]
            sm:h-[min(68dvh,32rem)] sm:w-[min(28rem,calc(100vw-1.5rem))] sm:max-h-[min(68dvh,32rem)] sm:rounded-2xl sm:border sm:border-slate-200/95 sm:pt-0 sm:pb-0 sm:shadow-[0_8px_40px_rgb(15_23_42/0.18)]"
        >
          {chatPanelContent}
        </div>
      ) : null}

      <div
        className="pointer-events-none fixed z-[45] flex flex-col items-end"
        style={{
          bottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
          right: 'max(0.75rem, env(safe-area-inset-right, 0px))',
        }}
      >
        <button
          type="button"
          onClick={() => (expanded ? closeExpanded() : openExpanded())}
          className={`pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-blue-600 text-2xl text-white shadow-lg shadow-blue-900/30 ring-2 ring-white/90 ${expanded ? 'max-sm:hidden' : ''}`}
          aria-expanded={expanded}
          aria-label={expanded ? 'Sohbeti kapat' : 'Sohbeti aç'}
        >
          💬
          {unread > 0 && !expanded ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {unread > 9 ? '9+' : unread}
            </span>
          ) : null}
        </button>
      </div>
    </>
  );
}

function normalizeMessage(p) {
  return {
    id: p.id ?? p.Id,
    businessId: p.businessId ?? p.BusinessId,
    customerUserId: p.customerUserId ?? p.CustomerUserId,
    senderUserId: p.senderUserId ?? p.SenderUserId,
    senderEmail: p.senderEmail ?? p.SenderEmail,
    body: p.body ?? p.Body,
    sentAt: p.sentAt ?? p.SentAt,
    replyToMessageId: p.replyToMessageId ?? p.ReplyToMessageId ?? null,
    replyToSenderEmail: p.replyToSenderEmail ?? p.ReplyToSenderEmail ?? null,
    replyToBodyPreview: p.replyToBodyPreview ?? p.ReplyToBodyPreview ?? null,
  };
}
