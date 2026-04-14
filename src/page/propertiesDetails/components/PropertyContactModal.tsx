import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListingContact } from "../types";

interface PropertyContactModalProps {
  contact: ListingContact | null;
  isOpen: boolean;
  onCall: () => void;
  onChat: () => void;
  onClose: () => void;
}

const PropertyContactModal: React.FC<PropertyContactModalProps> = ({
  contact,
  isOpen,
  onCall,
  onChat,
  onClose,
}) => {
  if (!isOpen || !contact) {
    return null;
  }

  const contactImage =
    contact.photo || contact.avatar || contact.idPhoto ||
    (contact as any)?.userId?.avatar ||
    (contact as any)?.userId?.avatarUrl ||
    (contact as any)?.userId?.photo ||
    "/icon.png";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}>
      <div
        className="bg-white rounded-xl max-w-sm w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          x
        </button>

        <div className="text-center">
          <img
            src={contactImage}
            alt={contact.name}
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-green-100"
          />
          <h3 className="text-2xl font-bold mb-1">{contact.name}</h3>
          {contact.verificationStatus === "verified" && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 mb-4 text-base">
              Verified Contact
            </Badge>
          )}

          <div className="space-y-3 text-left bg-gray-50 p-4 rounded-lg text-base mb-6">
            <div className="flex justify-between">
              <span className="text-gray-500">State</span>
              <span className="font-medium capitalize">{contact.state || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">City</span>
              <span className="font-medium capitalize">{contact.city || "N/A"}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={onChat} className="bg-green-600 hover:bg-green-700 text-lg py-3">
              WhatsApp
            </Button>
            <Button onClick={onCall} variant="outline" className="text-lg py-3">
              Call
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyContactModal;
