// stores/leadStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  leadService,
  LeadFilters,
  CreateLeadData,
} from "@/services/leadService";
import { Lead } from "@/types";

interface LeadState {
  // State
  leads: Lead[];
  currentLead: Lead | null;
  loading: boolean;
  error: string | null;
  contactStatus: Record<string, boolean>; // agentId -> hasContacted

  // Actions
  createLead: (leadData: CreateLeadData) => Promise<void>;
  checkContactStatus: (agentId: string) => Promise<void>;
  fetchLeads: (filters?: LeadFilters) => Promise<void>;
  fetchLeadById: (id: string) => Promise<void>;
  fetchAgentLeads: (
    agentId: string,
    filters?: Partial<LeadFilters>
  ) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  clearError: () => void;
  clearCurrentLead: () => void;
}

export const useLeadStore = create<LeadState>()(
  persist(
    (set, get) => {
      const getErrorMessage = (error: unknown) =>
        error instanceof Error ? error.message : String(error);

      return {
        // Initial state
        leads: [],
        currentLead: null,
        loading: false,
        error: null,
        contactStatus: {},

        // Create a new lead
        createLead: async (leadData: CreateLeadData) => {
          set({ loading: true, error: null });
          try {
            const response = await leadService.createLead(leadData);

            if (response.success && response.data) {
              // Add to leads list
              set((state) => ({
                leads: [response.data!, ...state.leads],
                contactStatus: {
                  ...state.contactStatus,
                  [leadData.agentId]: true,
                },
              }));
            } else {
              throw new Error(response.error || "Failed to create lead");
            }
          } catch (error: unknown) {
            const msg = getErrorMessage(error);
            set({ error: msg });
            throw error;
          } finally {
            set({ loading: false });
          }
        },

        // Check if user has contacted an agent
        checkContactStatus: async (agentId: string) => {
          try {
            const response = await leadService.hasUserContactedAgent(agentId);

            if (response.success) {
              set((state) => ({
                contactStatus: {
                  ...state.contactStatus,
                  [agentId]: response.data.hasContacted,
                },
              }));
            }
          } catch (error: unknown) {
            console.error("Error checking contact status:", error);
            // Don't set error state for this as it's non-critical
          }
        },

        // Fetch leads with optional filters
        fetchLeads: async (filters: LeadFilters = {}) => {
          set({ loading: true, error: null });
          try {
            const response = await leadService.getAll(filters);

            if (response.success) {
              set({ leads: response.data || [] });
            } else {
              throw new Error(response.error || "Failed to fetch leads");
            }
          } catch (error: unknown) {
            set({ error: getErrorMessage(error) });
          } finally {
            set({ loading: false });
          }
        },

        // Fetch single lead by ID
        fetchLeadById: async (id: string) => {
          set({ loading: true, error: null });
          try {
            const response = await leadService.getById(id);

            if (response.success) {
              set({ currentLead: response.data });
            } else {
              throw new Error(response.error || "Failed to fetch lead");
            }
          } catch (error: unknown) {
            set({ error: getErrorMessage(error) });
          } finally {
            set({ loading: false });
          }
        },

        // Fetch leads for a specific agent
        fetchAgentLeads: async (
          agentId: string,
          filters: Partial<LeadFilters> = {}
        ) => {
          set({ loading: true, error: null });
          try {
            const response = await leadService.getAll({
              agentId,
              ...filters,
              limit: filters.limit || 5,
              page: filters.page || 1,
            });

            if (response.success) {
              set({ leads: response.data || [] });
            } else {
              throw new Error(response.error || "Failed to fetch agent leads");
            }
          } catch (error: unknown) {
            set({ error: getErrorMessage(error) });
          } finally {
            set({ loading: false });
          }
        },

        // Update lead
        updateLead: async (id: string, updates: Partial<Lead>) => {
          set({ loading: true, error: null });
          try {
            const response = await leadService.update(id, updates);

            if (response.success && response.data) {
              set((state) => ({
                leads: state.leads.map((lead) =>
                  lead._id === id || lead.id === id ? response.data! : lead
                ),
                currentLead:
                  state.currentLead?._id === id || state.currentLead?.id === id
                    ? response.data!
                    : state.currentLead,
              }));
            } else {
              throw new Error(response.error || "Failed to update lead");
            }
          } catch (error: unknown) {
            const msg = getErrorMessage(error);
            set({ error: msg });
            throw error;
          } finally {
            set({ loading: false });
          }
        },

        // Delete lead
        deleteLead: async (id: string) => {
          set({ loading: true, error: null });
          try {
            const response = await leadService.delete(id);

            if (response.success) {
              set((state) => ({
                leads: state.leads.filter(
                  (lead) => lead._id !== id && lead.id !== id
                ),
                currentLead:
                  state.currentLead?._id === id || state.currentLead?.id === id
                    ? null
                    : state.currentLead,
              }));
            } else {
              throw new Error(response.error || "Failed to delete lead");
            }
          } catch (error: unknown) {
            const msg = getErrorMessage(error);
            set({ error: msg });
            throw error;
          } finally {
            set({ loading: false });
          }
        },

        // Clear error
        clearError: () => set({ error: null }),

        // Clear current lead
        clearCurrentLead: () => set({ currentLead: null }),
      };
    },
    {
      name: "lead-storage",
      partialize: (state) => ({
        contactStatus: state.contactStatus,
      }),
    }
  )
);
