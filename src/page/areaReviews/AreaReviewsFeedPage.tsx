import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, MessageSquareText, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { areaReviewService } from "@/services/areaReviewService";
import type { FeaturedAreaReview } from "@/types/areaReviews";
import AreaReviewPreviewCard from "./AreaReviewPreviewCard";

const batchSize = 23;

const getAllApprovedReviews = async (search: string) => {
  const approvedReviews: FeaturedAreaReview[] = [];
  let hasMore = true;

  while (hasMore) {
    const result = await areaReviewService.getApprovedReviews({
      limit: batchSize,
      offset: approvedReviews.length,
      search,
    });
    approvedReviews.push(...result.reviews);
    hasMore = result.hasMore && result.reviews.length > 0;
  }

  return approvedReviews;
};

const AreaReviewsFeedPage = () => {
  const [reviews, setReviews] = useState<FeaturedAreaReview[]>([]);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async (activeSearch: string) => {
    setLoading(true);
    try {
      setReviews(await getAllApprovedReviews(activeSearch));
    } catch (reason: unknown) {
      toast.error(reason instanceof Error ? reason.message : "Unable to load approved reviews.");
      setReviews([]);
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

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-950">
      <section className="bg-[#103f2b] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Link to="/area-reviews" className="inline-flex items-center gap-2 text-sm font-semibold text-green-50/70 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Area Reviews</Link>
          <p className="mt-7 text-sm font-bold uppercase tracking-[0.18em] text-[#8dd9a1]">Approved resident experiences</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Lagos area reviews</h1>
          <p className="mt-4 max-w-2xl leading-7 text-green-50/75">Read honest experiences about rent, utilities and everyday living conditions across Lagos.</p>
          <form onSubmit={submitSearch} className="mt-8 flex max-w-2xl items-center gap-2 rounded-2xl bg-white p-2">
            <Search className="ml-3 h-5 w-5 shrink-0 text-slate-400" />
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
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => <AreaReviewPreviewCard key={review.id} review={review} />)}
          </div>
        )}
      </section>
    </main>
  );
};

export default AreaReviewsFeedPage;
