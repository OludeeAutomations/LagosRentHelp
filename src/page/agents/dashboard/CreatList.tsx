import React, { useState } from "react";
import {
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  Plus,
  X,
  Image,
} from "lucide-react";
import { usePropertyStore } from "@/stores/propertyStore";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Schema definition with proper amenities array validation
const createListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.number().min(10000, "Price must be at least ₦10,000"),
  location: z.string().min(3, "Location is required"),
  type: z.enum([
    "1-bedroom",
    "2-bedroom",
    "3-bedroom",
    "duplex",
    "studio",
    "mini-flat",
    "short-let",
  ]),
  listingType: z.enum(["rent", "short-let"]),
  bedrooms: z.number().min(0, "Number of bedrooms is required"),
  bathrooms: z.number().min(0, "Number of bathrooms is required"),
  area: z.number().min(1, "Area is required"),
  amenities: z.array(z.string()).default([]),
});

type CreateListingForm = z.infer<typeof createListingSchema>;

const CreateListing: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [amenityInput, setAmenityInput] = useState("");
  const { agent } = useAuthStore();
  const { addProperty } = usePropertyStore();
  const navigate = useNavigate();

  // Initialize form with proper typing
  const form = useForm<CreateListingForm>({
    resolver: zodResolver(createListingSchema) as never,
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      location: "",
      type: "1-bedroom",
      listingType: "rent",
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
      amenities: [],
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        newImages.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    }

    setSelectedImages((prev) => [...prev, ...newImages]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
  };

  const addAmenity = () => {
    const currentAmenities = form.getValues("amenities");
    if (
      amenityInput.trim() &&
      !currentAmenities.includes(amenityInput.trim())
    ) {
      form.setValue("amenities", [...currentAmenities, amenityInput.trim()]);
      setAmenityInput("");
    }
  };

  const removeAmenity = (amenityToRemove: string) => {
    const currentAmenities = form.getValues("amenities");
    form.setValue(
      "amenities",
      currentAmenities.filter((amenity) => amenity !== amenityToRemove)
    );
  };

  // In your CreateListing component, modify the onSubmit function:
  const onSubmit = async (data: CreateListingForm) => {
    if (!agent) return;

    setIsSubmitting(true);

    try {
      // Create FormData instead of JSON
      const formData = new FormData();

      // Append ALL required fields from your form
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("location", data.location);
      formData.append("type", data.type);
      formData.append("listingType", data.listingType); // ← FIXED: Use form value
      formData.append("bedrooms", data.bedrooms.toString());
      formData.append("bathrooms", data.bathrooms.toString());
      formData.append("area", data.area.toString());

      // Append amenities as JSON string
      formData.append("amenities", JSON.stringify(data.amenities || []));

      // Debug: Check what's being sent
      console.log("FormData contents:");
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Append images
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      // Use the FormData to create property
      await addProperty(formData);

      toast.success("Listing created successfully!");
      navigate("/agent-dashboard");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create listing";
      toast.error(errorMessage);
      console.error("Create listing error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Agent Access Required</CardTitle>
            <CardDescription>
              You need to be a verified agent to create listings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/agent-onboarding">Become an Agent</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Verification Status */}
        {agent.verificationStatus === "pending" && (
          <Alert variant="default" className="bg-yellow-100 border-yellow-300">
            <AlertTitle>Verification Pending</AlertTitle>
            <AlertDescription>
              Your agent verification is still in progress. You can create
              listings, but they won't be published until you're verified.
            </AlertDescription>
          </Alert>
        )}

        {/* Free Listings Remaining */}
        {agent.freeListingsUsed < 2 && (
          <Alert variant="default">
            <AlertTitle>Free Listings Available</AlertTitle>
            <AlertDescription>
              You have {2 - agent.freeListingsUsed} free listings remaining in
              your trial period.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Create New Property Listing</CardTitle>
            <CardDescription>
              Fill out all the details about your property to attract potential
              tenants.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title Field */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Luxury 2-Bedroom Apartment in Lekki"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Type Field */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-bedroom">1 Bedroom</SelectItem>
                            <SelectItem value="2-bedroom">2 Bedroom</SelectItem>
                            <SelectItem value="3-bedroom">3 Bedroom</SelectItem>
                            <SelectItem value="duplex">Duplex</SelectItem>
                            <SelectItem value="studio">Studio</SelectItem>
                            <SelectItem value="mini-flat">Mini Flat</SelectItem>
                            <SelectItem value="short-let">Short Let</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="listingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Listing Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="rent">Rent</SelectItem>
                            <SelectItem value="short-let">Short Let</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description Field */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the property features, location advantages, and unique selling points..."
                          className="min-h-[120px]"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location Field */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="e.g., Lekki Phase 1, Lagos"
                            className="pl-10"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price and Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Price Field */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₦) *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="500000"
                              className="pl-10"
                              disabled={isSubmitting}
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Bedrooms Field */}
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Bed className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="2"
                              className="pl-10"
                              disabled={isSubmitting}
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Bathrooms Field */}
                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathrooms *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Bath className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="2"
                              className="pl-10"
                              disabled={isSubmitting}
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Area Field */}
                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area (sq ft) *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Square className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="1200"
                              className="pl-10"
                              disabled={isSubmitting}
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Amenities Field */}
                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amenities</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={amenityInput}
                              onChange={(e) => setAmenityInput(e.target.value)}
                              placeholder="Add an amenity (e.g., Swimming Pool)"
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), addAmenity())
                              }
                              disabled={isSubmitting}
                            />
                            <Button
                              type="button"
                              onClick={addAmenity}
                              disabled={isSubmitting}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {field.value.map((amenity, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-sm">
                                {amenity}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() => removeAmenity(amenity)}
                                  disabled={isSubmitting}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Images Upload */}
                <div className="space-y-2">
                  <Label htmlFor="images">Property Images *</Label>
                  <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      id="images"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isSubmitting}
                    />
                    <label htmlFor="images" className="cursor-pointer">
                      <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-foreground font-medium mb-2">
                        Upload Property Images
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Click to upload (max 10 images)
                      </p>
                      {imagePreviews.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="h-20 w-full object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                                onClick={() => removeImage(index)}
                                disabled={isSubmitting}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </label>
                  </div>
                  {selectedImages.length === 0 && (
                    <p className="text-sm text-destructive">
                      At least one image is required
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || selectedImages.length === 0}>
                  {isSubmitting ? "Creating Listing..." : "Create Listing"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateListing;
