import { useEffect, useState } from "react";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { landlordService, type LandlordListingInput } from "@/services/landlordService";
import {
  ACCOMMODATION_TYPES,
  EMPLOYMENT_TYPES,
  INCOME_BANDS,
  LEASE_DURATIONS,
  MOVE_IN_WINDOWS,
  YES_NO_OPTIONS,
} from "@/lib/rentalMatching";

type FormState = Omit<LandlordListingInput, "images" | "amenities"> & {
  amenities: string;
};

const initialForm: FormState = {
  title: "",
  description: "",
  price: 0,
  totalPackagePrice: 0,
  location: "",
  type: "1-bedroom",
  listingType: "rent",
  bedrooms: 1,
  bathrooms: 1,
  area: 1,
  amenities: "",
  tenantMaxOccupants: 2,
  tenantEmploymentType: "any",
  tenantMinIncomeBand: 0,
  tenantGuarantorRequired: false,
  tenantMinLeaseMonths: 12,
  tenantPetsAllowed: false,
  tenantSmokingAllowed: false,
  tenantMoveInWindow: "flexible",
  tenantAccommodationType: "private",
  tenantGenderPreference: "any",
};

const LandlordCreateListing = () => {
  const navigate = useNavigate();
  const { listingId } = useParams<{ listingId: string }>();
  const isEditing = Boolean(listingId);
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<Array<{ file: File; url: string }>>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loadingListing, setLoadingListing] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(isEditing);
  useEffect(() => {
    let active = true;
    Promise.all(images.map((file) => new Promise<{ file: File; url: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ file, url: String(reader.result) });
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    }))).then((previews) => {
      if (active) setImagePreviews(previews);
    }).catch(() => {
      if (active) toast.error("One of the selected images could not be previewed.");
    });
    if (images.length === 0) setImagePreviews([]);
    return () => { active = false; };
  }, [images]);

  useEffect(() => {
    if (!listingId) return;

    void landlordService
      .getMyListingById(listingId)
      .then((listing) => {
        setForm({
          title: listing.title,
          description: listing.description,
          price: listing.price,
          totalPackagePrice: listing.totalPackagePrice,
          location: listing.location,
          type: listing.type,
          listingType: listing.listingType,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          area: listing.area,
          amenities: listing.amenities.join(", "),
          tenantMaxOccupants: listing.tenantMaxOccupants,
          tenantEmploymentType: listing.tenantEmploymentType,
          tenantMinIncomeBand: listing.tenantMinIncomeBand,
          tenantGuarantorRequired: listing.tenantGuarantorRequired,
          tenantMinLeaseMonths: listing.tenantMinLeaseMonths,
          tenantPetsAllowed: listing.tenantPetsAllowed,
          tenantSmokingAllowed: listing.tenantSmokingAllowed,
          tenantMoveInWindow: listing.tenantMoveInWindow,
          tenantAccommodationType: listing.tenantAccommodationType,
          tenantGenderPreference: listing.tenantGenderPreference,
        });
        setExistingImages(listing.images);
        setOpen(true);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Could not load this listing.");
        navigate("/landlord/listings", { replace: true });
      })
      .finally(() => setLoadingListing(false));
  }, [listingId, navigate]);

  const update = (field: keyof FormState, value: string | number | boolean) =>
    setForm((current) => ({ ...current, [field]: value }));

  const chooseImages = (files: FileList | null) => {
    const selected = Array.from(files || []);
    if (selected.length > 8) {
      toast.error("You can upload up to 8 images.");
      return;
    }
    if (selected.some((file) => file.size > 5 * 1024 * 1024)) {
      toast.error("Each image must be smaller than 5 MB.");
      return;
    }
    setImages(selected);
  };

  const removeImage = (index: number) => {
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title || !form.description || !form.location || (!isEditing && images.length === 0)) {
      toast.error("Add the title, description, location and at least one image.");
      return;
    }
    if (form.price <= 0) {
      toast.error("Enter a valid rent price.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        amenities: form.amenities.split(",").map((item) => item.trim()).filter(Boolean),
        images,
      };
      if (isEditing && listingId) {
        await landlordService.updateListing(listingId, payload);
        toast.success("Listing updated successfully.");
      } else {
        await landlordService.createListing(payload);
        toast.success("Listing published successfully.");
      }
      setOpen(false);
      navigate("/landlord/listings", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Could not ${isEditing ? "update" : "create"} listing.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingListing) {
    return <main className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#129B36]" /></main>;
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen && isEditing) navigate("/landlord/listings");
  };

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <Card className="w-full">
        <CardHeader className="justify-items-center px-6 pb-0 pt-12 text-center sm:px-12">
          <CardTitle className="text-3xl">{isEditing ? "Edit your property" : "Add your property"}</CardTitle>
          <p className="mx-auto w-full max-w-xl text-center text-gray-600">
            {isEditing
              ? "Update the property details, matching preferences or photos for this listing."
              : "Add accurate property details and photos. Because your landlord account is verified, the listing will publish immediately."}
          </p>
        </CardHeader>
        <CardContent className="flex justify-center px-6 pb-12 pt-2">
          <Dialog open={open} onOpenChange={handleOpenChange}>
            {!isEditing && <DialogTrigger asChild>
              <Button size="lg" className="bg-[#129B36] px-8 hover:bg-[#0e7d2b]">
                <Plus className="mr-2 h-5 w-5" />
                Create new listing
              </Button>
            </DialogTrigger>}
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">{isEditing ? "Edit property information" : "Property information"}</DialogTitle>
                <DialogDescription>
                  {isEditing ? "Save your changes to update this listing immediately." : "Complete every required field. Duplicate property submissions are automatically blocked."}
                </DialogDescription>
              </DialogHeader>
              <form className="grid gap-5 py-2 sm:grid-cols-2" onSubmit={submit}>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="title">Listing title *</Label><Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="description">Description *</Label><Textarea id="description" rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="location">Location *</Label><Input id="location" placeholder="Lekki Phase 1, Lagos" value={form.location} onChange={(e) => update("location", e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="listingType">Listing type</Label><select id="listingType" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.listingType} onChange={(e) => update("listingType", e.target.value)}><option value="rent">Annual rent</option><option value="short-let">Short let</option></select></div>
            <div className="space-y-2"><Label htmlFor="type">Property type</Label><select id="type" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.type} onChange={(e) => update("type", e.target.value)}><option value="1-bedroom">1 bedroom</option><option value="2-bedroom">2 bedrooms</option><option value="3-bedroom">3 bedrooms</option><option value="duplex">Duplex</option><option value="studio">Studio</option><option value="mini-flat">Mini flat</option><option value="short-let">Short let</option></select></div>
            <div className="space-y-2"><Label htmlFor="price">Rent price (₦) *</Label><Input id="price" type="number" min="1" value={form.price || ""} onChange={(e) => update("price", Number(e.target.value))} /></div>
            <div className="space-y-2"><Label htmlFor="totalPackagePrice">Total package price (₦)</Label><Input id="totalPackagePrice" type="number" min="0" value={form.totalPackagePrice || ""} onChange={(e) => update("totalPackagePrice", Number(e.target.value))} /></div>
            <div className="space-y-2"><Label htmlFor="bedrooms">Bedrooms</Label><Input id="bedrooms" type="number" min="0" value={form.bedrooms} onChange={(e) => update("bedrooms", Number(e.target.value))} /></div>
            <div className="space-y-2"><Label htmlFor="bathrooms">Bathrooms</Label><Input id="bathrooms" type="number" min="0" value={form.bathrooms} onChange={(e) => update("bathrooms", Number(e.target.value))} /></div>
            <div className="space-y-2"><Label htmlFor="area">Area (sqm)</Label><Input id="area" type="number" min="1" value={form.area} onChange={(e) => update("area", Number(e.target.value))} /></div>
            <div className="space-y-2"><Label htmlFor="amenities">Amenities</Label><Input id="amenities" placeholder="Parking, water, security" value={form.amenities} onChange={(e) => update("amenities", e.target.value)} /></div>
            <div className="border-t pt-5 sm:col-span-2"><h3 className="text-lg font-semibold">Tenant requirements</h3><p className="mt-1 text-sm text-gray-500">These private requirements help rank the listing for compatible renters. They do not hide the listing.</p></div>
            <div className="space-y-2"><Label htmlFor="tenantMaxOccupants">Maximum occupants</Label><select id="tenantMaxOccupants" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.tenantMaxOccupants} onChange={(e) => update("tenantMaxOccupants", Number(e.target.value))}>{Array.from({ length: 10 }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="tenantEmploymentType">Employment arrangement</Label><select id="tenantEmploymentType" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.tenantEmploymentType} onChange={(e) => update("tenantEmploymentType", e.target.value)}><option value="any">Any employment arrangement</option>{EMPLOYMENT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="tenantMinIncomeBand">Minimum monthly income</Label><select id="tenantMinIncomeBand" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.tenantMinIncomeBand} onChange={(e) => update("tenantMinIncomeBand", Number(e.target.value))}><option value={0}>No minimum selected</option>{INCOME_BANDS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="tenantGuarantorRequired">Guarantor required?</Label><select id="tenantGuarantorRequired" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={String(form.tenantGuarantorRequired)} onChange={(e) => update("tenantGuarantorRequired", e.target.value === "true")}>{YES_NO_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="tenantMinLeaseMonths">Minimum lease duration</Label><select id="tenantMinLeaseMonths" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.tenantMinLeaseMonths} onChange={(e) => update("tenantMinLeaseMonths", Number(e.target.value))}>{LEASE_DURATIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="tenantMoveInWindow">Preferred move-in timing</Label><select id="tenantMoveInWindow" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.tenantMoveInWindow} onChange={(e) => update("tenantMoveInWindow", e.target.value)}>{MOVE_IN_WINDOWS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="tenantPetsAllowed">Pets allowed?</Label><select id="tenantPetsAllowed" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={String(form.tenantPetsAllowed)} onChange={(e) => update("tenantPetsAllowed", e.target.value === "true")}>{YES_NO_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="tenantSmokingAllowed">Smoking allowed?</Label><select id="tenantSmokingAllowed" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={String(form.tenantSmokingAllowed)} onChange={(e) => update("tenantSmokingAllowed", e.target.value === "true")}>{YES_NO_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="tenantAccommodationType">Accommodation arrangement</Label><select id="tenantAccommodationType" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.tenantAccommodationType} onChange={(e) => update("tenantAccommodationType", e.target.value)}>{ACCOMMODATION_TYPES.filter((item) => item.value !== "any").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
            {form.tenantAccommodationType === "shared" && <div className="space-y-2"><Label htmlFor="tenantGenderPreference">Roommate gender preference</Label><select id="tenantGenderPreference" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.tenantGenderPreference} onChange={(e) => update("tenantGenderPreference", e.target.value)}><option value="any">No preference</option><option value="female">Woman</option><option value="male">Man</option></select></div>}
            <div className="space-y-3 sm:col-span-2">
              <Label htmlFor="images">{isEditing ? "Replace property images (optional)" : "Property images *"} (maximum 8)</Label>
              {isEditing && existingImages.length > 0 && <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{existingImages.slice(0, 6).map((image) => <img key={image} src={image} alt="Current property" className="aspect-square w-full rounded-lg border object-cover" />)}</div>}
              <label htmlFor="images" className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-gray-600 hover:border-[#129B36]"><ImagePlus className="h-6 w-6" />{images.length ? `${images.length} new image(s) selected` : isEditing ? "Choose new images, or keep the current ones" : "Choose images"}</label>
              <Input id="images" type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(event) => { chooseImages(event.target.files); event.currentTarget.value = ""; }} />
              {imagePreviews.length > 0 && (
                <div className="space-y-3 rounded-xl border bg-gray-50 p-3">
                  <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium">Selected image preview</p><Button type="button" variant="ghost" size="sm" onClick={() => setImages([])} className="text-red-600 hover:bg-red-50 hover:text-red-700">Clear all</Button></div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {imagePreviews.map(({ file, url }, index) => (
                      <div key={`${file.name}-${file.lastModified}`} className="group relative overflow-hidden rounded-lg border bg-white">
                        <img src={url} alt={`Selected property ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
                        <button type="button" onClick={() => removeImage(index)} aria-label={`Remove ${file.name}`} className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1 text-white shadow transition hover:bg-red-600"><X className="h-4 w-4" /></button>
                        <p className="truncate px-2 py-1.5 text-xs text-gray-600">{file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
                <div className="flex gap-3 sm:col-span-2"><Button type="button" variant="outline" className="flex-1" onClick={() => handleOpenChange(false)}>Cancel</Button><Button type="submit" disabled={submitting} className="flex-1 bg-[#129B36] hover:bg-[#0e7d2b]">{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isEditing ? "Save changes" : "Publish listing"}</Button></div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </main>
  );
};

export default LandlordCreateListing;
