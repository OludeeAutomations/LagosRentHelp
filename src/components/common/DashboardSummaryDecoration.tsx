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
  <section className="relative overflow-hidden rounded-3xl bg-[#143f2b] px-6 py-8 text-white shadow-sm sm:px-8 sm:py-10">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[48px] border-sky-200/[0.05] bg-sky-200/[0.02] sm:-right-28 sm:-top-32 sm:h-96 sm:w-96 sm:border-[56px]" />
      <span className="absolute -bottom-28 right-6 h-80 w-80 rounded-full border-[48px] border-sky-200/[0.05] bg-sky-200/[0.02] sm:-bottom-36 sm:right-20 sm:h-96 sm:w-96 sm:border-[56px]" />
    </div>

    <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-2xl">
        <p className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{title}</h2>
        {description && <div className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">{description}</div>}
      </div>
      {action && <div className="self-start lg:pt-1">{action}</div>}
    </div>

    <div className="relative z-10 mt-8 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm sm:p-6">
      <div className={`grid gap-6 ${items.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
        {items.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex min-h-16 items-center gap-3">
            <Icon className="h-7 w-7 shrink-0 text-emerald-200" strokeWidth={1.8} />
            <div>
              <p className="text-2xl font-bold leading-none">{value}</p>
              <p className="mt-1.5 text-sm text-white/70">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default DashboardSummaryBanner;
