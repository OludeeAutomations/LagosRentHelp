import { Building2, ChevronRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { AreaReviewLocation } from "@/types/areaReviews";
import { formatNaira, formatRating, locationTypeLabel } from "./areaReviewUtils";

const AreaLocationCard = ({ location, index = 0 }: { location: AreaReviewLocation; index?: number }) => (
  <Link
    to={`/area-reviews/${location.slug}`}
    className="group relative flex min-h-64 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-[0_20px_45px_rgba(15,61,42,0.10)]"
  >
    <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#129B36] via-emerald-300 to-[#e8bb50] opacity-0 transition group-hover:opacity-100" />
    <div className="flex items-start justify-between gap-4">
      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${index % 3 === 0 ? "bg-amber-50 text-amber-700" : "bg-green-50 text-[#129B36]"}`}>
        <Building2 className="h-5 w-5" />
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
        <Star className="h-3.5 w-3.5 fill-[#e8b949] text-[#e8b949]" /> {formatRating(location.averageRating)}
      </span>
    </div>
    <div className="mt-8">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{locationTypeLabel(location.type)} · {location.lga}</p>
      <h3 className="mt-2 text-2xl font-bold group-hover:text-[#0e7d2b]">{location.name}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{location.description}</p>
    </div>
    <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-5">
      <div>
        <p className="text-xs text-slate-400">Reported average rent</p>
        <p className="mt-1 text-sm font-bold">{formatNaira(location.averageRent)}</p>
      </div>
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#129B36]">{location.reviewCount ? `${location.reviewCount} reviews` : "Be first"}<ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
    </div>
  </Link>
);

export default AreaLocationCard;
