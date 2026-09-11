type DecorationTone = "sky" | "green" | "amber" | "violet" | "rose";

export const DASHBOARD_SUMMARY_CARD_CLASS =
  "relative min-h-[210px] overflow-hidden border-[#143f2b] bg-[#143f2b] py-0 text-white shadow-lg shadow-[#143f2b]/20 ring-1 ring-white/20";

export const DASHBOARD_SUMMARY_CONTENT_CLASS =
  "relative z-10 m-4 flex flex-1 items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.08] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm sm:m-5 sm:p-6";

const DashboardSummaryDecoration = ({ tone }: { tone: DecorationTone }) => {
  const stroke = {
    sky: "#7dd3fc",
    green: "#6ee7b7",
    amber: "#fde68a",
    violet: "#c4b5fd",
    rose: "#fda4af",
  }[tone];

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 500 210"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full">
      <g fill="none" stroke={stroke} strokeLinecap="round" opacity="0.09">
        <path d="M-95 24C70-50 326-45 565 112" strokeWidth="5" />
        <path d="M-125 95C92-20 356 4 555 181" strokeWidth="4" />
        <path d="M-78 184C132 62 384 72 568 256" strokeWidth="5" />
        <path d="M34 238C190 116 408 116 558 285" strokeWidth="3" />
      </g>
    </svg>
  );
};

export default DashboardSummaryDecoration;
