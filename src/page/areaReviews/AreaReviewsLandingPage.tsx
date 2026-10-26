import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { areaReviewService } from "@/services/areaReviewService";
import type { AreaReviewLocation, FeaturedAreaReview } from "@/types/areaReviews";
import AreaLocationCard from "./AreaLocationCard";
import AreaReviewPreviewCard from "./AreaReviewPreviewCard";
import { locationTypeLabel } from "./areaReviewUtils";

const featuredLgaSlugs = [
  "ikeja-lga",
  "alimosho-lga",
  "eti-osa-lga",
  "lagos-mainland-lga",
  "surulere-lga",
  "ikorodu-lga",
];

const heroSlides = [
  { src: "/area-reviews-carousel/check-an-area.jpeg", alt: "Lagos Area Reviews campaign inviting renters to explore resident insights" },
  { src: "/area-reviews-carousel/share-your-experience.jpeg", alt: "Lagos Area Reviews campaign inviting residents to share their experience" },
];

const AreaReviewsLandingPage = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<AreaReviewLocation[]>([]);
  const [latestReviews, setLatestReviews] = useState<FeaturedAreaReview[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      areaReviewService.getLocations(),
      areaReviewService.getLatestApproved(7),
    ])
      .then(([locationResults, reviewResults]) => {
        if (!active) return;
        setLocations(locationResults);
        setLatestReviews(reviewResults);
      })
      .catch(() => {
        if (!active) return;
        setLocations([]);
        setLatestReviews([]);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  const filteredLocations = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return locations;
    return locations.filter((location) =>
      `${location.name} ${location.lga} ${location.type}`.toLowerCase().includes(term),
    );
  }, [locations, query]);

  const previewLocations = useMemo(() => {
    if (query.trim()) return filteredLocations.slice(0, 6);
    return featuredLgaSlugs
      .map((slug) => locations.find((location) => location.slug === slug))
      .filter((location): location is AreaReviewLocation => Boolean(location));
  }, [filteredLocations, locations, query]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (filteredLocations.length > 0) {
      navigate(`/area-reviews/${filteredLocations[0].slug}`);
      return;
    }
    navigate(`/area-reviews/write?name=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="bg-[#f7f6f1] text-slate-950">
      <section className="bg-white pb-8 pt-4 sm:pb-10 sm:pt-12 lg:pb-12 lg:pt-14">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 sm:gap-6 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:px-8">
          <div className="order-1 flex items-stretch justify-center bg-white lg:justify-start" aria-roledescription="carousel" aria-label="Lagos Area Reviews highlights">
            <div className="relative aspect-[4/5] w-full max-w-[600px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {heroSlides.map((slide, index) => (
                <img key={slide.src} src={slide.src} alt={index === activeHeroSlide ? slide.alt : ""} aria-hidden={index !== activeHeroSlide} loading={index === 0 ? "eager" : "lazy"} className={`absolute inset-0 h-full w-full rounded-2xl object-cover transition-opacity duration-700 ${index === activeHeroSlide ? "opacity-100" : "opacity-0"}`} />
              ))}
              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur-sm">
                {heroSlides.map((slide, index) => (
                  <button key={slide.src} type="button" onClick={() => setActiveHeroSlide(index)} className={`h-2 rounded-full transition-all ${index === activeHeroSlide ? "w-6 bg-white" : "w-2 bg-white/55 hover:bg-white/80"}`} aria-label={`Show carousel image ${index + 1}`} aria-current={index === activeHeroSlide ? "true" : undefined} />
                ))}
              </div>
            </div>
          </div>

          <div className="order-2 flex w-full bg-white py-3 text-slate-950 sm:py-8 lg:py-10 lg:pl-4 xl:pl-6">
            <div className="flex w-full flex-col justify-center">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-[#173f2a]"><Sparkles className="h-4 w-4 text-[#129B36]" /> Resident-powered Lagos housing insights</span>
              <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-5xl xl:text-6xl">Know the area <span className="text-[#129B36]">before you pay the rent.</span></h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">Search honest experiences from Lagos residents—real costs, power, water, flooding, roads, security and the details property adverts leave out.</p>

              <div className="mt-7 grid grid-cols-[0.85fr_1.15fr] gap-2 sm:flex sm:flex-wrap sm:gap-3">
                <Link to="/area-reviews/reviews" className="inline-flex min-w-0 items-center justify-center gap-1 rounded-xl bg-[#18a83f] px-2 py-3 text-center text-xs font-semibold leading-tight text-white transition hover:bg-[#129B36] sm:gap-2 sm:px-6 sm:text-base">Explore reviews <ArrowRight className="h-4 w-4 shrink-0" /></Link>
                <Link to="/area-reviews/write" className="inline-flex min-w-0 items-center justify-center whitespace-nowrap rounded-xl border border-[#18a83f] bg-white px-2 py-3 text-center text-xs font-semibold leading-tight text-[#173f2a] shadow-sm transition hover:border-[#129B36] hover:bg-green-50 sm:px-6 sm:text-base">Share your experience</Link>
              </div>

              <form onSubmit={submitSearch} className="relative mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-[#fafafa] p-2 shadow-sm">
                <label htmlFor="area-search" className="sr-only">Search an area, estate or street</label>
                <div className="flex items-center gap-2">
                  <Search className="ml-3 h-5 w-5 shrink-0 text-slate-400" />
                  <input id="area-search" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)} placeholder="Try Ikeja, Alimosho, Yaba or an estate" className="min-w-0 flex-1 border-0 bg-transparent px-1 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 sm:text-base" />
                  <button type="submit" className="rounded-xl bg-[#129B36] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0e7d2b]">Search</button>
                </div>
                {searchFocused && query.trim() && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.65rem)] z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-slate-950 shadow-2xl">
                    {filteredLocations.length > 0 ? filteredLocations.slice(0, 5).map((location) => (
                      <button key={location.slug} type="button" onMouseDown={() => navigate(`/area-reviews/${location.slug}`)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-green-50">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-[#129B36]"><MapPin className="h-4 w-4" /></span>
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{location.name}</span><span className="block text-xs text-slate-500">{location.lga} · {locationTypeLabel(location.type)}</span></span>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </button>
                    )) : (
                      <button type="submit" className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left hover:bg-green-50"><span><span className="block text-sm font-bold">Add “{query.trim()}”</span><span className="mt-0.5 block text-xs text-slate-500">Be the first resident to review this location</span></span><ChevronRight className="h-4 w-4 text-[#129B36]" /></button>
                    )}
                  </div>
                )}
              </form>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-600">
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#129B36]" /> Anonymous by default</span>
                <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-[#129B36]" /> Moderated reviews</span>
                <span className="flex items-center gap-2"><Users className="h-4 w-4 text-[#129B36]" /> Built by residents</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {latestReviews.length > 0 && (
        <section className="border-b border-slate-200/70 bg-[#fafafa]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#129B36]">Approved resident experiences</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#103f2b] sm:text-4xl">What Lagos residents are saying</h2>
                <p className="mt-3 max-w-2xl leading-7 text-slate-600">Recently approved experiences about rent, utilities and everyday living conditions.</p>
              </div>
              {latestReviews.length > 6 && (
                <Link to="/area-reviews/reviews" className="inline-flex items-center gap-2 text-sm font-bold text-[#0e7d2b] hover:underline">View all reviews <ArrowRight className="h-4 w-4" /></Link>
              )}
            </div>

            <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {latestReviews.slice(0, 6).map((review) => <AreaReviewPreviewCard key={review.id} review={review} />)}
            </div>
          </div>
        </section>
      )}

      <section className="bg-[#103f2b] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8dd9a1]">Explore Lagos</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Explore Lagos local governments</h2>
            <p className="mt-3 max-w-2xl leading-7 text-green-50/70">Start with a few Lagos LGAs, or open the complete directory to browse all 20.</p>
          </div>
          <Link to="/area-reviews/write" className="inline-flex items-center gap-2 text-sm font-bold text-[#f4ce70] hover:underline">
            Review where you have lived <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-64 animate-pulse rounded-3xl bg-white" />)}
          </div>
        ) : (
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {previewLocations.map((location, index) => <AreaLocationCard key={location.slug} location={location} index={index} />)}
          </div>
        )}
        {!loading && filteredLocations.length === 0 && (
          <div className="mt-9 rounded-3xl border border-dashed border-green-200 bg-white px-6 py-14 text-center text-slate-950">
            <MapPin className="mx-auto h-10 w-10 text-[#129B36]" />
            <h3 className="mt-4 text-xl font-bold">No location matches “{query}” yet</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Add the area, estate, street or building and become its first resident contributor.</p>
            <Link to={`/area-reviews/write?name=${encodeURIComponent(query.trim())}`} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#129B36] px-5 py-3 text-sm font-bold text-white">Add this location <ArrowRight className="h-4 w-4" /></Link>
          </div>
        )}
        {!loading && !query.trim() && (
          <div className="mt-10 text-center">
            <Link to="/area-reviews/areas" className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#103f2b] transition hover:bg-green-50">Show all 20 LGAs <ArrowRight className="h-4 w-4" /></Link>
          </div>
        )}
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#129B36]">How it works</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Useful knowledge should not disappear in group chats.</h2>
              <p className="mt-5 leading-7 text-slate-600">LagosRentHelp organises resident experiences into clear, comparable insights while protecting the people who share them.</p>
            </div>
            <ol className="grid gap-4 sm:grid-cols-3">
              {[
                ["01", "Search", "Find an area, estate, street or building you are considering."],
                ["02", "Learn", "Compare real costs and day-to-day living conditions."],
                ["03", "Contribute", "Share where you have lived, anonymously by default."],
              ].map(([number, title, copy]) => (
                <li key={number} className="rounded-3xl bg-[#f7f6f1] p-6">
                  <span className="text-sm font-black text-[#129B36]">{number}</span>
                  <h3 className="mt-10 text-xl font-bold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="overflow-hidden rounded-[2rem] bg-[#e8bb50] px-6 py-10 sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14 lg:py-14">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#103f2b]">Your experience can protect someone</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#13231b] sm:text-4xl">Tell Lagos renters what the advert did not tell you.</h2>
            <p className="mt-4 leading-7 text-[#283e33]">Your full name, phone number, photo and documents are never shown publicly.</p>
          </div>
          <Link to="/area-reviews/write" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#103f2b] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#0b2f20] lg:mt-0">
            Share your experience <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AreaReviewsLandingPage;
