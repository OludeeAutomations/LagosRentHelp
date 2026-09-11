type DecorationTone = "sky" | "green" | "amber" | "violet" | "rose";

export const DASHBOARD_SUMMARY_CARD_CLASS =
  "relative min-h-[210px] overflow-hidden border-[#143f2b] bg-[#143f2b] text-white shadow-lg shadow-[#143f2b]/20 ring-1 ring-white/20";

const DashboardSummaryDecoration = ({ tone, compact = false }: { tone: DecorationTone; compact?: boolean }) => {
  const colors = {
    sky: "border-sky-200/[0.05] bg-sky-200/[0.02]",
    green: "border-emerald-200/[0.05] bg-emerald-200/[0.02]",
    amber: "border-amber-200/[0.05] bg-amber-200/[0.02]",
    violet: "border-violet-200/[0.05] bg-violet-200/[0.02]",
    rose: "border-rose-200/[0.05] bg-rose-200/[0.02]",
  }[tone];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-56 overflow-hidden">
      <span className={`absolute rounded-full ${compact ? "-right-10 -top-14 h-40 w-40 border-[28px]" : "-right-12 -top-16 h-48 w-48 border-[32px]"} ${colors}`} />
      <span className={`absolute rounded-full ${compact ? "-bottom-10 right-4 h-40 w-40 border-[28px]" : "-bottom-[4.5rem] right-2 h-48 w-48 border-[32px]"} ${colors}`} />
    </div>
  );
};

export default DashboardSummaryDecoration;
