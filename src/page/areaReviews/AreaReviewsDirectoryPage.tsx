import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MapPin, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { areaReviewService } from "@/services/areaReviewService";
import type { AreaReviewLocation } from "@/types/areaReviews";
import AreaLocationCard from "./AreaLocationCard";

const AreaReviewsDirectoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [locations, setLocations] = useState<AreaReviewLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get("q") || "";

  useEffect(() => {
    let active = true;
    areaReviewService.getLocations()
      .then((result) => active && setLocations(result))
      .catch(() => active && setLocations([]))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const localGovernments = useMemo(() => {
    const term = query.trim().toLowerCase();
    return locations.filter((location) => location.type === "lga" && (!term || `${location.name} ${location.lga}`.toLowerCase().includes(term)));
  }, [locations, query]);

  return (
    <div className="min-h-screen bg-[#f7f6f1] text-slate-950">
      <section className="bg-[#103f2b] px-4 py-14 text-white sm:px-6 lg:px-8 lg:py-18">
        <div className="mx-auto max-w-7xl">
          <Link to="/area-reviews" className="inline-flex items-center gap-2 text-sm font-semibold text-green-50/70 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Area Reviews</Link>
          <div className="mt-7 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#f4ce70]">Lagos directory</p><h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">All 20 Lagos LGAs</h1><p className="mt-4 max-w-2xl leading-7 text-green-50/70">Choose a local government area to read resident experiences about rent, utilities, roads, flooding, security and daily life.</p></div>
            <div className="relative w-full max-w-md"><Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" /><input value={query} onChange={(event) => setSearchParams(event.target.value ? { q: event.target.value } : {}, { replace: true })} placeholder="Search local governments" className="h-12 w-full rounded-xl border-0 bg-white pl-12 pr-4 text-sm text-slate-950 outline-none ring-offset-2 focus:ring-2 focus:ring-[#e8bb50]" /></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {loading ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-64 animate-pulse rounded-3xl bg-white" />)}</div> : localGovernments.length > 0 ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{localGovernments.map((location, index) => <AreaLocationCard key={location.slug} location={location} index={index} />)}</div> : <div className="rounded-3xl border border-dashed border-green-200 bg-white px-6 py-16 text-center"><MapPin className="mx-auto h-10 w-10 text-[#129B36]" /><h2 className="mt-4 text-xl font-bold">No local government matches “{query}”</h2><p className="mt-2 text-sm text-slate-500">Try another name, such as Ikeja, Alimosho or Surulere.</p></div>}
      </section>
    </div>
  );
};

export default AreaReviewsDirectoryPage;
