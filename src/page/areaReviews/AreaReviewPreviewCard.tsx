import { ChevronRight, Quote, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { FeaturedAreaReview } from "@/types/areaReviews";

const AreaReviewPreviewCard = ({ review }: { review: FeaturedAreaReview }) => (
  <Link
    to={`/area-reviews/${review.locationSlug}`}
    className="group relative flex min-h-72 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-[#fafaf8] p-6 transition hover:-translate-y-1 hover:border-green-200 hover:shadow-xl hover:shadow-green-950/[0.06]"
  >
    <Quote className="absolute right-5 top-5 h-12 w-12 text-green-100/70" />
    <div className="relative flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#129B36]">{review.locationName}</p>
        <p className="mt-1 text-xs text-slate-500">{review.lga}, Lagos</p>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow-sm">
        <Star className="h-3.5 w-3.5 fill-[#e8b949] text-[#e8b949]" />
        {review.overallRating.toFixed(1)}
      </span>
    </div>
    <h3 className="relative mt-6 text-xl font-bold transition group-hover:text-[#0e7d2b]">{review.headline}</h3>
    <p className="relative mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{review.review}</p>
    <div className="relative mt-auto flex items-center justify-between gap-4 border-t border-slate-200/70 pt-5 text-xs">
      <span className="font-semibold text-slate-600">
        {review.displayName} · {review.residencyStatus === "current" ? "Current resident" : "Former resident"}
      </span>
      <span className="inline-flex items-center gap-1 font-bold text-[#129B36]">
        Read review <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </div>
  </Link>
);

export default AreaReviewPreviewCard;
