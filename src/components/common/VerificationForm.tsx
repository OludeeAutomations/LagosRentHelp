import React, { useState } from "react";
import {
  Camera,
  Upload,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useVerificationStore } from "@/stores/verificationStore";
import type { VerificationData } from "@/services/verificationService";

interface VerificationFormProps {
  onVerificationComplete?: () => void;
}

const VerificationForm: React.FC<VerificationFormProps> = ({
  onVerificationComplete,
}) => {
  const { submitVerification, loading, error } = useVerificationStore();

  const [idType, setIdType] = useState<string>("");
  const [idNumber, setIdNumber] = useState<string>("");
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [useCamera, setUseCamera] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // ID type configurations
  const idTypes = [
    {
      value: "nin",
      label: "National Identification Number (NIN)",
      placeholder: "Enter your 11-digit NIN",
    },
    {
      value: "bvn",
      label: "Bank Verification Number (BVN)",
      placeholder: "Enter your 11-digit BVN",
    },
    {
      value: "voters",
      label: "Voter's Card",
      placeholder: "Enter your Voter's ID number",
    },
    {
      value: "drivers_license",
      label: "Driver's License",
      placeholder: "Enter your Driver's License number",
    },
  ];

  // Camera functions (same as before)
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setCameraStream(stream);
      setUseCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Cannot access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setUseCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext("2d");

      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "selfie.jpg", {
                type: "image/jpeg",
              });
              setSelfieFile(file);

              const reader = new FileReader();
              reader.onload = (e) => {
                setSelfiePreview(e.target?.result as string);
              };
              reader.readAsDataURL(file);

              stopCamera();
              toast.success("Selfie captured successfully!");
            }
          },
          "image/jpeg",
          0.8
        );
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setSelfieFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelfiePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelfie = () => {
    setSelfiePreview(null);
    setSelfieFile(null);
  };

  // Handle form submission using the store
  const handleSubmit = async () => {
    // Validation (same as before)
    if (!idType) {
      toast.error("Please select an ID type");
      return;
    }

    if (!idNumber) {
      toast.error("Please enter your ID number");
      return;
    }

    if ((idType === "nin" || idType === "bvn") && !/^\d{11}$/.test(idNumber)) {
      toast.error("Please enter a valid 11-digit number");
      return;
    }

    if (!selfieFile) {
      toast.error("Please upload or capture a selfie");
      return;
    }

    if (idType === "drivers_license" && !dateOfBirth) {
      toast.error("Please enter your date of birth");
      return;
    }

    const verificationData: VerificationData = {
      idType: idType as any,
      idNumber,
      selfieImage: selfieFile,
      ...(idType === "drivers_license" && { dateOfBirth }),
    };

    try {
      await submitVerification(verificationData);
      toast.success("Verification submitted successfully!");

      // Reset form
      setIdType("");
      setIdNumber("");
      setDateOfBirth("");
      setSelfiePreview(null);
      setSelfieFile(null);

      // Call completion callback if provided
      if (onVerificationComplete) {
        onVerificationComplete();
      }
    } catch (error) {
      // Error is handled by the store and will be displayed
      console.error("Verification submission error:", error);
    }
  };

  const handleIdTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newIdType = e.target.value;
    setIdType(newIdType);
    setIdNumber("");
    setDateOfBirth("");
  };

  return (
    <div className="space-y-6">
      <Separator />

      {/* Display error from store */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Rest of the component remains the same */}
      <div className="space-y-3">
        <Label htmlFor="idType" className="text-base font-semibold">
          Select Identification Type *
        </Label>
        <select
          id="idType"
          value={idType}
          onChange={handleIdTypeChange}
          className="w-full p-3 border border-muted-foreground/25 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Choose your ID type</option>
          {idTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-muted-foreground">
          Select the type of government-issued ID you want to use for
          verification
        </p>
      </div>
      {/* Show inputs only when ID type is selected */}
      {idType && (
        <div className="space-y-4">
          {/* ID Number Input */}
          <div className="space-y-3">
            <Label htmlFor="idNumber" className="text-base font-semibold">
              {idTypes.find((t) => t.value === idType)?.label} Number *
            </Label>
            <Input
              id="idNumber"
              type="text"
              placeholder={idTypes.find((t) => t.value === idType)?.placeholder}
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Enter the number exactly as it appears on your document
            </p>
          </div>

          {/* Date of Birth for Driver's License */}
          {idType === "drivers_license" && (
            <div className="space-y-3">
              <Label htmlFor="dateOfBirth" className="text-base font-semibold">
                Date of Birth *
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Enter your date of birth as it appears on your driver's license
              </p>
            </div>
          )}

          {/* Selfie Capture/Upload Section */}
          {/* Selfie Capture/Upload Section */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">
                Identity Verification Selfie *
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Take a clear selfie or upload a photo for identity verification.
                Ensure good lighting and face the camera directly.
              </p>

              {useCamera ? (
                // Camera View
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center space-y-4 bg-blue-50">
                  <div className="relative mx-auto max-w-md">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full rounded-lg border-2 border-blue-300 bg-black"
                      style={{ maxHeight: "400px" }}
                    />
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      ● Live
                    </div>
                  </div>

                  {videoRef.current?.videoWidth === 0 && (
                    <div className="text-orange-600 text-sm">
                      Camera initializing... Please wait
                    </div>
                  )}

                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button
                      onClick={capturePhoto}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={
                        !videoRef.current || videoRef.current.videoWidth === 0
                      }>
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Photo
                    </Button>
                    <Button variant="outline" onClick={stopCamera}>
                      Cancel Camera
                    </Button>
                  </div>

                  <p className="text-sm text-blue-600">
                    Position your face in the frame and click "Capture Photo"
                    when ready
                  </p>
                </div>
              ) : selfiePreview ? (
                // Selfie Preview
                <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center space-y-3 bg-green-50">
                  <div className="relative inline-block">
                    <img
                      src={selfiePreview}
                      alt="Selfie Preview"
                      className="max-h-64 mx-auto rounded-lg object-cover border-4 border-green-300 shadow-lg"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ Ready
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button variant="outline" size="sm" onClick={removeSelfie}>
                      Remove Photo
                    </Button>
                    <Button variant="outline" size="sm" onClick={startCamera}>
                      <Camera className="h-4 w-4 mr-2" />
                      Take New Photo
                    </Button>
                  </div>
                  <p className="text-sm text-green-600 font-medium">
                    Selfie ready for verification ✓
                  </p>
                </div>
              ) : (
                // Upload Options
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center bg-muted/20">
                  <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Take a selfie with your camera or upload an existing photo
                  </p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <Button
                      onClick={startCamera}
                      className="bg-blue-600 hover:bg-blue-700"
                      size="lg">
                      <Camera className="h-5 w-5 mr-2" />
                      Take Selfie with Camera
                    </Button>
                    <Button variant="outline" asChild size="lg">
                      <Label htmlFor="selfie-upload" className="cursor-pointer">
                        <Upload className="h-5 w-5 mr-2" />
                        Upload Photo
                      </Label>
                    </Button>
                  </div>
                  <input
                    id="selfie-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    capture="user" // Hint for mobile devices to use front camera
                  />
                  <p className="text-xs text-muted-foreground mt-3">
                    Supported formats: JPG, PNG • Max size: 5MB
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* Verification Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-blue-900">
              Verification Requirements:
            </h4>
            <ul className="text-sm space-y-1 text-blue-700">
              <li>• Select your ID type from the dropdown</li>
              <li>
                • Enter your ID number exactly as it appears on your document
              </li>
              {idType === "drivers_license" && (
                <li>
                  • Enter your date of birth as shown on your driver's license
                </li>
              )}
              <li>• Take a clear selfie or upload a recent photo</li>
              <li>• Ensure your face is clearly visible and well-lit</li>
              <li>• Selfie photo must be less than 5MB</li>
              <li>• Accepted formats: JPG, PNG</li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading || !selfieFile}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg">
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Submitting Verification...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit for Verification
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VerificationForm;
