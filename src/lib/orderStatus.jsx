const STATUS_MAP = {
  Pending:   { label: 'Bekliyor',    cls: 'bg-amber-100 text-amber-800 ring-amber-300/60' },
  Completed: { label: 'Tamamlandı', cls: 'bg-emerald-100 text-emerald-800 ring-emerald-300/60' },
  Cancelled: { label: 'İptal',       cls: 'bg-rose-100 text-rose-700 ring-rose-300/60' },
};

export function orderStatusLabel(status) {
  return STATUS_MAP[status]?.label ?? status;
}

export function StatusBadge({ status }) {
  const { label, cls } = STATUS_MAP[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600 ring-slate-200' };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-600 ring-1 ${cls}`}>
      {label}
    </span>
  );
}
