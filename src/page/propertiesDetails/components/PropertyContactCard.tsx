import React from "react";
import { MessageCircle, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingContact } from "../types";

interface PropertyContactCardProps {
  contact: ListingContact | null;
  onCall: () => void;
  onChat: () => void;
  onOpen: () => void;
}

const PropertyContactCard: React.FC<PropertyContactCardProps> = ({
  contact,
  onCall,
  onChat,
  onOpen,
}) => {
  const contactImage =
    contact?.photo || contact?.avatar || contact?.idPhoto ||
    (contact as any)?.userId?.avatar ||
    (contact as any)?.userId?.avatarUrl ||
    (contact as any)?.userId?.photo ||
    "/icon.png";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Owner</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6 cursor-pointer" onClick={onOpen}>
          <div className="relative">
            {contactImage ? (
              <img
                src={contactImage}
                alt={contact?.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-green-500"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-green-300">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
            {contact?.verificationStatus === "verified" && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                <Badge
                  variant="default"
                  className="h-4 w-4 p-0 rounded-full bg-green-500 border-2 border-white"
                />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-xl hover:underline decoration-green-500 underline-offset-4">
              {contact?.name || "Listing Contact"}
            </h3>
            <p className="text-base text-gray-500">View Contact</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
            onClick={onChat}>
            <MessageCircle className="mr-2 h-5 w-5" /> Chat on WhatsApp
          </Button>
          <Button
            variant="outline"
            className="w-full border-green-600 text-green-600 hover:bg-green-50 text-lg py-3"
            onClick={onCall}
            disabled={!contact?.phone}>
            <Phone className="mr-2 h-5 w-5" /> Call Owner
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyContactCard;
