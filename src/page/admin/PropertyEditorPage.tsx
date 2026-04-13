/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/authStore";
import { propertyService } from "@/services/propertyService";
import { userService } from "@/services/userService";
import { ManageableUser, Property, User } from "@/types";
import { ImagePlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
const propertyTypes = [
  "1-bedroom",
  "2-bedroom",
  "3-bedroom",
  "duplex",
  "studio",
  "mini-flat",
  "short-let",
] as const;

type PropertyFormState = {
  title: string;
  description: string;
  price: string;
  totalPackagePrice: string;
  location: string;
  type: (typeof propertyTypes)[number];
  listingType: "rent" | "short-let";
  bedrooms: string;
  bathrooms: string;
  area: string;
  amenities: string;
  ownerId: string;
  contactUserId: string;
  latitude: string;
  longitude: string;
  availableFrom: string;
  minimumStay: string;
};

const emptyForm: PropertyFormState = {
  title: "",
  description: "",
  price: "",
  totalPackagePrice: "",
  location: "",
  type: "1-bedroom",
  listingType: "rent",
  bedrooms: "0",
  bathrooms: "0",
  area: "0",
  amenities: "",
  ownerId: "",
  contactUserId: "",

  availableFrom: "",
  latitude: "",
  longitude: "",
  minimumStay: "",
};

const normalizeProperty = (payload: any): Property | null => {
  if (payload?.data?._id) return payload.data;
  if (payload?._id) return payload;
  return null;
};

const normalizeUsers = <T extends ManageableUser | User>(payload: any): T[] => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const PropertyEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [form, setForm] = useState<PropertyFormState>(emptyForm);
  const [manageableUsers, setManageableUsers] = useState<ManageableUser[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const isEditMode = Boolean(id);
  const canManage = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";
  const defaultContactId = useMemo(() => user?._id || "", [user?._id]);
  const [input, setInput] = useState("");
  const MIN_IMAGES = 5;
  const MAX_IMAGES = 10;

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const merged = [...files, ...Array.from(incoming)].slice(0, MAX_IMAGES);
    setFiles(merged);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };
  // Convert string → array (if your form stores string)
  const amenities = form.amenities
    ? form.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
    : [];

  const addAmenity = () => {
    const value = input.trim();
    if (!value || amenities.includes(value)) return;

    const updated = [...amenities, value];
    updateField("amenities", updated.join(", "));
    setInput("");
  };

  const removeAmenity = (item: string) => {
    const updated = amenities.filter((a) => a !== item);
    updateField("amenities", updated.join(", "));
  };
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!canManage) {
      navigate("/");
      return;
    }

    const loadPage = async () => {
      setPageLoading(true);
      try {
        const [usersResponse, adminsResponse, propertyResponse] =
          await Promise.all([
            userService.getManageableUsers(),
            isSuperAdmin
              ? userService.getAdmins()
              : Promise.resolve({ data: user ? [user] : [] }),
            isEditMode && id
              ? propertyService.getManageById(id)
              : Promise.resolve(null),
          ]);

        setManageableUsers(
          normalizeUsers<ManageableUser>(usersResponse.data || usersResponse),
        );
        setAdminUsers(
          normalizeUsers<User>(adminsResponse.data || adminsResponse),
        );

        if (propertyResponse) {
          const property = normalizeProperty(
            propertyResponse.data || propertyResponse,
          );
          if (property) {
            setForm({
              title: property.title || "",
              description: property.description || "",
              price: String(property.price || ""),
              totalPackagePrice: String(property.totalPackagePrice || ""),
              location: property.location || "",
              type: property.type || "1-bedroom",
              listingType: property.listingType || "rent",
              bedrooms: String(property.bedrooms || 0),
              bathrooms: String(property.bathrooms || 0),
              area: String(property.area || 0),
              amenities: (property.amenities || []).join(", "),
              ownerId:
                typeof property.ownerId === "object"
                  ? property.ownerId?._id || ""
                  : String(property.ownerId || ""),
              contactUserId:
                typeof property.contactUserId === "object"
                  ? property.contactUserId?._id || ""
                  : String(property.contactUserId || defaultContactId),
              latitude: property.coordinates?.lat
                ? String(property.coordinates.lat)
                : "",
              longitude: property.coordinates?.lng
                ? String(property.coordinates.lng)
                : "",
              availableFrom: property.availableFrom
                ? property.availableFrom.slice(0, 10)
                : "",
              minimumStay: property.minimumStay
                ? String(property.minimumStay)
                : "",
            });
          }
        } else {
          setForm((current) => ({
            ...current,
            contactUserId: defaultContactId,
            ownerId: current.ownerId || user?._id || "",
          }));
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load property editor");
      } finally {
        setPageLoading(false);
      }
    };

    loadPage();
  }, [
    user,
    canManage,
    navigate,
    isEditMode,
    id,
    defaultContactId,
    isSuperAdmin,
  ]);

  const updateField = (field: keyof PropertyFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.ownerId) {
      toast.error("Please assign the property to a user");
      return;
    }

    if (!form.contactUserId) {
      toast.error("Please set a contact admin");
      return;
    }

    // Latitude and longitude are hidden in the edit form
    // and should be preserved from existing property data.
    if (isEditMode && (!form.latitude || !form.longitude)) {
      toast.error("Please provide both latitude and longitude");
      return;
    }

    if (files.length < MIN_IMAGES) {
      toast.error(`Please upload at least ${MIN_IMAGES} images`);
      return;
    }
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("description", form.description);
      payload.append("price", form.price);
      payload.append("totalPackagePrice", form.totalPackagePrice || "0");
      payload.append("location", form.location);
      payload.append("type", form.type);
      payload.append("listingType", form.listingType);
      payload.append("bedrooms", form.bedrooms);
      payload.append("bathrooms", form.bathrooms);
      payload.append("area", form.area);
      payload.append(
        "amenities",
        JSON.stringify(
          form.amenities
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      );
      payload.append("ownerId", form.ownerId);
      payload.append("contactUserId", form.contactUserId);
      if (form.latitude && form.longitude) {
        payload.append(
          "coordinates",
          JSON.stringify({
            lat: Number(form.latitude),
            lng: Number(form.longitude),
          }),
        );
        payload.append("lat", form.latitude);
        payload.append("lng", form.longitude);
      }

      if (form.availableFrom) {
        payload.append("availableFrom", form.availableFrom);
      }

      if (form.minimumStay) {
        payload.append("minimumStay", form.minimumStay);
      }

      files.forEach((file) => payload.append("images", file));

      if (isEditMode && id) {
        await propertyService.update(id, payload);
        toast.success("Property updated successfully");
      } else {
        await propertyService.create(payload);
        toast.success(
          user?.role === "admin"
            ? "Property submitted for approval"
            : "Property created successfully",
        );
      }

      navigate("/admin/properties");
    } catch (error: unknown) {
      console.error("Failed to save property:", error);
      const backendMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "Failed to save property";
      toast.error(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!canManage) {
    return null;
  }

  const contactOptions = isSuperAdmin
    ? adminUsers
    : adminUsers.filter((adminUser) => adminUser._id === user?._id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? "Edit Property" : "Create Property"}
            </h1>
            <p className="mt-2 text-gray-600">
              Assign the property, choose the public contact admin, and set map
              coordinates for the listing.
            </p>
          </div>

          <Button variant="outline" asChild>
            <Link to="/admin/properties">Back to Management</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isEditMode ? "Update Listing" : "New Listing"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pageLoading ? (
              <div className="text-sm text-gray-500">Loading editor...</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => updateField("title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={form.location}
                      onChange={(e) => updateField("location", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={5}
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={form.price}
                      onChange={(e) => updateField("price", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalPackagePrice">Package Price</Label>
                    <Input
                      id="totalPackagePrice"
                      type="number"
                      value={form.totalPackagePrice}
                      onChange={(e) =>
                        updateField("totalPackagePrice", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Property Type</Label>
                    <select
                      id="type"
                      value={form.type}
                      onChange={(e) =>
                        updateField(
                          "type",
                          e.target.value as PropertyFormState["type"],
                        )
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                      {propertyTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="listingType">Listing Type</Label>
                    <select
                      id="listingType"
                      value={form.listingType}
                      onChange={(e) =>
                        updateField(
                          "listingType",
                          e.target.value as PropertyFormState["listingType"],
                        )
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                      <option value="rent">Rent</option>
                      <option value="short-let">Short Let</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={form.bedrooms}
                      onChange={(e) => updateField("bedrooms", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={form.bathrooms}
                      onChange={(e) => updateField("bathrooms", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Area</Label>
                    <Input
                      id="area"
                      type="number"
                      value={form.area}
                      onChange={(e) => updateField("area", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="availableFrom">Available From</Label>
                    <Input
                      id="availableFrom"
                      type="date"
                      value={form.availableFrom}
                      onChange={(e) =>
                        updateField("availableFrom", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumStay">Minimum Stay</Label>
                    <Input
                      id="minimumStay"
                      type="number"
                      min="0"
                      value={form.minimumStay}
                      onChange={(e) =>
                        updateField("minimumStay", e.target.value)
                      }
                      placeholder="Months or nights, depending on listing type"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Amenities</Label>

                  {/* Chips */}
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((item) => (
                      <Badge
                        key={item}
                        variant="secondary"
                        className="flex items-center gap-1">
                        {item}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeAmenity(item)}
                        />
                      </Badge>
                    ))}
                  </div>

                  {/* Input + Add */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add amenity..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addAmenity()}
                    />
                    <Button type="button" onClick={addAmenity}>
                      +
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ownerId">Assign to User</Label>
                    <select
                      id="ownerId"
                      value={form.ownerId}
                      onChange={(e) => updateField("ownerId", e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                      <option value="">Select a user</option>
                      {manageableUsers.map((manageableUser) => (
                        <option
                          key={manageableUser._id}
                          value={manageableUser._id}>
                          {manageableUser.name} ({manageableUser.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactUserId">Public Contact Admin</Label>
                    <select
                      id="contactUserId"
                      value={form.contactUserId}
                      onChange={(e) =>
                        updateField("contactUserId", e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      disabled={!isSuperAdmin}>
                      <option value="">Select contact admin</option>
                      {contactOptions.map((adminUser) => (
                        <option key={adminUser._id} value={adminUser._id}>
                          {adminUser.name} ({adminUser.email})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">
                      End users will see this admin's name, email, phone, and
                      avatar.
                    </p>
                  </div>
                </div>

                {/*
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={form.latitude}
                      onChange={(e) => updateField("latitude", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={(e) => updateField("longitude", e.target.value)}
                    />
                  </div>
                </div>
                */}

                {/* Images upload section */}
                <div className="space-y-3">
                  <Label>
                    Images{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      (min {MIN_IMAGES}, max {MAX_IMAGES})
                    </span>
                  </Label>

                  {/* Drop zone */}
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-300 transition-colors bg-gray-50"
                    onClick={() =>
                      document.getElementById("imageInput")?.click()
                    }
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      addFiles(e.dataTransfer.files);
                    }}>
                    <ImagePlus
                      className="mx-auto mb-2 text-gray-400"
                      size={32}
                    />
                    <p className="text-sm text-gray-500">
                      Click to browse or drag images here
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPEG, PNG, WEBP
                    </p>
                    <input
                      id="imageInput"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => addFiles(e.target.files)}
                    />
                  </div>

                  {/* Preview grid */}
                  {files.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {files.map((file, i) => (
                        <div
                          key={i}
                          className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors">
                            <X size={10} color="white" />
                          </button>
                          <div className="absolute bottom-0 inset-x-0 bg-black/40 px-1 py-0.5">
                            <p className="text-white text-[10px] truncate">
                              {file.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Counter + status */}
                  {files.length > 0 && (
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        <strong className="text-gray-700">
                          {files.length}
                        </strong>{" "}
                        of {MAX_IMAGES} selected
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-medium ${
                          files.length < MIN_IMAGES
                            ? "bg-amber-100 text-amber-800"
                            : "bg-green-100 text-green-800"
                        }`}>
                        {files.length < MIN_IMAGES
                          ? `need ${MIN_IMAGES - files.length} more`
                          : "ready to submit"}
                      </span>
                      {files.length < MAX_IMAGES && (
                        <button
                          type="button"
                          className="text-blue-500 underline underline-offset-2"
                          onClick={() =>
                            document.getElementById("imageInput")?.click()
                          }>
                          + add more
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading
                      ? "Saving..."
                      : isEditMode
                        ? "Update Property"
                        : "Create Property"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyEditorPage;
