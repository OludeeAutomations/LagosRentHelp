import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  EyeOff,
  Info,
  LockKeyhole,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { lagosLocalGovernmentAreas } from "@/data/areaReviewLocations";
import { areaReviewService } from "@/services/areaReviewService";
import { useAreaReviewsAuthStore } from "@/stores/areaReviewsAuthStore";
import type {
  AreaLocationType,
  AreaRatingBreakdown,
  AreaReviewLocation,
  FloodRisk,
  ResidencyStatus,
} from "@/types/areaReviews";

const propertyTypes = [
  ["self-contained", "Self-contained"],
  ["mini-flat", "Mini flat"],
  ["1-bedroom", "1-bedroom"],
  ["2-bedroom", "2-bedroom"],
  ["3-bedroom", "3-bedroom"],
  ["duplex", "Duplex"],
  ["shared-apartment", "Shared apartment"],
  ["other", "Other"],
];

const defaultRatings: AreaRatingBreakdown = {
  electricity: 3,
  water: 3,
  security: 3,
  roads: 3,
  noise: 3,
  maintenance: 3,
};

const fieldClass = "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-[#129B36] focus:ring-4 focus:ring-green-100/70";

const RatingField = ({ label, value, onChange }: { label: string; value: number; onChange: (rating: number) => void }) => (
  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 transition hover:border-green-200">
    <p className="text-sm font-semibold text-slate-700">{label}</p>
    <div className="mt-3 flex gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          role="radio"
          aria-checked={value === rating}
          aria-label={`${rating} out of 5`}
          onClick={() => onChange(rating)}
          className={`rounded-lg p-1.5 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#129B36] ${value === rating ? "bg-amber-50" : ""}`}
        >
          <Star className={`h-6 w-6 ${rating <= value ? "fill-[#e8b949] text-[#e8b949]" : "fill-white text-slate-300"}`} />
        </button>
      ))}
    </div>
  </div>
);

const AreaReviewWritePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAreaReviewsAuthStore();
  const [locations, setLocations] = useState<AreaReviewLocation[]>([]);
  const [selectedSlug, setSelectedSlug] = useState(searchParams.get("location") || "new");
  const [locationName, setLocationName] = useState(searchParams.get("name") || "");
  const [locationType, setLocationType] = useState<AreaLocationType>("neighbourhood");
  const [lga, setLga] = useState("");
  const [residencyStatus, setResidencyStatus] = useState<ResidencyStatus>("former");
  const [propertyType, setPropertyType] = useState("1-bedroom");
  const [livedFrom, setLivedFrom] = useState(String(new Date().getFullYear() - 1));
  const [livedTo, setLivedTo] = useState(String(new Date().getFullYear()));
  const [rentAmount, setRentAmount] = useState("");
  const [serviceCharge, setServiceCharge] = useState("");
  const [moveInCost, setMoveInCost] = useState("");
  const [overallRating, setOverallRating] = useState(3);
  const [ratings, setRatings] = useState(defaultRatings);
  const [floodRisk, setFloodRisk] = useState<FloodRisk>("unsure");
  const [headline, setHeadline] = useState("");
  const [review, setReview] = useState("");
  const [showFirstName, setShowFirstName] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    areaReviewService.getLocations().then(setLocations).catch(() => setLocations([]));
  }, []);

  const selectedLocation = useMemo(
    () => locations.find((location) => location.slug === selectedSlug),
    [locations, selectedSlug],
  );

  useEffect(() => {
    if (!selectedLocation) return;
    setLocationName(selectedLocation.name);
    setLocationType(selectedLocation.type);
    setLga(selectedLocation.lga);
  }, [selectedLocation]);

  const setRating = (key: keyof AreaRatingBreakdown, value: number) =>
    setRatings((current) => ({ ...current, [key]: value }));

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      navigate("/area-reviews/login", { state: { from: `/area-reviews/write?location=${selectedSlug}` } });
      return;
    }
    if (!locationName.trim() || !lga || !headline.trim() || review.trim().length < 80) {
      toast.error("Complete the location, headline and a review of at least 80 characters.");
      return;
    }
    if (!confirmed) {
      toast.error("Confirm that this review is based on your own experience.");
      return;
    }
    setSubmitting(true);
    try {
      await areaReviewService.submit({
        locationId: selectedLocation?.id,
        locationName: locationName.trim(),
        locationType,
        lga,
        residencyStatus,
        propertyType,
        livedFrom: Number(livedFrom),
        livedTo: residencyStatus === "current" ? undefined : Number(livedTo),
        rentAmount: rentAmount ? Number(rentAmount) : undefined,
        serviceCharge: serviceCharge ? Number(serviceCharge) : undefined,
        moveInCost: moveInCost ? Number(moveInCost) : undefined,
        overallRating,
        ratings,
        floodRisk,
        headline: headline.trim(),
        review: review.trim(),
        showFirstName,
      });
      toast.success("Thank you. Your review has been sent for moderation.");
      navigate(selectedLocation ? `/area-reviews/${selectedLocation.slug}` : "/area-reviews", { replace: true });
    } catch (reason: unknown) {
      toast.error(reason instanceof Error ? reason.message : "Unable to submit your review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="relative isolate min-h-[70vh] overflow-hidden bg-[#f7f6f1] px-4 py-20">
        <div aria-hidden="true" className="absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-green-100/70 blur-3xl" />
        <div className="mx-auto max-w-xl rounded-[2rem] border border-white bg-white p-8 text-center shadow-xl shadow-slate-900/[0.06] sm:p-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50"><LockKeyhole className="h-8 w-8 text-[#129B36]" /></span>
          <h1 className="mt-6 text-3xl font-bold">Sign in to share your experience</h1>
          <p className="mt-4 leading-7 text-slate-600">Accounts help us reduce duplicate and misleading submissions. Your account details will not be displayed with an anonymous review.</p>
          <Link to="/area-reviews/login" state={{ from: `/area-reviews/write?location=${selectedSlug}` }} className="mt-7 inline-flex rounded-xl bg-[#129B36] px-6 py-3 font-bold text-white">Sign in to Area Reviews</Link>
          <p className="mt-5 text-sm text-slate-500">New here? <Link to="/area-reviews/register" className="font-bold text-[#0e7d2b]">Create a resident account</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <form onSubmit={submitReview} className="mx-auto max-w-5xl">
        <Link to={selectedLocation ? `/area-reviews/${selectedLocation.slug}` : "/area-reviews"} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#129B36]"><ArrowLeft className="h-4 w-4" /> Back to Area Reviews</Link>
        <div className="relative mt-7 overflow-hidden rounded-[2rem] bg-[#103f2b] px-6 py-8 text-white shadow-xl shadow-green-950/10 sm:px-9 sm:py-10">
          <div aria-hidden="true" className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[45px] border-white/[0.04]" />
          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#f4ce70]">Resident review</p><h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Share what living there is really like</h1><p className="mt-4 max-w-2xl leading-7 text-green-50/70">Your review will be checked before it is published. Anonymous is the default.</p></div>
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-semibold text-green-50"><ShieldCheck className="h-4 w-4 text-[#f4ce70]" /> Moderated before publishing</div>
          </div>
        </div>

        <ol className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:grid-cols-4">
          {["Location", "Costs", "Living scores", "Your story"].map((label, index) => <li key={label} className="flex items-center gap-2 rounded-xl px-3 py-3 text-xs font-semibold text-slate-600"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-50 font-bold text-[#129B36]">{index + 1}</span>{label}</li>)}
        </ol>

        <section className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.04)] sm:p-8">
          <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#103f2b] text-sm font-bold text-white">1</span><div><h2 className="text-xl font-bold">Where did you live?</h2><p className="text-sm text-slate-500">Use an existing location or add a new one.</p></div></div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label htmlFor="existing-location">Location</Label><select id="existing-location" className={fieldClass} value={selectedSlug} onChange={(event) => { setSelectedSlug(event.target.value); if (event.target.value === "new") { setLocationName(""); setLga(""); } }}><option value="new">Add a new location</option>{locations.map((location) => <option key={location.slug} value={location.slug}>{location.name} — {location.lga}</option>)}</select></div>
            <div><Label htmlFor="location-name">Area, estate, street or building</Label><Input id="location-name" className="mt-2 h-12 rounded-xl focus-visible:ring-green-100" value={locationName} disabled={Boolean(selectedLocation)} onChange={(event) => setLocationName(event.target.value)} placeholder="e.g. Alagomeji, Yaba" required /></div>
            <div><Label htmlFor="location-type">Location type</Label><select id="location-type" className={fieldClass} value={locationType} disabled={Boolean(selectedLocation)} onChange={(event) => setLocationType(event.target.value as AreaLocationType)}><option value="lga">Local government area</option><option value="neighbourhood">Neighbourhood</option><option value="estate">Estate</option><option value="street">Street</option><option value="building">Building</option></select></div>
            <div><Label htmlFor="lga">Local government area</Label><select id="lga" className={fieldClass} value={lga} disabled={Boolean(selectedLocation)} onChange={(event) => setLga(event.target.value)} required><option value="">Select LGA</option>{lagosLocalGovernmentAreas.map((item) => <option key={item}>{item}</option>)}</select></div>
            <div><Label htmlFor="property-type">Home type</Label><select id="property-type" className={fieldClass} value={propertyType} onChange={(event) => setPropertyType(event.target.value)}>{propertyTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
            <div><Label htmlFor="residency-status">Your relationship to the place</Label><select id="residency-status" className={fieldClass} value={residencyStatus} onChange={(event) => setResidencyStatus(event.target.value as ResidencyStatus)}><option value="current">I currently live here</option><option value="former">I previously lived here</option></select></div>
            <div className="grid grid-cols-2 gap-3"><div><Label htmlFor="lived-from">From year</Label><Input id="lived-from" className="mt-2 h-11 rounded-xl" type="number" min="2000" max={new Date().getFullYear()} value={livedFrom} onChange={(event) => setLivedFrom(event.target.value)} required /></div>{residencyStatus === "former" && <div><Label htmlFor="lived-to">To year</Label><Input id="lived-to" className="mt-2 h-11 rounded-xl" type="number" min={livedFrom} max={new Date().getFullYear()} value={livedTo} onChange={(event) => setLivedTo(event.target.value)} required /></div>}</div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.04)] sm:p-8">
          <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#103f2b] text-sm font-bold text-white">2</span><div><h2 className="text-xl font-bold">What did it cost?</h2><p className="text-sm text-slate-500">Optional, but extremely useful to other renters.</p></div></div>
          <div className="mt-7 grid gap-5 sm:grid-cols-3">
            <div><Label htmlFor="rent">Annual rent (₦)</Label><Input id="rent" className="mt-2 h-11 rounded-xl" type="number" min="0" value={rentAmount} onChange={(event) => setRentAmount(event.target.value)} placeholder="1800000" /></div>
            <div><Label htmlFor="service-charge">Service charge (₦)</Label><Input id="service-charge" className="mt-2 h-11 rounded-xl" type="number" min="0" value={serviceCharge} onChange={(event) => setServiceCharge(event.target.value)} placeholder="Optional" /></div>
            <div><Label htmlFor="move-in-cost">Total move-in cost (₦)</Label><Input id="move-in-cost" className="mt-2 h-11 rounded-xl" type="number" min="0" value={moveInCost} onChange={(event) => setMoveInCost(event.target.value)} placeholder="Rent plus all fees" /></div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.04)] sm:p-8">
          <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#103f2b] text-sm font-bold text-white">3</span><div><h2 className="text-xl font-bold">Rate daily living</h2><p className="text-sm text-slate-500">One star is poor; five stars is excellent.</p></div></div>
          <div className="mt-7"><RatingField label="Overall experience" value={overallRating} onChange={setOverallRating} /></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <RatingField label="Electricity" value={ratings.electricity} onChange={(value) => setRating("electricity", value)} />
            <RatingField label="Water" value={ratings.water} onChange={(value) => setRating("water", value)} />
            <RatingField label="Security" value={ratings.security} onChange={(value) => setRating("security", value)} />
            <RatingField label="Roads & access" value={ratings.roads} onChange={(value) => setRating("roads", value)} />
            <RatingField label="Quietness" value={ratings.noise} onChange={(value) => setRating("noise", value)} />
            <RatingField label="Maintenance" value={ratings.maintenance} onChange={(value) => setRating("maintenance", value)} />
          </div>
          <div className="mt-5 max-w-sm"><Label htmlFor="flood-risk">Flooding experience</Label><select id="flood-risk" className={fieldClass} value={floodRisk} onChange={(event) => setFloodRisk(event.target.value as FloodRisk)}><option value="none">No flooding noticed</option><option value="low">Low</option><option value="moderate">Moderate</option><option value="high">High</option><option value="unsure">Not sure</option></select></div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.04)] sm:p-8">
          <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#103f2b] text-sm font-bold text-white">4</span><div><h2 className="text-xl font-bold">Tell the useful story</h2><p className="text-sm text-slate-500">Discuss the place—not a landlord or neighbour by name.</p></div></div>
          <div className="mt-7"><Label htmlFor="headline">Short headline</Label><Input id="headline" className="mt-2 h-11 rounded-xl" maxLength={90} value={headline} onChange={(event) => setHeadline(event.target.value)} placeholder="Reliable water, but the road floods after heavy rain" required /></div>
          <div className="mt-5"><Label htmlFor="review">Your experience</Label><Textarea id="review" className="mt-2 min-h-40 rounded-xl leading-7" minLength={80} maxLength={1500} value={review} onChange={(event) => setReview(event.target.value)} placeholder="What should a renter know about power, water, roads, security, noise, repairs and unexpected costs?" required /><div className="mt-2 flex justify-between text-xs text-slate-400"><span>Minimum 80 characters</span><span>{review.length}/1500</span></div></div>

          <div className="mt-7 rounded-2xl border border-green-100 bg-green-50 p-5">
            <div className="flex gap-3"><EyeOff className="mt-0.5 h-5 w-5 shrink-0 text-[#129B36]" /><div><h3 className="font-bold text-green-950">How should your name appear?</h3><p className="mt-1 text-sm leading-6 text-green-900/70">Your surname, email, phone number and profile photo are never shown.</p></div></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setShowFirstName(false)} className={`rounded-xl border p-4 text-left ${!showFirstName ? "border-[#129B36] bg-white ring-2 ring-green-100" : "border-green-100 bg-transparent"}`}><p className="font-bold">Anonymous</p><p className="mt-1 text-xs text-slate-500">Shown as “Lagos resident”</p></button>
              <button type="button" onClick={() => setShowFirstName(true)} className={`rounded-xl border p-4 text-left ${showFirstName ? "border-[#129B36] bg-white ring-2 ring-green-100" : "border-green-100 bg-transparent"}`}><p className="font-bold">Show my first name</p><p className="mt-1 text-xs text-slate-500">Shown as “{user?.name?.split(" ")[0] || "First name"}”</p></button>
            </div>
          </div>

          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-600"><input type="checkbox" className="mt-1 h-4 w-4 accent-[#129B36]" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span>I confirm this is my own experience and does not include anyone’s private information, threats or claims I cannot support.</span></label>
        </section>

        <div className="mt-6 flex flex-col gap-4 rounded-3xl bg-[#103f2b] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex gap-3"><Info className="mt-1 h-5 w-5 shrink-0 text-[#f4ce70]" /><div><p className="font-bold">Nothing publishes immediately</p><p className="mt-1 text-sm text-green-50/70">An administrator will check the review for privacy, usefulness and community standards.</p></div></div>
          <Button type="submit" disabled={submitting || !confirmed} className="h-12 shrink-0 rounded-xl bg-[#e8bb50] px-7 font-bold text-[#103f2b] hover:bg-[#f4ce70]">{submitting ? "Submitting…" : <><CheckCircle2 className="h-4 w-4" /> Submit for review</>}</Button>
        </div>
      </form>
    </div>
  );
};

export default AreaReviewWritePage;
