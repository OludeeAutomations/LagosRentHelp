import React, { useState } from "react";
import {
  Upload,
  User,
  Shield,
  MapPin,
  AlertCircle,
  Phone,
  Home,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
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
import Dojah from "react-dojah";

// ✅ Validation schema
const onboardingSchema = z.object({
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(500, "Bio must be less than 500 characters"),
  address: z.string().min(5, "Address is required"),
  whatsappNumber: z.string().min(5, "WhatsApp number is required"),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

const AgentOnboarding: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idPhotoFile, setIdPhotoFile] = useState<File | null>(null);
  const [idPhotoPreview, setIdPhotoPreview] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [showDojah, setShowDojah] = useState(false);

  const { user, submitAgentApplication } = useAuthStore();
  const navigate = useNavigate();

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      bio: "",
      address: "",
      whatsappNumber: "",
    },
  });

  // ✅ Handle photo upload
  const handleIdPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdPhotoFile(file);
      setIdPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removeIdPhoto = () => {
    if (idPhotoPreview) URL.revokeObjectURL(idPhotoPreview);
    setIdPhotoFile(null);
    setIdPhotoPreview(null);
  };

  // ✅ Submit agent application
  const onSubmit = async (data: OnboardingForm) => {
    if (!user || !idPhotoFile) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("bio", data.bio);
      formData.append("address", data.address);
      formData.append("whatsappNumber", data.whatsappNumber);
      formData.append("idPhoto", idPhotoFile);
      if (referralCode) formData.append("referralCode", referralCode);

      await submitAgentApplication(formData);

      toast.success("Application submitted successfully!");
      setShowDojah(true); // move to KYC step
    } catch (error) {
      console.log(error)
      setShowDojah(false); // move to KYC step
      toast.error("Failed to submit application. Please try again.");
      console.error("Agent onboarding error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Handle Dojah response
  const handleDojahResponse = (eventType: string, data: any) => {
    console.log("Dojah Event:", eventType, data);
    if (eventType === "success") {
      toast.success("KYC verification successful!");
      navigate("/agent-dashboard");
    } else if (eventType === "error") {
      toast.error("KYC verification failed. Please try again.");
      // navigate("/agent-dashboard");
    }
  };

  // ✅ Ensure user is logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Please log in to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/login">Go to Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Show Dojah verification widget
  if (showDojah) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Dojah
          appID="68ddab0f220df2d4a1d57513"
          publicKey="test_pk_JQt9lFi6J2GOFs67BqXS5jsck"
          type="custom"
          config={{
            widget_id: "68e7b2ca31d31df5c7409af5", // replace with your Dojah EasyOnboard widget ID
          }}
          metadata={{
            user_id: user.id,
          }}
          response={handleDojahResponse}
        />
      </div>
    );
  }

  // ✅ Main onboarding form
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">
              Become a Verified Agent
            </span>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertTitle>Verification Process</AlertTitle>
          <AlertDescription>
            Your verification photo will be reviewed within 24–48 hours. Once
            approved, you'll receive 2 free listings to start with.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Complete Your Agent Profile</CardTitle>
            <CardDescription>
              Provide the following information to become a verified agent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Bio */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Bio *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Textarea
                            placeholder="Tell us about your experience as an agent..."
                            className="pl-10 min-h-[120px]"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Office Address *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="Enter your office address"
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

                {/* WhatsApp */}
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Business Number *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="+234 123 456 7890"
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

                <ReferralCodeInput
                  onReferralValidated={(name, code) => setReferralCode(code)}
                  onReferralRemoved={() => setReferralCode("")}
                />

                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="idPhoto">Recent Photo of Yourself *</Label>
                  <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      id="idPhoto"
                      className="hidden"
                      onChange={handleIdPhotoChange}
                      disabled={isSubmitting}
                    />
                    <label htmlFor="idPhoto" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-foreground font-medium mb-2">
                        Upload Your Photo
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Clear, recent photo for your agent profile
                      </p>
                      {idPhotoPreview && (
                        <div className="mt-4 relative">
                          <img
                            src={idPhotoPreview}
                            alt="Preview"
                            className="max-h-32 mx-auto rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                            onClick={removeIdPhoto}
                            disabled={isSubmitting}
                          >
                            <AlertCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </label>
                  </div>
                  {!idPhotoFile && (
                    <p className="text-sm text-destructive">
                      ID photo is required
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !idPhotoFile}
                >
                  {isSubmitting
                    ? "Submitting for Verification..."
                    : "Submit for Verification"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentOnboarding;
