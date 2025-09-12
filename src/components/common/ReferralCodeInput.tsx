// src/components/ReferralCodeInput.tsx
import React, { useState, useEffect } from "react";
import { Search, User, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgentStore } from "@/stores/agentStore";
import { toast } from "sonner";
import { Label } from "../ui/label";

interface ReferralCodeInputProps {
  onReferralValidated?: (agentName: string, code: string) => void;
  onReferralRemoved?: () => void;
}

const ReferralCodeInput: React.FC<ReferralCodeInputProps> = ({
  onReferralValidated,
  onReferralRemoved,
}) => {
  const [referralCode, setReferralCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [showResults, setShowResults] = useState(false);

  const { validateReferralCode } = useAgentStore();

  // Debounce validation
  useEffect(() => {
    if (referralCode.length === 11) {
      const timer = setTimeout(() => {
        validateCode(referralCode);
      }, 500);

      return () => clearTimeout(timer);
    } else if (referralCode.length === 0) {
      setIsValid(false);
      setAgentName("");
      setShowResults(false);
      onReferralRemoved?.();
    }
  }, [referralCode]);

  const validateCode = async (code: string) => {
    if (code.length !== 11) return;

    setIsValidating(true);
    setShowResults(true);

    try {
      const response = await validateReferralCode(code);

      if (response.success) {
        setIsValid(true);
        setAgentName(response.data.agentName);
        onReferralValidated?.(response.data.agentName, code);
        toast.success("Referral code validated successfully!");
      } else {
        setIsValid(false);
        setAgentName("");
        toast.error("Invalid referral code");
      }
    } catch (error) {
      setIsValid(false);
      setAgentName("");
      toast.error("Error validating referral code");
    } finally {
      setIsValidating(false);
    }
  };

  const clearReferral = () => {
    setReferralCode("");
    setIsValid(false);
    setAgentName("");
    setShowResults(false);
    onReferralRemoved?.();
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="referral-code">Referral Code (Optional)</Label>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          id="referral-code"
          placeholder="Enter  referral code"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
          maxLength={11}
          className="pl-10 pr-10"
          disabled={isValid}
        />
        {referralCode && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-3 top-2 h-6 w-6 p-0"
            onClick={clearReferral}>
            <XCircle className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showResults && (
        <Card
          className={`border ${
            isValid ? "border-green-200" : "border-red-200"
          }`}>
          <CardContent className="p-3">
            {isValidating ? (
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : isValid ? (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">
                  Referred by: <strong>{agentName}</strong>
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">Invalid referral code</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReferralCodeInput;
