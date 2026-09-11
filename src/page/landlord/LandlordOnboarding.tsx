import { useEffect, useState, type FormEvent } from "react";
import {
  Building2,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileUp,
  ImagePlus,
  Loader2,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthLayout from "@/components/common/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  LAGOS_LOCAL_GOVERNMENTS,
  NIGERIAN_STATES,
  OWNERSHIP_DOCUMENT_TYPES,
} from "@/lib/nigeriaLocations";
import { landlordService } from "@/services/landlordService";
import { useAuthStore } from "@/stores/authStore";

type Step = 1 | 2 | 3 | 4;

const steps = [
  { number: 1, label: "Profile", icon: UserRoundCheck },
  { number: 2, label: "Identity", icon: ShieldCheck },
  { number: 3, label: "Ownership", icon: FileCheck2 },
  { number: 4, label: "Review", icon: ClipboardCheck },
] as const;

const initialForm = {
  businessName: "",
  whatsappNumber: "",
  residentialAddress: "",
  state: "",
  localGovernment: "",
  bio: "",
  nin: "",
  propertyAddress: "",
  propertyLocalGovernment: "",
  ownershipDocumentType: "",
};

const LandlordOnboarding = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [verifyingNin, setVerifyingNin] = useState(false);
  const [verifiedNin, setVerifiedNin] = useState("");
  const [verifiedIdentityName, setVerifiedIdentityName] = useState("");
  const [identityImage, setIdentityImage] = useState<File | null>(null);
  const [ownershipDocument, setOwnershipDocument] = useState<File | null>(null);
  const [ownershipConfirmed, setOwnershipConfirmed] = useState(false);
  const [form, setForm] = useState({
    ...initialForm,
    whatsappNumber: user?.phone || "",
  });

  useEffect(() => {
    if (!user?.id) return;
    void landlordService.getProfile().then((profile) => {
      if (!profile) return;
      setForm((current) => ({
        ...current,
        businessName: profile.businessName,
        whatsappNumber: profile.whatsappNumber,
        residentialAddress: profile.residentialAddress,
        state: profile.state,
        localGovernment: profile.localGovernment,
        bio: profile.bio,
      }));
    }).catch(() => undefined);
  }, [user?.id]);

  const update = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const chooseFile = (
    kind: "identity" | "ownership",
    files: FileList | null,
  ) => {
    const file = files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("The selected file must be smaller than 5 MB.");
      return;
    }
    if (kind === "identity" && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Upload your photo as a JPG, PNG or WebP image.");
      return;
    }
    if (kind === "ownership" && !["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Upload the ownership document as a PDF, JPG, PNG or WebP file.");
      return;
    }
    if (kind === "identity") setIdentityImage(file);
    else setOwnershipDocument(file);
  };

  const validateStep = (target: Step): boolean => {
    if (target === 1) {
      if (
        !form.businessName.trim() ||
        !form.whatsappNumber.trim() ||
        !form.residentialAddress.trim() ||
        !form.state ||
        !form.localGovernment.trim()
      ) {
        toast.error("Complete all required profile and location fields.");
        return false;
      }
    }
    if (target === 2) {
      if (!/^\d{11}$/.test(form.nin)) {
        toast.error("Enter a valid 11-digit NIN.");
        return false;
      }
      if (!identityImage) {
        toast.error("Upload a clear personal photograph.");
        return false;
      }
    }
    if (target === 3) {
      if (
        !form.propertyAddress.trim() ||
        !form.propertyLocalGovernment ||
        !form.ownershipDocumentType ||
        !ownershipDocument
      ) {
        toast.error("Complete the Lagos property details and upload proof of ownership.");
        return false;
      }
      if (!ownershipConfirmed) {
        toast.error("Confirm that the property and document belong to you.");
        return false;
      }
    }
    return true;
  };

  const next = async () => {
    if (!validateStep(step) || step === 4) return;
    if (step === 2 && verifiedNin !== form.nin) {
      setVerifyingNin(true);
      try {
        const result = await landlordService.verifyNin(form.nin);
        setVerifiedNin(form.nin);
        setVerifiedIdentityName(result.identity.fullName);
        toast.success("NIN verified successfully.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "NIN verification failed.");
        return;
      } finally {
        setVerifyingNin(false);
      }
    }
    setStep((current) => Math.min(4, current + 1) as Step);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (step < 4) {
      await next();
      return;
    }
    if (!identityImage || !ownershipDocument || verifiedNin !== form.nin) {
      toast.error("Verify your NIN before submitting the application.");
      setStep(2);
      return;
    }

    setSubmitting(true);
    try {
      await landlordService.submitApplication({
        ...form,
        identityImage,
        ownershipDocument,
      });
      if (user) {
        setUser({ ...user, role: "landlord", phone: form.whatsappNumber.trim() });
      }
      toast.success("Your landlord application has been submitted for review.");
      navigate("/landlord", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Application submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDocumentLabel = OWNERSHIP_DOCUMENT_TYPES.find(
    (item) => item.value === form.ownershipDocumentType,
  )?.label;

  return (
    <AuthLayout
      title="Landlord verification"
      subtitle="Complete each step to submit your landlord application."
      sideTitle="Verified Landlords. Trusted Listings."
      sideSubtitle="We verify identity and property ownership to protect Lagos renters."
      sideIcon={Building2}
      contentClassName="max-w-xl">
      <div className="mb-8">
        <div className="relative flex justify-between">
          <div className="absolute left-[10%] right-[10%] top-5 h-0.5 bg-gray-200" />
          {steps.map((item) => {
            const Icon = item.icon;
            const complete = step > item.number;
            const active = step === item.number;
            return (
              <div key={item.number} className="relative z-10 flex w-1/4 flex-col items-center gap-2">
                <span className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${complete || active ? "border-[#129B36] bg-[#129B36] text-white" : "border-gray-200 bg-white text-gray-400"}`}>
                  {complete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" strokeWidth={1.8} />}
                </span>
                <span className={`text-xs font-medium ${active ? "text-[#129B36]" : "text-gray-500"}`}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <form className="space-y-5" onSubmit={submit}>
        {step === 1 && (
          <section className="space-y-5">
            <div><h2 className="text-lg font-semibold text-gray-950">Profile and contact details</h2><p className="mt-1 text-sm text-gray-500">Tell us who you are and where you are based.</p></div>
            <div className="space-y-2"><Label htmlFor="businessName">Display or business name *</Label><Input id="businessName" value={form.businessName} onChange={(event) => update("businessName", event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="whatsappNumber">WhatsApp number *</Label><Input id="whatsappNumber" inputMode="tel" placeholder="+234..." value={form.whatsappNumber} onChange={(event) => update("whatsappNumber", event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="residentialAddress">Residential or office address *</Label><Input id="residentialAddress" value={form.residentialAddress} onChange={(event) => update("residentialAddress", event.target.value)} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="state">State *</Label><select id="state" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.state} onChange={(event) => update("state", event.target.value)}><option value="">Select state</option>{NIGERIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}</select></div>
              <div className="space-y-2"><Label htmlFor="localGovernment">Local government area *</Label><Input id="localGovernment" placeholder="Enter your LGA" value={form.localGovernment} onChange={(event) => update("localGovernment", event.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="bio">Short description</Label><Textarea id="bio" rows={3} value={form.bio} onChange={(event) => update("bio", event.target.value)} /></div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-5">
            <div><h2 className="text-lg font-semibold text-gray-950">Identity verification</h2><p className="mt-1 text-sm text-gray-500">Your NIN and photograph are private and used only for verification.</p></div>
            <div className="space-y-2">
              <Label htmlFor="nin">National Identification Number (NIN) *</Label>
              <Input id="nin" inputMode="numeric" autoComplete="off" maxLength={11} placeholder="11-digit NIN" value={form.nin} onChange={(event) => { const value = event.target.value.replace(/\D/g, "").slice(0, 11); update("nin", value); if (value !== verifiedNin) { setVerifiedNin(""); setVerifiedIdentityName(""); } }} />
              <p className="text-xs text-gray-500">Enter the 11 digits printed on your NIN slip.</p>
              {verifiedNin === form.nin && (
                <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  <BadgeCheck className="h-5 w-5 shrink-0" />
                  <span>NIN verified{verifiedIdentityName ? ` for ${verifiedIdentityName}` : ""}.</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="identityImage">Clear personal photograph *</Label>
              <label htmlFor="identityImage" className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 px-5 py-8 text-center transition-colors hover:border-[#129B36] hover:bg-green-50/40">
                <ImagePlus className="mb-2 h-7 w-7 text-[#129B36]" strokeWidth={1.7} />
                <span className="text-sm font-medium text-gray-900">{identityImage?.name || "Upload a recent face photo"}</span>
                <span className="mt-1 text-xs text-gray-500">JPG, PNG or WebP, maximum 5 MB</span>
              </label>
              <Input id="identityImage" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => chooseFile("identity", event.target.files)} />
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-5">
            <div><h2 className="text-lg font-semibold text-gray-950">Lagos property ownership</h2><p className="mt-1 text-sm text-gray-500">Provide one document that connects you to a property in Lagos.</p></div>
            <div className="space-y-2"><Label htmlFor="propertyAddress">Lagos property address *</Label><Textarea id="propertyAddress" rows={3} placeholder="Full address of the property" value={form.propertyAddress} onChange={(event) => update("propertyAddress", event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="propertyLocalGovernment">Property local government area *</Label><select id="propertyLocalGovernment" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.propertyLocalGovernment} onChange={(event) => update("propertyLocalGovernment", event.target.value)}><option value="">Select Lagos LGA</option>{LAGOS_LOCAL_GOVERNMENTS.map((lga) => <option key={lga} value={lga}>{lga}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="ownershipDocumentType">Proof of ownership *</Label><select id="ownershipDocumentType" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.ownershipDocumentType} onChange={(event) => update("ownershipDocumentType", event.target.value)}><option value="">Select document type</option>{OWNERSHIP_DOCUMENT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
            <div className="space-y-2">
              <Label htmlFor="ownershipDocument">Ownership document *</Label>
              <label htmlFor="ownershipDocument" className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 px-5 py-8 text-center transition-colors hover:border-[#129B36] hover:bg-green-50/40">
                <FileUp className="mb-2 h-7 w-7 text-[#129B36]" strokeWidth={1.7} />
                <span className="max-w-full truncate text-sm font-medium text-gray-900">{ownershipDocument?.name || "Upload ownership evidence"}</span>
                <span className="mt-1 text-xs text-gray-500">PDF, JPG, PNG or WebP, maximum 5 MB</span>
              </label>
              <Input id="ownershipDocument" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => chooseFile("ownership", event.target.files)} />
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-700"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#129B36]" checked={ownershipConfirmed} onChange={(event) => setOwnershipConfirmed(event.target.checked)} /><span>I confirm that I own the stated property and that the uploaded document is genuine.</span></label>
          </section>
        )}

        {step === 4 && (
          <section className="space-y-5">
            <div><h2 className="text-lg font-semibold text-gray-950">Review your application</h2><p className="mt-1 text-sm text-gray-500">Confirm your information before submitting it for administrator review.</p></div>
            <div className="divide-y rounded-lg border bg-gray-50/60 px-4">
              <div className="py-3"><p className="text-xs text-gray-500">Landlord</p><p className="text-sm font-medium">{form.businessName}</p></div>
              <div className="grid gap-3 py-3 sm:grid-cols-2"><div><p className="text-xs text-gray-500">Contact location</p><p className="text-sm font-medium">{form.localGovernment}, {form.state}</p></div><div><p className="text-xs text-gray-500">Verified identity</p><p className="text-sm font-medium">{verifiedIdentityName || `NIN ending ${form.nin.slice(-4)}`}</p></div></div>
              <div className="py-3"><p className="text-xs text-gray-500">Lagos property</p><p className="text-sm font-medium">{form.propertyAddress}, {form.propertyLocalGovernment} LGA</p></div>
              <div className="py-3"><p className="text-xs text-gray-500">Ownership evidence</p><p className="text-sm font-medium">{selectedDocumentLabel}</p></div>
            </div>
            <div className="flex gap-3 rounded-lg border border-green-100 bg-green-50 p-4"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#129B36]" /><p className="text-sm leading-6 text-gray-700">Your identity image, NIN and ownership document are stored privately and are available only for verification.</p></div>
          </section>
        )}

        <div className="flex gap-3 pt-2">
          {step > 1 && <Button type="button" variant="outline" className="flex-1" disabled={submitting || verifyingNin} onClick={() => setStep((current) => Math.max(1, current - 1) as Step)}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>}
          {step < 4 ? <Button type="button" disabled={verifyingNin} className="flex-1 bg-[#129B36] hover:bg-[#0e7d2b]" onClick={() => void next()}>{verifyingNin && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{step === 2 ? "Verify & continue" : "Continue"} {!verifyingNin && <ChevronRight className="ml-1 h-4 w-4" />}</Button> : <Button type="submit" className="flex-1 bg-[#129B36] hover:bg-[#0e7d2b]" disabled={submitting}>{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Submit application</Button>}
        </div>
      </form>
    </AuthLayout>
  );
};

export default LandlordOnboarding;
