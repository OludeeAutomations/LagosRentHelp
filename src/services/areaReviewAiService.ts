import { areaReviewsSupabase } from "@/lib/areaReviewsSupabase";

export interface AreaAiMessage {
  role: "user" | "assistant";
  content: string;
}

interface AreaAiResponse {
  answer?: string;
  remaining?: number;
  error?: string;
}

const responseError = async (error: { message: string; context?: unknown }) => {
  if (error.context instanceof Response) {
    try {
      const body = await error.context.clone().json() as AreaAiResponse;
      if (body.error) return body.error;
    } catch {
      // Fall through to the client error message.
    }
  }
  return error.message || "The AI assistant is unavailable right now.";
};

const getVisitorId = () => {
  const storageKey = "area_reviews_ai_visitor_id";
  try {
    const existing = window.localStorage.getItem(storageKey);
    if (existing) return existing;
    const visitorId = crypto.randomUUID();
    window.localStorage.setItem(storageKey, visitorId);
    return visitorId;
  } catch {
    return `temporary-${crypto.randomUUID()}`;
  }
};

export const areaReviewAiService = {
  ask: async (messages: AreaAiMessage[]) => {
    const { data, error } = await areaReviewsSupabase.functions.invoke<AreaAiResponse>("area-review-ai", {
      body: { messages, visitorId: getVisitorId() },
    });
    if (error) throw new Error(await responseError(error));
    if (!data?.answer) throw new Error(data?.error || "The AI assistant returned an empty answer.");
    return { answer: data.answer, remaining: data.remaining };
  },
};
