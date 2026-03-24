export interface ListingContact {
  _id?: string;
  agentId?: string;
  name?: string;
  photo?: string;
  phone?: string;
  whatsapp?: string;
  whatsappNumber?: string;
  verificationStatus?: "pending" | "verified" | "rejected";
  state?: string;
  city?: string;
}
