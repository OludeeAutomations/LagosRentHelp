import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock3, Loader2, MapPin, RefreshCw, Star, Trash2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { areaReviewService } from "@/services/areaReviewService";
import { useAuthStore } from "@/stores/authStore";
import type { ModerationAreaReview } from "@/types/areaReviews";

const statusStyle = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-green-200 bg-green-50 text-green-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
};

const AdminAreaReviewsPage = () => {
  const user = useAuthStore((state) => state.user);
  const [reviews, setReviews] = useState<ModerationAreaReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      setReviews(await areaReviewService.getModerationQueue());
    } catch (reason: unknown) {
      toast.error(reason instanceof Error ? reason.message : "Unable to load resident reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const moderate = async (review: ModerationAreaReview, status: "approved" | "rejected") => {
    const note = status === "rejected"
      ? window.prompt("Give the contributor a short reason for rejection:", "Contains private or unverifiable information")
      : undefined;
    if (status === "rejected" && note === null) return;
    setActionId(review.id);
    try {
      await areaReviewService.moderate(review.id, status, note || undefined);
      toast.success(status === "approved" ? "Review is now public." : "Review rejected.");
      await loadReviews();
    } catch (reason: unknown) {
      toast.error(reason instanceof Error ? reason.message : "Unable to update this review.");
    } finally {
      setActionId("");
    }
  };

  const deleteReview = async (review: ModerationAreaReview) => {
    if (!window.confirm(`Permanently delete “${review.headline}”? This cannot be undone.`)) return;

    setActionId(review.id);
    try {
      await areaReviewService.deleteReview(review.id);
      setReviews((current) => current.filter((item) => item.id !== review.id));
      toast.success("Review deleted permanently.");
    } catch (reason: unknown) {
      toast.error(reason instanceof Error ? reason.message : "Unable to delete this review.");
    } finally {
      setActionId("");
    }
  };

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm text-gray-500">Approve useful, experience-based submissions that protect personal information.</p><p className="mt-1 text-xs font-semibold text-amber-700">{reviews.filter((review) => review.status === "pending").length} awaiting moderation</p></div>
        <Button variant="outline" onClick={() => void loadReviews()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl border bg-white py-20 text-sm text-gray-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div className="mt-8 rounded-2xl border bg-white py-20 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-[#129B36]" /><h2 className="mt-4 text-lg font-semibold">No reviews in the queue</h2><p className="mt-1 text-sm text-gray-500">New resident submissions will appear here.</p></div>
      ) : (
        <div className="mt-8 space-y-5">
          {reviews.map((review) => (
            <article key={review.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between lg:p-6">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={statusStyle[review.status]}>{review.status === "pending" ? <Clock3 className="mr-1 h-3 w-3" /> : review.status === "approved" ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}{review.status}</Badge>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {review.overallRating}/5</span>
                    <span className="text-xs text-gray-400">Submitted {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(review.submittedAt))}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1"><h2 className="text-lg font-bold text-gray-950">{review.headline}</h2><Link to={`/area-reviews/${review.locationSlug}`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#129B36] hover:underline"><MapPin className="h-3.5 w-3.5" /> {review.locationName}, {review.lga}</Link></div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">{review.review}</p>
                  <div className="mt-5 grid gap-3 rounded-xl bg-gray-50 p-4 text-xs sm:grid-cols-3">
                    <div><p className="text-gray-400">Contributor account</p><p className="mt-1 font-semibold text-gray-800">{review.reviewerName}</p><p className="text-gray-500">{review.reviewerEmail}</p></div>
                    <div><p className="text-gray-400">Public identity</p><p className="mt-1 font-semibold text-gray-800">{review.displayName}</p></div>
                    <div><p className="text-gray-400">Residency</p><p className="mt-1 font-semibold capitalize text-gray-800">{review.residencyStatus} resident · {review.livedFrom}–{review.livedTo || "present"}</p></div>
                  </div>
                  {review.moderationNote && <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700"><strong>Moderation note:</strong> {review.moderationNote}</p>}
                </div>
                <div className="flex shrink-0 gap-2 lg:flex-col">
                  {review.status === "pending" && (
                    <>
                      <Button onClick={() => void moderate(review, "approved")} disabled={actionId === review.id} className="bg-[#129B36] hover:bg-[#0e7d2b]"><CheckCircle2 className="h-4 w-4" /> Approve</Button>
                      <Button variant="outline" onClick={() => void moderate(review, "rejected")} disabled={actionId === review.id} className="border-red-200 text-red-600 hover:bg-red-50"><XCircle className="h-4 w-4" /> Reject</Button>
                    </>
                  )}
                  {user?.role === "super_admin" && (
                    <Button variant="outline" onClick={() => void deleteReview(review)} disabled={actionId === review.id} className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                      {actionId === review.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default AdminAreaReviewsPage;
