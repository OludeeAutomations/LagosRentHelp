import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  Droplets,
  MapPin,
  MessageSquareText,
  Navigation,
  Quote,
  ShieldCheck,
  Star,
  Volume2,
  Waves,
  Wrench,
  Zap,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { areaReviewService } from "@/services/areaReviewService";
import type { AreaReviewLocationDetail } from "@/types/areaReviews";
import {
  floodRiskLabel,
  formatNaira,
  formatPropertyType,
  formatRating,
} from "./areaReviewUtils";

const ratingCards = [
  { key: "electricity", label: "Electricity", icon: Zap },
  { key: "water", label: "Water", icon: Droplets },
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "roads", label: "Roads & access", icon: Navigation },
  { key: "noise", label: "Quietness", icon: Volume2 },
  { key: "maintenance", label: "Maintenance", icon: Wrench },
] as const;

const stars = (rating: number) => (
  <span className="inline-flex" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star key={star} className={`h-4 w-4 ${star <= Math.round(rating) ? "fill-[#e8b949] text-[#e8b949]" : "fill-slate-100 text-slate-200"}`} />
    ))}
  </span>
);

const AreaReviewDetailPage = () => {
  const { slug = "" } = useParams();
  const [location, setLocation] = useState<AreaReviewLocationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    areaReviewService
      .getLocation(slug)
      .then((result) => active && setLocation(result))
      .catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : "Unable to load this area."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return <div className="flex min-h-[65vh] items-center justify-center bg-[#f7f6f1]"><span className="h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-[#129B36]" /></div>;
  }

  if (!location || error) {
    return (
      <div className="bg-[#f7f6f1] px-4 py-24 text-center">
        <MapPin className="mx-auto h-12 w-12 text-[#129B36]" />
        <h1 className="mt-5 text-3xl font-bold">We do not have this location yet</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">Be the first resident to add it and share a useful, honest experience.</p>
        <Link to={`/area-reviews/write?name=${encodeURIComponent(slug.replace(/-/g, " "))}`} className="mt-7 inline-flex rounded-xl bg-[#129B36] px-6 py-3 font-bold text-white">Add this location</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f1] text-slate-950">
      <section className="relative isolate overflow-hidden bg-[#103f2b] text-white">
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
          <span className="absolute -right-28 -top-44 h-[30rem] w-[30rem] rounded-full border-[70px] border-white/[0.04]" />
          <span className="absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14">
          <Link to="/area-reviews" className="inline-flex items-center gap-2 text-sm font-semibold text-green-50/70 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> All area reviews</Link>
          <div className="mt-8 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#f4ce70]">
                <span className="capitalize">{location.type === "lga" ? "Local government" : location.type}</span><span>·</span><span>{location.lga}, Lagos</span>
              </div>
              <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl">Living in {location.name}</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-green-50/75">{location.description}</p>
            </div>
            <Link to={`/area-reviews/write?location=${location.slug}`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#103f2b] shadow-lg shadow-black/10 transition hover:bg-green-50">
              <MessageSquareText className="h-4 w-4" /> Review this place
            </Link>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
        <div className="-mt-9 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/60 bg-white p-6 shadow-xl shadow-slate-900/[0.06]">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Resident score</p>
            <div className="mt-5 flex items-end gap-3"><span className="text-5xl font-bold text-[#103f2b]">{formatRating(location.averageRating)}</span>{location.averageRating !== null && <span className="pb-1 text-slate-400">/ 5</span>}</div>
            <p className="mt-3 text-sm text-slate-500">Based on {location.reviewCount} approved {location.reviewCount === 1 ? "review" : "reviews"}</p>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white p-6 shadow-xl shadow-slate-900/[0.06]">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Reported annual rent</p>
            <p className="mt-6 text-2xl font-bold">{formatNaira(location.averageRent)}</p>
            <p className="mt-3 text-sm text-slate-500">Average of resident-submitted figures</p>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white p-6 shadow-xl shadow-slate-900/[0.06]">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Reported move-in cost</p>
            <p className="mt-6 text-2xl font-bold">{formatNaira(location.averageMoveInCost)}</p>
            <p className="mt-3 text-sm text-slate-500">Rent and additional charges combined</p>
          </div>
        </div>

        {location.reviewCount > 0 && (
          <section className="mt-14">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#129B36]">At a glance</p><h2 className="mt-2 text-2xl font-bold">Daily living scores</h2></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ratingCards.map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#129B36]"><Icon className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="text-sm text-slate-500">{label}</p><p className="text-base font-bold">{location.ratings[key].toFixed(1)}</p></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#129B36]" style={{ width: `${(location.ratings[key] / 5) * 100}%` }} /></div></div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-sm font-bold uppercase tracking-wider text-[#129B36]">Resident experiences</p><h2 className="mt-2 text-3xl font-bold">What people say</h2></div>
          </div>

          {location.reviews.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-green-200 bg-white px-6 py-14 text-center">
              <Building2 className="mx-auto h-11 w-11 text-[#129B36]" />
              <h3 className="mt-5 text-xl font-bold">Be the first voice for {location.name}</h3>
              <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-600">A clear account of rent, utilities and daily life could help the next renter make a better decision.</p>
              <Link to={`/area-reviews/write?location=${location.slug}`} className="mt-6 inline-flex rounded-xl bg-[#129B36] px-6 py-3 text-sm font-bold text-white">Share your experience</Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {location.reviews.map((review) => (
                <article key={review.id} className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-7">
                  <Quote className="absolute right-6 top-5 h-12 w-12 text-green-50" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#103f2b] text-sm font-bold text-white">{review.displayName.charAt(0).toUpperCase()}</span>
                      <div><p className="font-bold">{review.displayName}</p><p className="text-xs text-slate-500">{review.residencyStatus === "current" ? "Current resident" : "Former resident"}{review.evidenceVerified ? " · Evidence checked" : ""}</p></div>
                    </div>
                    <div className="text-right">{stars(review.overallRating)}<p className="mt-1 text-xs font-semibold text-slate-500">{review.overallRating.toFixed(1)}</p></div>
                  </div>
                  <h3 className="mt-6 text-xl font-bold">{review.headline}</h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{review.review}</p>
                  <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1.5">{formatPropertyType(review.propertyType)}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5"><CalendarDays className="mr-1 inline h-3.5 w-3.5" /> {review.livedFrom}–{review.livedTo || "present"}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5"><Waves className="mr-1 inline h-3.5 w-3.5" /> {floodRiskLabel[review.floodRisk]}</span>
                    {review.evidenceVerified && <span className="rounded-full bg-green-50 px-3 py-1.5 text-[#0e7d2b]"><BadgeCheck className="mr-1 inline h-3.5 w-3.5" /> Verified resident</span>}
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 text-sm">
                    <div><p className="text-xs text-slate-400">Rent reported</p><p className="mt-1 font-bold">{formatNaira(review.rentAmount)}</p></div>
                    <div><p className="text-xs text-slate-400">Move-in cost</p><p className="mt-1 font-bold">{formatNaira(review.moveInCost)}</p></div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="mt-12 rounded-3xl bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          <strong>Community information:</strong> Reviews describe personal experiences and may change over time. Confirm current costs and conditions during your own inspection before making a payment.
        </div>
      </main>
    </div>
  );
};

export default AreaReviewDetailPage;
