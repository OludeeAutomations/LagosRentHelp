import { supabase } from "@/lib/supabase";

export type LeadChannel = "phone" | "whatsapp" | "message";
export type LeadStatus = "new" | "contacted" | "qualified" | "closed";

export interface LandlordLead {
  id: string;
  channel: LeadChannel;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    title: string;
    location: string;
    price: number;
  };
  renter: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface LandlordLeadResult {
  items: LandlordLead[];
  filteredTotal: number;
  total: number;
  newCount: number;
  contactedCount: number;
  qualifiedCount: number;
  closedCount: number;
}

export interface PropertyContact {
  id: string;
  name: string;
  phone: string;
  whatsappNumber: string;
  verificationStatus: "verified";
  state: string;
  localGovernment: string;
}

type LeadRow = {
  id: string;
  channel: LeadChannel;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
  property_id: string;
  property_title: string;
  property_location: string;
  property_price: number;
  renter_name: string;
  renter_email: string;
  renter_phone: string;
};

type LeadRpcResult = {
  items?: LeadRow[];
  filtered_total?: number;
  total?: number;
  new_count?: number;
  contacted_count?: number;
  qualified_count?: number;
  closed_count?: number;
};

const mapLead = (row: LeadRow): LandlordLead => ({
  id: row.id,
  channel: row.channel,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  property: {
    id: row.property_id,
    title: row.property_title,
    location: row.property_location,
    price: Number(row.property_price || 0),
  },
  renter: {
    name: row.renter_name || "Renter",
    email: row.renter_email || "",
    phone: row.renter_phone || "",
  },
});

export const landlordLeadService = {
  getPropertyContact: async (propertyId: string): Promise<PropertyContact> => {
    const { data, error } = await supabase.rpc("get_property_contact", {
      p_property_id: propertyId,
    });
    if (error) throw new Error(error.message);
    const contact = data as {
      id: string;
      name: string;
      phone: string;
      whatsapp_number: string;
      verification_status: "verified";
      state: string;
      local_government: string;
    };
    return {
      id: contact.id,
      name: contact.name,
      phone: contact.phone || "",
      whatsappNumber: contact.whatsapp_number || contact.phone || "",
      verificationStatus: contact.verification_status,
      state: contact.state || "Lagos",
      localGovernment: contact.local_government || "",
    };
  },

  record: async (propertyId: string, channel: LeadChannel): Promise<void> => {
    const { error } = await supabase.rpc("record_property_lead", {
      p_property_id: propertyId,
      p_channel: channel,
    });
    if (error) throw new Error(error.message);
  },

  getMine: async ({
    page = 1,
    pageSize = 25,
    status,
    search,
  }: {
    page?: number;
    pageSize?: number;
    status?: LeadStatus;
    search?: string;
  } = {}): Promise<LandlordLeadResult> => {
    const { data, error } = await supabase.rpc("get_my_property_leads", {
      p_limit: pageSize,
      p_offset: (Math.max(page, 1) - 1) * pageSize,
      p_status: status || null,
      p_search: search?.trim() || null,
    });
    if (error) {
      if (error.message.includes("get_my_property_leads")) {
        throw new Error("Run the landlord leads database migration in Supabase first.");
      }
      throw new Error(error.message);
    }

    const result = (data || {}) as LeadRpcResult;
    return {
      items: (result.items || []).map(mapLead),
      filteredTotal: Number(result.filtered_total || 0),
      total: Number(result.total || 0),
      newCount: Number(result.new_count || 0),
      contactedCount: Number(result.contacted_count || 0),
      qualifiedCount: Number(result.qualified_count || 0),
      closedCount: Number(result.closed_count || 0),
    };
  },

  updateStatus: async (leadId: string, status: LeadStatus): Promise<void> => {
    const { error } = await supabase.rpc("update_my_property_lead_status", {
      p_lead_id: leadId,
      p_status: status,
    });
    if (error) throw new Error(error.message);
  },
};
