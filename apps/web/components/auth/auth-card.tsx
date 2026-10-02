export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-line bg-white p-7 shadow-lift sm:p-9">
      <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 text-[15px] text-slate-600">{subtitle}</p>}
      <div className="mt-7">{children}</div>
      {footer && <div className="mt-7 border-t border-line pt-5 text-center text-sm text-slate-600">{footer}</div>}
    </div>
  );
}
