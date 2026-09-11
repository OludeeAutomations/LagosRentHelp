import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  FileSearch,
  Home as HomeIcon,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PropertySections from "@/components/common/PropertySections";
import { Button } from "@/components/ui/button";
import { LAGOS_LOCAL_GOVERNMENTS } from "@/lib/nigeriaLocations";
import { useAuthStore } from "@/stores/authStore";
import { usePropertyStore } from "@/stores/propertyStore";

const propertyTypes = [
  { value: "1-bedroom", label: "1 bedroom" },
  { value: "2-bedroom", label: "2 bedrooms" },
  { value: "3-bedroom", label: "3 bedrooms" },
  { value: "duplex", label: "Duplex" },
  { value: "studio", label: "Studio" },
  { value: "mini-flat", label: "Mini flat" },
  { value: "short-let", label: "Short let" },
];

const priceBands = [
  { value: "", label: "Any yearly budget" },
  { value: "under-1m", label: "Below ₦1 million" },
  { value: "1m-2m", label: "₦1m – ₦2m" },
  { value: "2m-5m", label: "₦2m – ₦5m" },
  { value: "over-5m", label: "Above ₦5 million" },
];

const Home = () => {
  const navigate = useNavigate();
  const { properties, fetchProperties, loading } = usePropertyStore();
  const user = useAuthStore((state) => state.user);
  const [selectedLga, setSelectedLga] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    void fetchProperties();
  }, [fetchProperties]);

  const rentProperties = properties.filter((property) => property.listingType === "rent");
  const shortLetProperties = properties.filter((property) => property.listingType === "short-let");

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (selectedLga) params.set("location", selectedLga);
    if (selectedType) params.set("type", selectedType);
    if (priceRange === "under-1m") params.set("maxPrice", "999999");
    if (priceRange === "1m-2m") { params.set("minPrice", "1000000"); params.set("maxPrice", "2000000"); }
    if (priceRange === "2m-5m") { params.set("minPrice", "2000000"); params.set("maxPrice", "5000000"); }
    if (priceRange === "over-5m") params.set("minPrice", "5000000");
    navigate(`/search${params.size ? `?${params.toString()}` : ""}`);
  };

  const handleFavorite = (propertyId: string) => {
    if (!user) {
      toast.error("Sign in to save a property.");
      return;
    }
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(propertyId)) {
        next.delete(propertyId);
        toast.success("Removed from favourites.");
      } else {
        next.add(propertyId);
        toast.success("Saved to favourites.");
      }
      return next;
    });
  };

  return (
    <div className="overflow-hidden bg-white text-gray-950">
      <section className="relative bg-[#f3f7f4]">
        <div className="absolute inset-x-0 bottom-0 h-32 bg-white" />
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 md:pt-20 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-[#129B36] shadow-sm">
                <MapPin className="h-4 w-4" />Made for renting in Lagos
              </span>
              <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Find a Lagos home with <span className="text-[#129B36]">more confidence.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                Browse homes from verified landlords, get recommendations shaped around your needs, and connect through a platform that reviews identity and ownership evidence.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#listings" className="inline-flex items-center gap-2 rounded-xl bg-[#129B36] px-6 py-3 font-semibold text-white transition hover:bg-[#0e7d2b]">Explore listings <ArrowRight className="h-4 w-4" /></a>
                <Link to="/register" className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold transition hover:bg-gray-50"><Building2 className="h-4 w-4" />List a property</Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-600">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#129B36]" />Reviewed landlords</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#129B36]" />Private matching</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#129B36]" />Lagos-focused search</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55, delay: 0.08 }} className="relative hidden lg:block">
              <div className="overflow-hidden rounded-[2rem] bg-[#173f2a] p-2 shadow-2xl shadow-green-950/20">
                <img src="/istockphoto-1145244310-612x612.jpg" alt="Homes and city life in Lagos" className="h-[475px] w-full rounded-[1.55rem] object-cover" />
              </div>
              <div className="absolute -bottom-5 -left-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
                <div className="flex items-center gap-3"><span className="rounded-xl bg-green-50 p-3 text-[#129B36]"><ShieldCheck className="h-6 w-6" /></span><div><p className="font-semibold">Verified landlord flow</p><p className="text-sm text-gray-500">Identity and ownership reviewed.</p></div></div>
              </div>
            </motion.div>
          </div>

          <form onSubmit={handleSearch} className="relative mt-14 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl shadow-gray-900/5 sm:p-5 lg:grid-cols-[1.15fr_1fr_1fr_auto]">
            <label className="space-y-1.5"><span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Location</span><select value={selectedLga} onChange={(event) => setSelectedLga(event.target.value)} className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-[#129B36]"><option value="">All Lagos LGAs</option>{LAGOS_LOCAL_GOVERNMENTS.map((lga) => <option key={lga} value={lga}>{lga}</option>)}</select></label>
            <label className="space-y-1.5"><span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Property type</span><select value={selectedType} onChange={(event) => setSelectedType(event.target.value)} className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-[#129B36]"><option value="">All property types</option>{propertyTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>
            <label className="space-y-1.5"><span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Budget</span><select value={priceRange} onChange={(event) => setPriceRange(event.target.value)} className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-[#129B36]">{priceBands.map((band) => <option key={band.value} value={band.value}>{band.label}</option>)}</select></label>
            <Button type="submit" className="h-12 self-end rounded-xl bg-[#129B36] px-6 hover:bg-[#0e7d2b]"><Search className="h-4 w-4" />Search homes</Button>
          </form>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-white">
        <div className="mx-auto grid max-w-7xl divide-y px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-7 sm:px-5"><span className="rounded-xl bg-green-50 p-3 text-[#129B36]"><HomeIcon className="h-6 w-6" /></span><div><p className="text-xl font-bold">{loading ? "—" : properties.length}</p><p className="text-sm text-gray-500">Approved homes available</p></div></div>
          <div className="flex items-center gap-4 py-7 sm:px-5"><span className="rounded-xl bg-green-50 p-3 text-[#129B36]"><MapPin className="h-6 w-6" /></span><div><p className="text-xl font-bold">20 LGAs</p><p className="text-sm text-gray-500">Lagos-wide preferences</p></div></div>
          <div className="flex items-center gap-4 py-7 sm:px-5"><span className="rounded-xl bg-green-50 p-3 text-[#129B36]"><FileSearch className="h-6 w-6" /></span><div><p className="text-xl font-bold">Human review</p><p className="text-sm text-gray-500">For ownership applications</p></div></div>
        </div>
      </section>

      <section className="bg-[#f7f9f7] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#129B36]">Browse your way</p><h2 className="mt-2 text-3xl font-bold">Start with the home you need.</h2></div>
            <Link to="/search" className="inline-flex items-center gap-2 font-semibold text-[#129B36]">View every listing <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {propertyTypes.map((type) => <button key={type.value} onClick={() => navigate(`/search?type=${type.value}`)} className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium shadow-sm transition hover:border-[#129B36] hover:text-[#129B36]">{type.label}</button>)}
          </div>
        </div>
      </section>

      <section id="listings" className="scroll-mt-24 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PropertySections allProperties={properties} rentProperties={rentProperties} shortLetProperties={shortLetProperties} loading={loading} onFavorite={handleFavorite} favorites={favorites} />
        </div>
      </section>

      <section className="bg-[#f7f9f7] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#129B36]">How LagosRentHelp works</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">A clearer path from search to inspection.</h2></div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { icon: SlidersHorizontal, title: "Tell us what fits", copy: "Set your Lagos LGA, budget, property type, household, and move-in preferences privately." },
              { icon: Sparkles, title: "See better matches", copy: "Approved listings are ranked by compatibility while every available home remains searchable." },
              { icon: BadgeCheck, title: "Inspect and decide", copy: "Review clear property details, contact the listing owner, and always inspect before payment." },
            ].map(({ icon: Icon, title, copy }, index) => (
              <motion.article key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
                <div className="flex items-center justify-between"><span className="rounded-xl bg-green-50 p-3 text-[#129B36]"><Icon className="h-6 w-6" /></span><span className="text-sm font-bold text-gray-300">0{index + 1}</span></div>
                <h3 className="mt-6 text-xl font-semibold">{title}</h3><p className="mt-3 leading-7 text-gray-600">{copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#173f2a] py-20 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
          <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-300">Ready when you are</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">A better rental journey starts with the right details.</h2><p className="mt-4 max-w-2xl text-lg text-green-50/75">Create a renter profile for tailored discovery, or verify as a landlord before bringing a property to the platform.</p></div>
          <div className="flex flex-wrap gap-3 lg:justify-end"><Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-[#173f2a] hover:bg-green-50">Create account <ArrowRight className="h-4 w-4" /></Link><Link to="/about" className="inline-flex items-center rounded-xl border border-white/25 px-6 py-3 font-semibold hover:bg-white/10">How trust works</Link></div>
        </div>
      </section>
    </div>
  );
};

export default Home;
