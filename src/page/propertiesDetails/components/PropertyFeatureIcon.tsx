import React from "react";
import { Car, ShowerHead, Wifi } from "lucide-react";

interface PropertyFeatureIconProps {
  feature: string;
}

const PropertyFeatureIcon: React.FC<PropertyFeatureIconProps> = ({ feature }) => {
  if (feature === "wifi") {
    return <Wifi className="h-4 w-4 text-blue-500" />;
  }

  if (feature.includes("pool")) {
    return <ShowerHead className="h-4 w-4 text-cyan-500" />;
  }

  if (feature === "parking") {
    return <Car className="h-4 w-4 text-green-500" />;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-green-500">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
};

export default PropertyFeatureIcon;
