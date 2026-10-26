import { useEffect, useState } from "react";
import { Building2, CheckCircle2, Clock3, MapPin, MessageCircle, MessageSquareText, Pencil, Star, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { areaReviewService } from "@/services/areaReviewService";
import { useAreaReviewsAuthStore } from "@/stores/areaReviewsAuthStore";
import type { MyAreaReview } from "@/types/areaReviews";
import { getLandlordWhatsAppInviteUrl } from "@/utils/landlordInvite";

const statusStyle = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-green-200 bg-green-50 text-green-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
};

const statusIcon = {
  pending: Clock3,
  approved: CheckCircle2,
  rejected: XCircle,
};

const MyAreaReviewsPage = () => {
  const { user, loading: authLoading } = useAreaReviewsAuthStore();
  const [reviews, setReviews] = useState<MyAreaReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setReviews([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    areaReviewService.getMyReviews()
      .then((result) => active && setReviews(result))
      .catch((reason: unknown) => {
        if (active) toast.error(reason instanceof Error ? reason.message : "Unable to load your reviews.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [authLoading, user]);

  if (authLoading || loading) {
    return <div className="flex min-h-[65vh] items-center justify-center bg-[#fafafa]"><span className="h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-[#129B36]" /></div>;
  }

  if (!user) {
    return (
      <main className="min-h-[70vh] bg-[#fafafa] px-4 py-20 text-center">
        <MessageSquareText className="mx-auto h-12 w-12 text-[#129B36]" />
        <h1 className="mt-5 text-3xl font-bold">Sign in to see your reviews</h1>
        <p className="mx-auto mt-3 max-w-lg text-slate-600">Your submitted, approved and rejected reviews will all appear here.</p>
        <Link to="/area-reviews/login" state={{ from: "/area-reviews/my-reviews" }} className="mt-7 inline-flex rounded-xl bg-[#129B36] px-6 py-3 font-bold text-white">Sign in</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#129B36]">Your contributions</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">My reviews</h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">Track moderation and update your experience when costs or living conditions change.</p>
          </div>
          <Link to="/area-reviews/write" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#129B36] px-5 py-3 text-sm font-bold text-white hover:bg-[#0e7d2b]"><MessageSquareText className="h-4 w-4" /> Share another review</Link>
        </div>

        {reviews.length > 0 && (
          <section className="mt-8 flex flex-col gap-5 rounded-3xl border border-green-100 bg-green-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#129B36] shadow-sm"><Building2 className="h-6 w-6" /></span>
              <div>
                <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold text-[#103f2b]">Know a landlord, developer or caretaker?</h2><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#0e7d2b]">Optional</span></div>
                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">Help us bring more verified homes to Lagos renters. If you know a landlord, property developer or caretaker you trust, please share this invitation with them. It remains separate from every review and contains no review, rating or reviewed location.</p>
              </div>
            </div>
            <a href={getLandlordWhatsAppInviteUrl()} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#129B36] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0e7d2b]"><MessageCircle className="h-4 w-4" />Invite through WhatsApp</a>
          </section>
        )}

        {reviews.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-green-200 bg-white px-6 py-16 text-center">
            <MessageSquareText className="mx-auto h-11 w-11 text-[#129B36]" />
            <h2 className="mt-5 text-2xl font-bold">You have not submitted a review yet</h2>
            <p className="mx-auto mt-3 max-w-lg text-slate-600">Share what living in your area is really like and help another Lagos renter decide wisely.</p>
            <Link to="/area-reviews/write" className="mt-6 inline-flex rounded-xl bg-[#129B36] px-6 py-3 text-sm font-bold text-white">Write your first review</Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {reviews.map((review) => {
              const StatusIcon = statusIcon[review.status];
              return (
                <article key={review.id} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge variant="outline" className={statusStyle[review.status]}><StatusIcon className="mr-1 h-3.5 w-3.5" />{review.status}</Badge>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-600"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{review.overallRating.toFixed(1)}</span>
                  </div>
                  <div className="mt-5">
                    <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#129B36]"><MapPin className="h-3.5 w-3.5" />{review.locationName}, {review.lga}</p>
                    <h2 className="mt-2 text-xl font-bold">{review.headline}</h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{review.review}</p>
                  </div>
                  {review.moderationNote && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"><strong>Admin note:</strong> {review.moderationNote}</p>}
                  <p className="mt-5 text-xs text-slate-400">Last updated {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(review.updatedAt))}</p>
                  <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                    <Link to={`/area-reviews/write?review=${review.id}`} className="inline-flex items-center gap-2 rounded-xl bg-[#103f2b] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0b2f20]"><Pencil className="h-4 w-4" />{review.status === "approved" ? "Update review" : "Edit review"}</Link>
                    {review.status === "approved" && <Link to={`/area-reviews/${review.locationSlug}`} className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">View public review</Link>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyAreaReviewsPage;
