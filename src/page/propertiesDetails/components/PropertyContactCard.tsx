import React from "react";
import { LockKeyhole, MessageCircle, Phone, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingContact } from "../types";

interface PropertyContactCardProps {
  contact: ListingContact | null;
  onCall: () => void;
  onChat: () => void;
  onOpen: () => void;
  onSignIn: () => void;
  isAuthenticated: boolean;
}

const PropertyContactCard: React.FC<PropertyContactCardProps> = ({
  contact,
  onCall,
  onChat,
  onOpen,
  onSignIn,
  isAuthenticated,
}) => {
  const contactImage =
    contact?.photo || contact?.avatar || contact?.idPhoto ||
    contact?.userId?.avatar ||
    contact?.userId?.avatarUrl ||
    contact?.userId?.photo ||
    "/icon.png";
  const callableNumber = contact?.phone || contact?.whatsappNumber || contact?.whatsapp;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Owner</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`mb-6 flex items-center gap-4 ${isAuthenticated ? "cursor-pointer" : "select-none"}`}
          onClick={isAuthenticated ? onOpen : undefined}>
          <div className="relative">
            {contactImage ? (
              <img
                src={contactImage}
                alt={isAuthenticated ? contact?.name : "Locked owner details"}
                className={`h-16 w-16 rounded-full border-2 border-green-500 object-cover ${isAuthenticated ? "" : "blur-sm"}`}
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-green-300">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
            {!isAuthenticated && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/25 text-white">
                <LockKeyhole className="h-5 w-5" />
              </span>
            )}
            {isAuthenticated && contact?.verificationStatus === "verified" && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                <Badge
                  variant="default"
                  className="h-4 w-4 p-0 rounded-full bg-green-500 border-2 border-white"
                />
              </div>
            )}
          </div>
          <div>
            {isAuthenticated ? (
              <>
                <h3 className="font-semibold text-xl hover:underline decoration-green-500 underline-offset-4">
                  {contact?.name || "Listing Contact"}
                </h3>
                <p className="text-base text-gray-500">View Contact</p>
              </>
            ) : (
              <>
                <div className="h-5 w-36 rounded bg-gray-200 blur-[2px]" />
                <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                  <LockKeyhole className="h-3.5 w-3.5" /> Owner details locked
                </p>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
            onClick={onChat}
            disabled={!isAuthenticated || !callableNumber}>
            <MessageCircle className="mr-2 h-5 w-5" /> Chat on WhatsApp
          </Button>
          <Button
            variant="outline"
            className="w-full border-green-600 text-green-600 hover:bg-green-50 text-lg py-3"
            onClick={onCall}
            disabled={!isAuthenticated || !callableNumber}>
            <Phone className="mr-2 h-5 w-5" /> Call Owner
          </Button>

          {!isAuthenticated && (
            <div className="rounded-lg border border-green-100 bg-green-50 p-4 text-center">
              <p className="text-sm leading-5 text-gray-700">
                Sign in or create an account to unlock the owner and contact details.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button type="button" onClick={onSignIn} className="bg-[#129B36] hover:bg-[#0e7d2b]">
                  Sign in
                </Button>
                <Button asChild variant="outline">
                  <Link to="/register">Sign up</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyContactCard;
