// src/components/agent/SubscriptionStatus.tsx
import React from "react";
import { useAgentStore } from "@/stores/agentStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SubscriptionStatus: React.FC = () => {
  const { agentProfile, fetchSubscriptionStatus } = useAgentStore();

  if (!agentProfile) return null;

  const { subscription, freeListingWeeks, canListProperties } = agentProfile;

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900">Subscription Status</CardTitle>
        <CardDescription className="text-gray-600">
          Your current listing permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Status</span>
            <Badge
              className={
                canListProperties
                  ? "bg-green-100 text-green-800 border-0"
                  : "bg-red-100 text-red-800 border-0"
              }>
              {canListProperties ? "Active" : "Expired"}
            </Badge>
          </div>

          {subscription.status === "trial" && (
            <div className="flex justify-between items-center">
              <span className="font-medium">Trial Ends</span>
              <span className="text-gray-600">
                {new Date(subscription.trialEndsAt).toLocaleDateString()}
              </span>
            </div>
          )}

          {freeListingWeeks > 0 && (
            <div className="flex justify-between items-center">
              <span className="font-medium">Free Listing Weeks</span>
              <span className="text-green-600 font-bold">
                {freeListingWeeks}
              </span>
            </div>
          )}

          {!canListProperties && (
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              Subscribe Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
