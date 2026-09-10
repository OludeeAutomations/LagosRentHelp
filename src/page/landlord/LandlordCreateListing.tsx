import { useState } from "react";
import { ImagePlus, Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
};

const LandlordCreateListing = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const update = (field: keyof FormState, value: string | number) =>
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

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title || !form.description || !form.location || images.length === 0) {
      toast.error("Add the title, description, location and at least one image.");
      return;
    }
    if (form.price <= 0) {
      toast.error("Enter a valid rent price.");
      return;
    }

    setSubmitting(true);
    try {
      await landlordService.createListing({
        ...form,
        amenities: form.amenities.split(",").map((item) => item.trim()).filter(Boolean),
        images,
      });
      toast.success("Listing submitted for review.");
      setOpen(false);
      navigate("/landlord/listings", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create listing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <Card className="w-full">
        <CardHeader className="justify-items-center px-6 pb-0 pt-12 text-center sm:px-12">
          <CardTitle className="text-3xl">Add your property</CardTitle>
          <p className="mx-auto w-full max-w-xl text-center text-gray-600">
            Add your property details and photos. Your listing will be reviewed
            before it is published for renters to see.
          </p>
        </CardHeader>
        <CardContent className="flex justify-center px-6 pb-12 pt-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-[#129B36] px-8 hover:bg-[#0e7d2b]">
                <Plus className="mr-2 h-5 w-5" />
                Create new listing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">Property information</DialogTitle>
                <DialogDescription>
                  Complete every required field. Your listing will remain pending until approved.
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
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="images">Property images * (maximum 8)</Label><label htmlFor="images" className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-gray-600 hover:border-[#129B36]"><ImagePlus className="h-6 w-6" />{images.length ? `${images.length} image(s) selected` : "Choose images"}</label><Input id="images" type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => chooseImages(e.target.files)} /></div>
                <div className="flex gap-3 sm:col-span-2"><Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={submitting} className="flex-1 bg-[#129B36] hover:bg-[#0e7d2b]">{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Submit for review</Button></div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </main>
  );
};

export default LandlordCreateListing;
