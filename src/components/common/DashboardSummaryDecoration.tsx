type DecorationTone = "sky" | "green" | "amber" | "violet" | "rose";

export const DASHBOARD_SUMMARY_CARD_CLASS =
  "relative min-h-[210px] overflow-hidden border-[#143f2b] bg-[#0b1710] py-0 text-white shadow-lg shadow-[#143f2b]/20 ring-1 ring-white/20";

export const DASHBOARD_SUMMARY_CONTENT_CLASS =
  "relative z-10 m-5 flex w-fit max-w-[calc(100%_-_2.5rem)] self-start items-center gap-4 border border-white/20 bg-white/[0.1] px-4 py-3.5 shadow-[0_12px_30px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md";

const DashboardSummaryDecoration = (_props: { tone: DecorationTone; compact?: boolean }) => {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <img src="/dashboard-summary-background.jpg" alt="" className="h-full w-full object-cover object-center" />
      <span className="absolute inset-0 bg-[#06150e]/30" />
    </div>
  );
};

export default DashboardSummaryDecoration;
