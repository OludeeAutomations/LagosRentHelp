type DecorationTone = "sky" | "green" | "amber" | "violet" | "rose";

export const DASHBOARD_SUMMARY_CARD_CLASS =
  "relative min-h-[210px] overflow-hidden border-[#143f2b] bg-[#143f2b] text-white shadow-lg shadow-[#143f2b]/20 ring-1 ring-white/20";

const DashboardSummaryDecoration = ({ tone }: { tone: DecorationTone }) => {
  const colors = {
    sky: "border-sky-200/20 bg-sky-200/10",
    green: "border-emerald-200/20 bg-emerald-200/10",
    amber: "border-amber-200/20 bg-amber-200/10",
    violet: "border-violet-200/20 bg-violet-200/10",
    rose: "border-rose-200/20 bg-rose-200/10",
  }[tone];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-44 overflow-hidden">
      <span className={`absolute -right-11 -top-12 h-36 w-36 rounded-full border-[26px] ${colors}`} />
      <span className={`absolute -bottom-14 right-8 h-32 w-32 rounded-full border-[24px] ${colors}`} />
    </div>
  );
};

export default DashboardSummaryDecoration;
