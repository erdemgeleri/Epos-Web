import { useLive } from '../context/LiveContext';

const toneClasses = {
  info: 'border-slate-200/90 bg-white text-slate-700 shadow-slate-900/8',
  success: 'border-emerald-200/90 bg-emerald-50/95 text-emerald-900 shadow-emerald-900/10',
  warning: 'border-amber-200/90 bg-amber-50/95 text-amber-950 shadow-amber-900/10',
};

export default function ToastStack() {
  const { toasts } = useLive();

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-3 right-3 z-50 flex flex-col gap-2 sm:bottom-auto sm:left-auto sm:right-4 sm:top-4 sm:w-80 sm:max-w-[calc(100vw-2rem)]"
      style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm ${toneClasses[toast.tone] ?? toneClasses.info}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
