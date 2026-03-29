import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireRole({ role, children }) {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="ui-card-muted px-8 py-10 text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-pulse rounded-full bg-blue-200/80" aria-hidden />
          <p className="text-sm font-medium text-slate-600">Yükleniyor…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }

  if (!user.isActive) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <div className="ui-card max-w-md p-8 text-center">
          <p className="font-display text-lg font-semibold text-rose-800">Hesap pasif</p>
          <p className="mt-2 text-sm text-rose-700/90">Yönetici ile iletişime geçin.</p>
        </div>
      </div>
    );
  }

  return children;
}
