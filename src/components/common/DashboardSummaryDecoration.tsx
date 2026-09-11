import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface DashboardSummaryItem {
  label: string;
  value: number | string;
  icon: LucideIcon;
}

interface DashboardSummaryBannerProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  items: DashboardSummaryItem[];
  action?: ReactNode;
}

const DashboardSummaryBanner = ({
  eyebrow,
  title,
  description,
  items,
  action,
}: DashboardSummaryBannerProps) => (
  <section className="overflow-hidden rounded-3xl bg-[#143f2b] px-6 py-8 text-white shadow-sm sm:px-8 sm:py-10">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">{eyebrow}</p>
        <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{title}</h2>
        {description && <div className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">{description}</div>}
      </div>
      {action && <div className="self-start lg:pt-1">{action}</div>}
    </div>

    <div className={`mt-8 grid gap-6 border-t border-white/15 pt-6 ${items.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
      {items.map(({ label, value, icon: Icon }) => (
        <div key={label} className="flex items-center gap-3">
          <Icon className="h-7 w-7 shrink-0 text-emerald-200" strokeWidth={1.8} />
          <div>
            <p className="text-2xl font-bold leading-none">{value}</p>
            <p className="mt-1.5 text-sm text-white/70">{label}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default DashboardSummaryBanner;
