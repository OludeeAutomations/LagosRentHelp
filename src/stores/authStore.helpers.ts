import { Agent, User } from "@/types";

interface AuthPayload {
  accessToken?: string;
  agentData?: Agent | null;
  token?: string;
  user?: User | null;
}

export const normalizeAuthPayload = (response: unknown) => {
  const data = (response as { data?: AuthPayload })?.data || (response as AuthPayload);
  const accessToken = data.accessToken || data.token;

  if (!data.user || !accessToken) {
    throw new Error("Invalid response from server");
  }

  return {
    accessToken,
    agent: data.agentData || null,
    user: data.user,
  };
};
