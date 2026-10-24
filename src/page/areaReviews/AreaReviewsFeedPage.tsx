import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageSquareText, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { areaReviewService } from "@/services/areaReviewService";
import type { FeaturedAreaReview } from "@/types/areaReviews";
import AreaReviewPreviewCard from "./AreaReviewPreviewCard";

const pageSize = 6;

const AreaReviewsFeedPage = () => {
  const [reviews, setReviews] = useState<FeaturedAreaReview[]>([]);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const loadReviews = useCallback(async (activeSearch: string) => {
    setLoading(true);
    try {
      const result = await areaReviewService.getApprovedReviews({ limit: pageSize, search: activeSearch });
      setReviews(result.reviews);
      setHasMore(result.hasMore);
    } catch (reason: unknown) {
      toast.error(reason instanceof Error ? reason.message : "Unable to load approved reviews.");
      setReviews([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReviews(search);
  }, [loadReviews, search]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSearch(query.trim());
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const result = await areaReviewService.getApprovedReviews({
        limit: pageSize,
        offset: reviews.length,
        search,
      });
      setReviews((current) => [...current, ...result.reviews]);
      setHasMore(result.hasMore);
    } catch (reason: unknown) {
      toast.error(reason instanceof Error ? reason.message : "Unable to load more reviews.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-950">
      <section className="bg-[#103f2b] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8dd9a1]">Approved resident experiences</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Lagos area reviews</h1>
          <p className="mt-4 max-w-2xl leading-7 text-green-50/75">Read honest experiences about rent, utilities and everyday living conditions across Lagos.</p>
          <form onSubmit={submitSearch} className="mt-8 flex max-w-2xl gap-2 rounded-2xl bg-white p-2">
            <Search className="ml-3 mt-3 h-5 w-5 shrink-0 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search an area, LGA or review" className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm text-slate-950 outline-none" />
            <Button type="submit" className="bg-[#129B36] px-5 hover:bg-[#0e7d2b]">Search</Button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-72 animate-pulse rounded-3xl bg-white" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-green-200 bg-white px-6 py-16 text-center">
            <MessageSquareText className="mx-auto h-11 w-11 text-[#129B36]" />
            <h2 className="mt-5 text-2xl font-bold">No approved reviews found</h2>
            <p className="mx-auto mt-3 max-w-lg text-slate-600">Try another search or share your experience to help the next Lagos renter.</p>
            <Link to="/area-reviews/write" className="mt-6 inline-flex rounded-xl bg-[#129B36] px-6 py-3 text-sm font-bold text-white">Share your experience</Link>
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => <AreaReviewPreviewCard key={review.id} review={review} />)}
            </div>
            {hasMore && (
              <div className="mt-10 text-center">
                <Button onClick={() => void loadMore()} disabled={loadingMore} className="bg-[#103f2b] px-7 hover:bg-[#0b2f20]">
                  {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loadingMore ? "Loading reviews..." : "Load more reviews"}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default AreaReviewsFeedPage;
