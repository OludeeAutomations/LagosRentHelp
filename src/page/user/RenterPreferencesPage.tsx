import { useEffect, useState } from "react";
import { Briefcase, Home, Loader2, ShieldCheck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthLayout from "@/components/common/AuthLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LAGOS_LOCAL_GOVERNMENTS } from "@/lib/nigeriaLocations";
import {
  ACCOMMODATION_TYPES,
  BUDGET_BANDS,
  EMPLOYMENT_TYPES,
  GENDER_OPTIONS,
  INCOME_BANDS,
  LEASE_DURATIONS,
  MOVE_IN_WINDOWS,
  PROPERTY_TYPES,
  YES_NO_OPTIONS,
} from "@/lib/rentalMatching";
import {
  renterPreferenceService,
  type RenterPreferences,
} from "@/services/renterPreferenceService";

const defaultPreferences: RenterPreferences = {
  preferredLga: "",
  budgetMin: BUDGET_BANDS[0].min,
  budgetMax: BUDGET_BANDS[0].max,
  propertyType: "1-bedroom",
  occupantCount: 1,
  isAdult: true,
  employmentType: "salaried",
  incomeBand: 1,
  moveInWindow: "flexible",
  leaseDurationMonths: 12,
  hasGuarantor: false,
  hasPets: false,
  smokes: false,
  accommodationType: "any",
  gender: "prefer_not_to_say",
};

const fieldClassName = "h-10 w-full rounded-md border border-input bg-white px-3 text-sm";

const RenterPreferencesPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<RenterPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void renterPreferenceService
      .getMine()
      .then((preferences) => {
        if (preferences) setForm(preferences);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Could not load your preferences.");
      })
      .finally(() => setLoading(false));
  }, []);

  const update = <Key extends keyof RenterPreferences>(
    key: Key,
    value: RenterPreferences[Key],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const selectedBudget =
    BUDGET_BANDS.find(
      (band) => band.min === form.budgetMin && band.max === form.budgetMax,
    )?.value || BUDGET_BANDS[0].value;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.preferredLga) {
      toast.error("Select your preferred Lagos LGA.");
      return;
    }
    if (!form.isAdult) {
      toast.error("You must be at least 18 years old to rent a property.");
      return;
    }
    setSaving(true);
    try {
      await renterPreferenceService.saveMine(form);
      localStorage.removeItem("needs_renter_preferences");
      toast.success("Your rental preferences have been saved.");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your preferences.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#129B36]" /></div>;
  }

  return (
    <AuthLayout
      title="Find homes that fit you"
      subtitle="Tell us what you need once and we will rank suitable available listings for you."
      sideTitle="A Better Way to Find Home"
      sideSubtitle="Personalised matches built around your budget, lifestyle and preferred Lagos location."
      sideIcon={Home}
      contentClassName="max-w-xl">
      <form className="space-y-7" onSubmit={submit}>
        <h2 className="text-lg font-semibold text-gray-950">Your rental preferences</h2>
              <section className="grid gap-4 sm:grid-cols-2">
                <h2 className="flex items-center gap-2 font-semibold sm:col-span-2"><Home className="h-5 w-5 text-[#129B36]" />Home and budget</h2>
                <div className="space-y-2"><Label htmlFor="preferredLga">Preferred Lagos LGA *</Label><select id="preferredLga" className={fieldClassName} value={form.preferredLga} onChange={(event) => update("preferredLga", event.target.value)}><option value="">Select Lagos LGA</option>{LAGOS_LOCAL_GOVERNMENTS.map((lga) => <option key={lga} value={lga}>{lga}</option>)}</select></div>
                <div className="space-y-2"><Label htmlFor="budget">Yearly rent budget *</Label><select id="budget" className={fieldClassName} value={selectedBudget} onChange={(event) => { const band = BUDGET_BANDS.find((item) => item.value === event.target.value); if (band) setForm((current) => ({ ...current, budgetMin: band.min, budgetMax: band.max })); }}>{BUDGET_BANDS.map((band) => <option key={band.value} value={band.value}>{band.label}</option>)}</select></div>
                <div className="space-y-2"><Label htmlFor="propertyType">Preferred property type *</Label><select id="propertyType" className={fieldClassName} value={form.propertyType} onChange={(event) => update("propertyType", event.target.value)}>{PROPERTY_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
                <div className="space-y-2"><Label htmlFor="occupantCount">Number of occupants *</Label><select id="occupantCount" className={fieldClassName} value={form.occupantCount} onChange={(event) => update("occupantCount", Number(event.target.value))}>{Array.from({ length: 10 }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count}</option>)}</select></div>
                <div className="space-y-2"><Label htmlFor="isAdult">Are you at least 18 years old? *</Label><select id="isAdult" className={fieldClassName} value={String(form.isAdult)} onChange={(event) => update("isAdult", event.target.value === "true")}><option value="true">Yes</option><option value="false">No</option></select></div>
                <div className="space-y-2"><Label htmlFor="moveInWindow">Move-in timing *</Label><select id="moveInWindow" className={fieldClassName} value={form.moveInWindow} onChange={(event) => update("moveInWindow", event.target.value)}>{MOVE_IN_WINDOWS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
                <div className="space-y-2"><Label htmlFor="leaseDuration">Preferred lease duration *</Label><select id="leaseDuration" className={fieldClassName} value={form.leaseDurationMonths} onChange={(event) => update("leaseDurationMonths", Number(event.target.value))}>{LEASE_DURATIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
              </section>

              <section className="grid gap-4 border-t pt-6 sm:grid-cols-2">
                <h2 className="flex items-center gap-2 font-semibold sm:col-span-2"><Briefcase className="h-5 w-5 text-[#129B36]" />Affordability</h2>
                <div className="space-y-2"><Label htmlFor="employmentType">Employment arrangement *</Label><select id="employmentType" className={fieldClassName} value={form.employmentType} onChange={(event) => update("employmentType", event.target.value)}>{EMPLOYMENT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
                <div className="space-y-2"><Label htmlFor="incomeBand">Monthly income range *</Label><select id="incomeBand" className={fieldClassName} value={form.incomeBand} onChange={(event) => update("incomeBand", Number(event.target.value))}>{INCOME_BANDS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
                <div className="space-y-2"><Label htmlFor="hasGuarantor">Guarantor available *</Label><select id="hasGuarantor" className={fieldClassName} value={String(form.hasGuarantor)} onChange={(event) => update("hasGuarantor", event.target.value === "true")}>{YES_NO_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
              </section>

              <section className="grid gap-4 border-t pt-6 sm:grid-cols-2">
                <h2 className="flex items-center gap-2 font-semibold sm:col-span-2"><Users className="h-5 w-5 text-[#129B36]" />Household and lifestyle</h2>
                <div className="space-y-2"><Label htmlFor="hasPets">Will pets live with you? *</Label><select id="hasPets" className={fieldClassName} value={String(form.hasPets)} onChange={(event) => update("hasPets", event.target.value === "true")}>{YES_NO_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
                <div className="space-y-2"><Label htmlFor="smokes">Will anyone smoke in the property? *</Label><select id="smokes" className={fieldClassName} value={String(form.smokes)} onChange={(event) => update("smokes", event.target.value === "true")}>{YES_NO_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
                <div className="space-y-2"><Label htmlFor="accommodationType">Accommodation preference *</Label><select id="accommodationType" className={fieldClassName} value={form.accommodationType} onChange={(event) => update("accommodationType", event.target.value)}>{ACCOMMODATION_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
                {form.accommodationType === "shared" && <div className="space-y-2"><Label htmlFor="gender">Gender for shared-home matching</Label><select id="gender" className={fieldClassName} value={form.gender} onChange={(event) => update("gender", event.target.value)}>{GENDER_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>}
              </section>

              <div className="flex gap-3 rounded-lg border border-green-100 bg-green-50 p-4 text-sm text-gray-700">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#129B36]" />
                <p>Your answers stay private and are used only to rank available listings for you. Landlords cannot see your preference profile.</p>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-[#129B36] hover:bg-[#0e7d2b]">{saving && <Loader2 className="animate-spin" />}Save and see matches</Button>
              </div>
      </form>
    </AuthLayout>
  );
};

export default RenterPreferencesPage;
