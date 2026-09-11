type DecorationTone = "sky" | "green" | "amber" | "violet" | "rose";

export const DASHBOARD_SUMMARY_CARD_CLASS =
  "relative min-h-[210px] overflow-hidden border-[#143f2b] bg-[#143f2b] py-0 text-white shadow-lg shadow-[#143f2b]/20 ring-1 ring-white/20";

export const DASHBOARD_SUMMARY_CONTENT_CLASS =
  "relative z-10 m-4 flex w-fit max-w-[calc(100%_-_2rem)] self-start items-center gap-3 rounded-xl border border-white/15 bg-white/[0.055] px-4 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md sm:m-5 sm:max-w-[calc(100%_-_2.5rem)]";

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
      <g fill="none" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" opacity="0.13">
        <path
          d="M-34 13C77-7 260-5 385 17C474 33 524 69 520 113C516 163 438 201 322 211C189 223 50 197-15 156C-63 126-68 78-31 48C18 9 134 0 235 17C326 33 382 65 378 102C374 139 311 165 224 163C139 161 69 135 45 104C26 79 48 57 91 48C144 37 213 42 246 61C277 79 270 104 230 123C181 146 101 146 48 124"
          strokeWidth="4"
        />
        <path
          d="M349 23C426 23 474 46 486 78C500 116 473 151 424 174"
          strokeWidth="3"
        />
        <path
          d="M462 24C499 32 519 51 522 78"
          strokeWidth="3"
        />
      </g>
    </svg>
  );
};

export default DashboardSummaryDecoration;
