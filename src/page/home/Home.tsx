import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  BedSingle,
  Building2,
  CheckCircle2,
  ClipboardPlus,
  FileSearch,
  Home as HomeIcon,
  Hotel,
  KeyRound,
  MapPin,
  Paintbrush,
  Search,
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
  { value: "1-bedroom", label: "1 bedroom", icon: BedSingle },
  { value: "2-bedroom", label: "2 bedrooms", icon: BedDouble },
  { value: "3-bedroom", label: "3 bedrooms", icon: Building2 },
  { value: "duplex", label: "Duplex", icon: HomeIcon },
  { value: "studio", label: "Studio", icon: Paintbrush },
  { value: "mini-flat", label: "Mini flat", icon: KeyRound },
  { value: "short-let", label: "Short let", icon: Hotel },
];

const priceBands = [
  { value: "", label: "Any yearly budget" },
  { value: "under-1m", label: "Below ₦1 million" },
  { value: "1m-2m", label: "₦1m – ₦2m" },
  { value: "2m-5m", label: "₦2m – ₦5m" },
  { value: "over-5m", label: "Above ₦5 million" },
];

const heroSlides = [
  { src: "/hero-carousel/imagine-home.jfif", alt: "Imagine coming home to this LagosRentHelp campaign" },
  { src: "/hero-carousel/budget-options.jfif", alt: "LagosRentHelp homes for different budgets" },
  { src: "/hero-carousel/easy-house-hunting.jfif", alt: "A relaxed renter using LagosRentHelp" },
  { src: "/hero-carousel/verified-listings.jfif", alt: "Verified listings only on LagosRentHelp" },
];

const Home = () => {
  const navigate = useNavigate();
  const { properties, fetchProperties, loading, pagination } = usePropertyStore();
  const user = useAuthStore((state) => state.user);
  const [selectedLga, setSelectedLga] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    void fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

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
      <section className="bg-white px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-12 lg:px-8 lg:pb-12 lg:pt-14">
        <div className="mx-auto grid max-w-[1600px] gap-3 lg:grid-cols-2 lg:items-stretch">
          <div className="order-2 flex w-full bg-white px-4 py-6 text-gray-950 sm:px-6 sm:py-8 lg:pl-6 lg:pr-8 lg:py-10 xl:pl-8 xl:pr-12">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex w-full flex-col">
              <span className="inline-flex w-fit self-start items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-[#173f2a]">
                <MapPin className="h-4 w-4" />Made for renting in Lagos
              </span>
              <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-[-0.035em] [font-family:var(--font-display)] sm:text-5xl xl:text-6xl">
                Find a Lagos home with <span className="text-green-300">more confidence.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
                Browse homes from verified landlords, get recommendations shaped around your needs, and connect through a platform that reviews identity and ownership evidence.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#listings" className="inline-flex items-center gap-2 rounded-xl bg-[#18a83f] px-6 py-3 font-semibold text-white transition hover:bg-[#129B36]">Explore listings <ArrowRight className="h-4 w-4" /></a>
                <Link to="/register" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-[#173f2a] shadow-sm transition hover:border-green-300 hover:bg-green-50"><ClipboardPlus className="h-[18px] w-[18px]" strokeWidth={1.9} />List a property</Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-gray-600">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#129B36]" />Reviewed landlords</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#129B36]" />Private matching</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#129B36]" />Lagos-focused search</span>
              </div>

              <form onSubmit={handleSearch} className="mt-9 grid gap-3 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 shadow-sm sm:grid-cols-2 sm:p-5">
                <label className="space-y-1.5 sm:col-span-2"><span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Location</span><select value={selectedLga} onChange={(event) => setSelectedLga(event.target.value)} className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-950 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-300/30"><option value="">All Lagos LGAs</option>{LAGOS_LOCAL_GOVERNMENTS.map((lga) => <option key={lga} value={lga}>{lga}</option>)}</select></label>
                <label className="space-y-1.5"><span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Property type</span><select value={selectedType} onChange={(event) => setSelectedType(event.target.value)} className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-950 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-300/30"><option value="">All property types</option>{propertyTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>
                <label className="space-y-1.5"><span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Budget</span><select value={priceRange} onChange={(event) => setPriceRange(event.target.value)} className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-950 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-300/30">{priceBands.map((band) => <option key={band.value} value={band.value}>{band.label}</option>)}</select></label>
                <Button type="submit" className="h-12 rounded-xl bg-[#18a83f] px-6 shadow-lg shadow-black/10 hover:bg-[#129B36] sm:col-span-2"><Search className="h-4 w-4" />Search homes</Button>
              </form>
            </motion.div>
          </div>

          <div className="order-1 flex h-[min(720px,125vw)] items-stretch justify-center bg-white lg:h-auto lg:justify-end" aria-roledescription="carousel" aria-label="LagosRentHelp highlights">
            <div className="relative h-full max-w-full aspect-[4/5] overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {heroSlides.map((slide, index) => (
                <img
                  key={slide.src}
                  src={slide.src}
                  alt={index === activeHeroSlide ? slide.alt : ""}
                  aria-hidden={index !== activeHeroSlide}
                  loading={index === 0 ? "eager" : "lazy"}
                  className={`absolute inset-0 h-full w-full rounded-2xl object-cover transition-opacity duration-700 ${index === activeHeroSlide ? "opacity-100" : "opacity-0"}`}
                />
              ))}

              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur-sm">
                {heroSlides.map((slide, index) => (
                  <button key={slide.src} type="button" onClick={() => setActiveHeroSlide(index)} className={`h-2 rounded-full transition-all ${index === activeHeroSlide ? "w-6 bg-white" : "w-2 bg-white/55 hover:bg-white/80"}`} aria-label={`Show carousel image ${index + 1}`} aria-current={index === activeHeroSlide ? "true" : undefined} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-white">
        <div className="mx-auto grid max-w-7xl divide-y px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-7 sm:px-5"><span className="rounded-xl bg-green-50 p-3 text-[#129B36]"><HomeIcon className="h-6 w-6" /></span><div><p className="text-xl font-bold">{loading ? "—" : pagination.total}</p><p className="text-sm text-gray-500">Approved homes available</p></div></div>
          <div className="flex items-center gap-4 py-7 sm:px-5"><span className="rounded-xl bg-green-50 p-3 text-[#129B36]"><MapPin className="h-6 w-6" /></span><div><p className="text-xl font-bold">20 LGAs</p><p className="text-sm text-gray-500">Lagos-wide preferences</p></div></div>
          <div className="flex items-center gap-4 py-7 sm:px-5"><span className="rounded-xl bg-green-50 p-3 text-[#129B36]"><FileSearch className="h-6 w-6" /></span><div><p className="text-xl font-bold">Human review</p><p className="text-sm text-gray-500">For ownership applications</p></div></div>
        </div>
      </section>

      <section className="bg-[#f7f9f7] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div>
            <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#129B36]">Browse your way</p><h2 className="mt-2 text-3xl font-bold">Start with the home you need.</h2></div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {propertyTypes.map(({ value, label, icon: Icon }) => <button key={value} onClick={() => navigate(`/search?type=${value}`)} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium shadow-sm transition hover:border-[#129B36] hover:text-[#129B36]"><Icon className="h-4 w-4 text-[#129B36]" strokeWidth={1.9} />{label}</button>)}
            <Link to="/search" className="inline-flex items-center gap-2 rounded-full border border-[#129B36] bg-[#129B36] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0e7d2b]">View every listing <ArrowRight className="h-4 w-4" /></Link>
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
