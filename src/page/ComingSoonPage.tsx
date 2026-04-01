// src/pages/ComingSoonPage.tsx
import React from "react";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ComingSoonPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-gray-200">
        <CardHeader className="text-center">
          <Construction className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-gray-900">
            Coming Soon
          </CardTitle>
          <CardDescription className="text-gray-600">
            This page is under construction. We're working hard to bring you
            this feature!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            We're currently performing maintenance. Please check back later.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoonPage;
