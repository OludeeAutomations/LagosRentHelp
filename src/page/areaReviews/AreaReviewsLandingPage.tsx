import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronRight,
  Droplets,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Waves,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { areaReviewService } from "@/services/areaReviewService";
import type { AreaReviewLocation } from "@/types/areaReviews";
import { formatNaira, formatRating } from "./areaReviewUtils";

const AreaReviewsLandingPage = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<AreaReviewLocation[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    let active = true;
    areaReviewService
      .getLocations()
      .then((result) => active && setLocations(result))
      .catch(() => active && setLocations([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const filteredLocations = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return locations;
    return locations.filter((location) =>
      `${location.name} ${location.lga} ${location.type}`.toLowerCase().includes(term),
    );
  }, [locations, query]);

  const locationTypeLabel = (type: AreaReviewLocation["type"]) =>
    type === "lga" ? "Local government" : type;

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
      <section className="relative isolate overflow-hidden bg-[#103f2b] text-white">
        <div className="absolute inset-0 -z-10 opacity-20" aria-hidden="true">
          <div className="absolute -left-28 top-16 h-80 w-80 rounded-full border-[70px] border-[#8dd9a1]" />
          <div className="absolute -right-20 -top-24 h-96 w-96 rounded-full bg-[#1f7a4e] blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-[#e7bd58] blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-green-50 backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#f4ce70]" />
              Resident-powered Lagos housing insights
            </div>
            <h1 className="mt-7 max-w-3xl text-4xl font-bold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Know the area before you pay the rent.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-green-50/80 sm:text-lg">
              Search honest experiences from people who live there—real costs, power, water, flooding, roads, security and the details property adverts leave out.
            </p>

            <form onSubmit={submitSearch} className="relative mt-9 max-w-2xl rounded-2xl border border-white/10 bg-white p-2 shadow-2xl shadow-black/20">
              <label htmlFor="area-search" className="sr-only">Search an area, estate or street</label>
              <div className="flex items-center gap-2">
                <Search className="ml-3 h-5 w-5 shrink-0 text-slate-400" />
                <input
                  id="area-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                  placeholder="Try Ikeja, Alimosho, Yaba or an estate name"
                  className="min-w-0 flex-1 border-0 bg-transparent px-1 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 sm:text-base"
                />
                <button type="submit" className="rounded-xl bg-[#129B36] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0e7d2b]">
                  Search
                </button>
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

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-green-50/75">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Anonymous by default</span>
              <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4" /> Moderated reviews</span>
              <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Built by residents</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="rounded-[2rem] border border-white/15 bg-white/[0.08] p-3 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="rounded-[1.55rem] bg-white p-6 text-slate-950 sm:p-8">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#129B36]">A clearer renting decision</p>
                    <h2 className="mt-2 text-2xl font-bold">What residents reveal</h2>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-[#129B36]"><MapPin className="h-5 w-5" /></span>
                </div>
                <div className="mt-7 grid grid-cols-2 gap-3">
                  {[
                    { icon: Zap, label: "Electricity" },
                    { icon: Droplets, label: "Water" },
                    { icon: Waves, label: "Flooding" },
                    { icon: ShieldCheck, label: "Security" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="rounded-2xl border border-slate-100 bg-[#fafaf8] p-4 transition hover:border-green-100 hover:bg-green-50/40">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#129B36] shadow-sm"><Icon className="h-4 w-4" /></span>
                      <p className="mt-4 text-sm font-semibold">{label}</p>
                      <p className="mt-1 text-xs text-slate-500">First-hand insight</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-[#103f2b] p-5 text-white">
                  <div><p className="text-xs font-semibold uppercase tracking-wider text-green-100/70">Founding access</p><p className="mt-2 text-base font-bold sm:text-lg">All insights are free during launch.</p></div>
                  <BadgeCheck className="h-8 w-8 shrink-0 text-[#f4ce70]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#129B36]">Explore Lagos</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Explore every Lagos local government</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">All 20 Lagos LGAs are covered, together with neighbourhoods, estates, streets and buildings added by residents.</p>
          </div>
          <Link to="/area-reviews/write" className="inline-flex items-center gap-2 text-sm font-bold text-[#0e7d2b] hover:underline">
            Review where you have lived <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-64 animate-pulse rounded-3xl bg-white" />)}
          </div>
        ) : (
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredLocations.map((location, index) => (
              <Link
                key={location.slug}
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
            ))}
          </div>
        )}
        {!loading && filteredLocations.length === 0 && (
          <div className="mt-9 rounded-3xl border border-dashed border-green-200 bg-white px-6 py-14 text-center">
            <MapPin className="mx-auto h-10 w-10 text-[#129B36]" />
            <h3 className="mt-4 text-xl font-bold">No location matches “{query}” yet</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Add the area, estate, street or building and become its first resident contributor.</p>
            <Link to={`/area-reviews/write?name=${encodeURIComponent(query.trim())}`} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#129B36] px-5 py-3 text-sm font-bold text-white">Add this location <ArrowRight className="h-4 w-4" /></Link>
          </div>
        )}
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
