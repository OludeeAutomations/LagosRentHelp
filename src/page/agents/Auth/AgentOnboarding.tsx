import React, { useState } from "react";
import {
  Upload,
  User,
  Shield,
  MapPin,
  AlertCircle,
  Phone,
  Home,
  Camera,
  Info,
  CheckCircle,
  Building,
  BadgeCheck,
  Mail,
  Calendar,
  School,
  MessageCircle,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useAgentStore } from "@/stores/agentStore";
import { useNavigate } from "react-router-dom";
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
import ReferralCodeInput from "@/components/common/ReferralCodeInput";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import VerificationForm from "@/components/common/VerificationForm";

// ✅ Enhanced Validation Schema
const onboardingSchema = z.object({
  // Personal Information
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select your gender",
  }),
  dateOfBirth: z.string().min(1, "Date of birth is required"),

  // Address & Location
  residentialAddress: z
    .string()
    .min(10, "Please provide your complete residential address"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  institutionName: z.string().optional(),
  campusCode: z.string().optional(),

  // Professional Information
  bio: z
    .string()
    .min(50, "Bio should be at least 50 characters")
    .max(500, "Bio must be less than 500 characters"),
  experience: z.string().optional(),
  motivation: z.string().min(10, "Please share your motivation"),
  hearAboutUs: z.string().min(1, "Please select how you heard about us"),
  preferredCommunication: z.enum(["whatsapp", "email", "phone"], {
    required_error: "Please select preferred communication method",
  }),
  socialMedia: z.string().optional(),
  referredBy: z.string().optional(), // ✅ Change to referredBy

  // Contact
  whatsappNumber: z.string().min(10, "WhatsApp number is required"),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

const NIGERIAN_STATES = [
  "Lagos",
  "Abuja",
  "Rivers",
  "Delta",
  "Oyo",
  "Kano",
  "Kaduna",
  "Edo",
  "Ogun",
  "Enugu",
  "Anambra",
  "Akwa Ibom",
  "Cross River",
  "Imo",
  "Bauchi",
  "Plateau",
  "Sokoto",
  "Bayelsa",
  "Katsina",
  "Benue",
  "Borno",
  "Adamawa",
  "Taraba",
  "Niger",
  "Kebbi",
  "Kogi",
  "Zamfara",
  "Yobe",
  "Gombe",
  "Nasarawa",
  "Jigawa",
  "Ekiti",
  "Osun",
  "Ondo",
  "Kwara",
  "Ebonyi",
  "Abia",
];

const HEAR_ABOUT_US_OPTIONS = [
  "Social Media",
  "Friend Referral",
  "Online Advertisement",
  "Search Engine",
  "Email Marketing",
  "Other",
];

const BENEFITS = [
  {
    icon: <BadgeCheck className="h-5 w-5" />,
    title: "Verified Badge",
    description: "Get a trusted verification badge on your profile",
  },
  {
    icon: <Building className="h-5 w-5" />,
    title: "Property Listings",
    description: "List and manage rental properties",
  },
  {
    icon: <User className="h-5 w-5" />,
    title: "Client Connections",
    description: "Connect directly with potential tenants",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Trust & Credibility",
    description: "Build trust with verified credentials",
  },
];

const AgentOnboarding: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idPhotoFile, setIdPhotoFile] = useState<File | null>(null);
  const [idPhotoPreview, setIdPhotoPreview] = useState<string | null>(null);
  const [proofOfAddressFile, setProofOfAddressFile] = useState<File | null>(
    null
  );
  const [proofOfAddressPreview, setProofOfAddressPreview] = useState<
    string | null
  >(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const { user, agent } = useAuthStore();
  const { fetchAgentProfile } = useAgentStore();
  const navigate = useNavigate();

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      phone: user?.phone,
      gender: undefined,
      dateOfBirth: "",
      residentialAddress: "",
      state: "",
      city: "",
      institutionName: "",
      campusCode: "",
      bio: "",
      experience: "",
      motivation: "",
      hearAboutUs: "",
      preferredCommunication: "whatsapp",
      socialMedia: "",
      whatsappNumber: "",
      referredBy: "", // ✅ Change to referredBy
    },
  });

  // Handle file uploads
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void,
    maxSize: number = 5 * 1024 * 1024
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];

      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a JPEG, PNG, or PDF file");
        return;
      }

      if (file.size > maxSize) {
        toast.error(`File size must be less than ${maxSize / 1024 / 1024}MB`);
        return;
      }

      setFile(file);
      if (file.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
      } else {
        setPreview(null);
      }
    }
  };

  const handleVerificationComplete = async () => {
    try {
      await fetchAgentProfile();
      // Navigate to dashboard after successful verification
      toast.success("Verification completed successfully!");
      setTimeout(() => {
        navigate("/agent-dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error fetching agent profile after verification:", error);
      toast.error(
        "Verification completed but there was an error loading your profile."
      );
    }
  };

  const removeFile = (
    setFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void,
    preview: string | null
  ) => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
  };

  const submitApplication = async (data: OnboardingForm) => {
    if (!user || !idPhotoFile || !proofOfAddressFile) {
      toast.error("Please upload your professional photo and proof of address");
      return false;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Append all form data
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value.toString());
      });

      formData.append("idPhoto", idPhotoFile);
      formData.append("proofOfAddress", proofOfAddressFile);

      await useAgentStore.getState().submitAgentApplication(formData);
      await useAgentStore.getState().fetchAgentProfile();

      setApplicationSubmitted(true);
      toast.success(
        "Welcome to LagosRentHelp! Your application has been submitted successfully."
      );
      return true;
    } catch (error: any) {
      console.error("Agent onboarding error:", error);
      const errorMessage =
        error?.message || "Failed to submit application. Please try again.";
      toast.error(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep3Submit = async (data: OnboardingForm) => {
    const success = await submitApplication(data);
    if (success) {
      setCurrentStep(4); // Move to verification step
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="As it appears on official ID"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="email" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="+234 812 345 6789"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="date" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Professional Photo Upload */}
            <div className="space-y-3">
              <Label htmlFor="idPhoto" className="flex items-center gap-2">
                Professional Photo *
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear, professional headshot for your agent profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>

              <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 text-center">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  id="idPhoto"
                  className="hidden"
                  onChange={(e) =>
                    handleFileUpload(e, setIdPhotoFile, setIdPhotoPreview)
                  }
                />
                <label htmlFor="idPhoto" className="cursor-pointer block">
                  {!idPhotoPreview ? (
                    <>
                      <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-foreground font-semibold mb-2">
                        Upload Professional Photo
                      </p>
                      <Button type="button" variant="outline" size="sm">
                        Choose File
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={idPhotoPreview}
                          alt="Preview"
                          className="w-32 h-32 rounded-lg object-cover shadow-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                          onClick={() =>
                            removeFile(
                              setIdPhotoFile,
                              setIdPhotoPreview,
                              idPhotoPreview
                            )
                          }>
                          <AlertCircle className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-green-600 font-medium">
                        ✓ Photo uploaded successfully
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">
              Address & Location Details
            </h3>

            <FormField
              control={form.control}
              name="residentialAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Residential Address *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Complete residential address"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NIGERIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state.toLowerCase()}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City / LGA *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your city or local government"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="institutionName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company/Organization Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="organization, company, etc."
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="campusCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company/Organization Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Company acronym or code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Proof of Address Upload */}
            <div className="space-y-3">
              <Label
                htmlFor="proofOfAddress"
                className="flex items-center gap-2">
                Proof of Address *
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Utility bill, tenancy agreement, or any official
                        document showing your address
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>

              <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 text-center">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  id="proofOfAddress"
                  className="hidden"
                  onChange={(e) =>
                    handleFileUpload(
                      e,
                      setProofOfAddressFile,
                      setProofOfAddressPreview,
                      10 * 1024 * 1024
                    )
                  }
                />
                <label
                  htmlFor="proofOfAddress"
                  className="cursor-pointer block">
                  {!proofOfAddressPreview ? (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-foreground font-semibold mb-2">
                        Upload Proof of Address
                      </p>
                      <p className="text-muted-foreground text-sm mb-2">
                        Utility bill, tenancy receipt, etc. (PDF, JPG, PNG)
                      </p>
                      <Button type="button" variant="outline" size="sm">
                        Choose File
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      {proofOfAddressPreview ? (
                        <div className="relative inline-block">
                          <img
                            src={proofOfAddressPreview}
                            alt="Preview"
                            className="w-32 h-32 rounded-lg object-cover shadow-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                            onClick={() =>
                              removeFile(
                                setProofOfAddressFile,
                                setProofOfAddressPreview,
                                proofOfAddressPreview
                              )
                            }>
                            <AlertCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-green-100 p-3 rounded-lg">
                          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="text-green-700 font-medium">
                            Document uploaded successfully
                          </p>
                        </div>
                      )}
                      <p className="text-sm text-green-600 font-medium">
                        ✓ Document uploaded successfully
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">
              Professional & Verification Details
            </h3>
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Introduction *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience, specialties, and what makes you a great agent..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Previous Experience (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any previous experience in real estate or related fields..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="motivation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why do you want to become an agent? *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your motivation for joining LagosRentHelp..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hearAboutUs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How did you hear about us? *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HEAR_ABOUT_US_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option.toLowerCase()}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredCommunication"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Communication *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="socialMedia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social Media Handles (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="LinkedIn, Twitter, Instagram, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Business Number *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="+234 812 345 6789"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ReferralCodeInput
              onReferralValidated={(name, code) => {
                form.setValue("referredBy", code); // ✅ Update referredBy field
              }}
              onReferralRemoved={() => {
                form.setValue("referredBy", ""); // ✅ Clear referredBy field
              }}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Identity Verification</h3>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">
                Verification Required
              </AlertTitle>
              <AlertDescription className="text-blue-700 text-sm">
                Complete your identity verification to access all agent
                features. This helps us ensure the safety and trust of our
                community.
              </AlertDescription>
            </Alert>

            {agent?.verificationStatus !== "verified" ? (
              <VerificationForm
                onVerificationComplete={handleVerificationComplete}
              />
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-600 mb-2">
                  Verification Complete!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your identity has been successfully verified. You can now
                  access all agent features.
                </p>
                <Button onClick={() => navigate("/agent-dashboard")}>
                  Go to Dashboard
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Navigation buttons
  const renderNavigationButtons = () => {
    if (currentStep === 4) {
      // Step 4 has its own navigation within VerificationForm
      return null;
    }

    return (
      <div className="flex justify-between pt-6 border-t">
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={isSubmitting}>
            Previous
          </Button>
        ) : (
          <div></div>
        )}

        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={isSubmitting}>
            Next Step
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => form.handleSubmit(handleStep3Submit)()}
            disabled={isSubmitting || !idPhotoFile || !proofOfAddressFile}
            className="min-w-[200px]">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting Application...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        )}
      </div>
    );
  };

  // Update progress steps to include step 4
  const totalSteps = 4;
  const progressSteps = [1, 2, 3, 4];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Access Required</CardTitle>
            <CardDescription className="text-lg">
              Please log in to start your agent application
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button asChild size="lg">
              <a href="/login">Sign In to Continue</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/">Back to Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <Home className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Join as Real Estate Agent
                </h1>
                <p className="text-gray-600">
                  {applicationSubmitted
                    ? "Complete Verification"
                    : `Complete your profile in ${
                        totalSteps - currentStep
                      } step${totalSteps - currentStep !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center max-w-2xl mx-auto mt-6">
            {progressSteps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step
                      ? "bg-primary border-primary text-white"
                      : "border-gray-300 bg-white text-gray-400"
                  }`}>
                  {currentStep > step ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </div>
                {index < progressSteps.length - 1 && (
                  <div
                    className={`w-16 h-1 ${
                      currentStep > step ? "bg-primary" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Benefits Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BadgeCheck className="h-6 w-6 text-green-600" />
                  Agent Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {BENEFITS.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{benefit.title}</p>
                      <p className="text-xs text-gray-600">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}

                <Alert className="mt-6 bg-amber-50 border-amber-200">
                  <Info className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">
                    Verification
                  </AlertTitle>
                  <AlertDescription className="text-amber-700 text-sm">
                    {applicationSubmitted
                      ? "Complete identity verification to access all agent features."
                      : "Your application will be reviewed within 24-48 hours. You'll receive email updates about your status."}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg p-0">
              <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-t-lg py-5">
                <CardTitle className="text-2xl">
                  {currentStep === 1 && "Personal Information"}
                  {currentStep === 2 && "Address & Location"}
                  {currentStep === 3 && "Professional Details"}
                  {currentStep === 4 && "Identity Verification"}
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Step {currentStep} of {totalSteps}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleStep3Submit)}>
                    {renderStepContent()}
                    {renderNavigationButtons()}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentOnboarding;
