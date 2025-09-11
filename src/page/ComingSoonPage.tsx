// src/pages/ComingSoonPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ComingSoonPage: React.FC = () => {
  const navigate = useNavigate();

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
          <Button
            onClick={() => navigate(-1)}
            className="bg-green-600 hover:bg-green-700 text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoonPage;
