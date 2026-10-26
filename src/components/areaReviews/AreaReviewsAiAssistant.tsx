import { Bot, Loader2, LogIn, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { FormEvent, Fragment, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { areaReviewAiService, type AreaAiMessage } from "@/services/areaReviewAiService";
import type { AreaReviewsAccount } from "@/stores/areaReviewsAuthStore";

interface Props {
  user: AreaReviewsAccount | null;
  authLoading: boolean;
}

type DisplayMessage = AreaAiMessage & { id: string };

const welcomeMessage: DisplayMessage = {
  id: "welcome",
  role: "assistant",
  content: "Ask me to compare Lagos areas by resident reviews, or find approved available listings on LagosRentHelp.",
};

const suggestedQuestions = [
  "Which reviewed areas have the lowest rent?",
  "Where do residents rate electricity highest?",
  "Compare areas with lower reported flood risk.",
];

const formattedAnswer = (content: string) => {
  const parts = content.split(/(\*\*[^*\n]+\*\*|\/(?:area-reviews|properties)\/[a-z0-9-]+)/gi);
  return parts.map((part, index) => {
    if (part.match(/^\*\*[^*\n]+\*\*$/)) {
      return <strong key={`${part}-${index}`} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    if (part.match(/^\/(?:area-reviews|properties)\/[a-z0-9-]+$/i)) {
      return <Link key={`${part}-${index}`} to={part} className="font-bold text-[#0e7d2b] underline decoration-green-300 underline-offset-2 hover:text-[#095d21]">View page</Link>;
    }
    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
};

const AreaReviewsAiAssistant = ({ user, authLoading }: Props) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([welcomeMessage]);
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    if (!authLoading) window.setTimeout(() => inputRef.current?.focus(), 150);
  }, [authLoading, messages, open]);

  const ask = async (rawQuestion: string) => {
    const content = rawQuestion.trim();
    if (!content || submitting || authLoading) return;
    const userMessage: DisplayMessage = { id: crypto.randomUUID(), role: "user", content };
    const conversation = [...messages.filter((message) => message.id !== "welcome"), userMessage]
      .slice(-8)
      .map(({ role, content: messageContent }) => ({ role, content: messageContent }));
    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setSubmitting(true);
    try {
      const result = await areaReviewAiService.ask(conversation);
      setMessages((current) => [...current, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.answer,
      }]);
      setRemaining(typeof result.remaining === "number" ? result.remaining : null);
    } catch (error) {
      setMessages((current) => [...current, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: error instanceof Error ? error.message : "I could not answer that right now. Please try again.",
      }]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void ask(question);
  };

  const resetChat = () => {
    setMessages([welcomeMessage]);
    setRemaining(null);
    setQuestion("");
  };

  return (
    <aside className="fixed bottom-4 right-4 z-[70] sm:bottom-6 sm:right-6" aria-label="LagosRentHelp AI assistant">
      {open ? (
        <div className="flex h-[min(620px,calc(100vh-2rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 sm:w-[390px]">
          <div className="flex items-center justify-between bg-[#0c3021] px-4 py-4 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#129B36]"><Sparkles className="h-5 w-5" /></span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-extrabold">Ask LagosRentHelp AI</span>
                <span className="block text-[11px] text-green-100/70">Approved reviews and live listings</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={resetChat} className="rounded-xl p-2 text-green-50/70 transition hover:bg-white/10 hover:text-white" aria-label="Start a new conversation"><RotateCcw className="h-4 w-4" /></button>
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 text-green-50/70 transition hover:bg-white/10 hover:text-white" aria-label="Close AI assistant"><X className="h-5 w-5" /></button>
            </div>
          </div>

          <>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[#fafafa] px-4 py-4" aria-live="polite">
                {!authLoading && !user && (
                  <div className="rounded-2xl border border-green-100 bg-green-50 px-3.5 py-3 text-xs leading-5 text-slate-700">
                    You can ask 3 questions daily without an account. <Link to="/area-reviews/login" state={{ from: `${location.pathname}${location.search}` }} className="inline-flex items-center gap-1 font-bold text-[#0e7d2b] hover:underline"><LogIn className="h-3.5 w-3.5" />Sign in</Link> for 10 daily questions.
                  </div>
                )}
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "rounded-br-md bg-[#129B36] text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"}`}>
                      {message.role === "assistant" ? formattedAnswer(message.content) : message.content}
                    </div>
                  </div>
                ))}
                {messages.length === 1 && (
                  <div className="space-y-2 pt-1">
                    {suggestedQuestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => void ask(suggestion)} className="block w-full rounded-xl border border-green-100 bg-white px-3 py-2.5 text-left text-xs font-semibold leading-5 text-slate-700 transition hover:border-green-300 hover:bg-green-50">{suggestion}</button>)}
                  </div>
                )}
                {submitting && <div className="flex justify-start"><div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin text-[#129B36]" />Checking approved reviews…</div></div>}
              </div>

              <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100">
                  <input ref={inputRef} value={question} onChange={(event) => setQuestion(event.target.value)} disabled={submitting || authLoading} maxLength={800} placeholder="Ask about rent, power, water…" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400" aria-label="Question for Area Reviews AI" />
                  <button type="submit" disabled={!question.trim() || submitting || authLoading} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#129B36] text-white transition hover:bg-[#0e7d2b] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send question"><Send className="h-4 w-4" /></button>
                </div>
                <p className="mt-2 text-center text-[10px] text-slate-400">AI can make mistakes. Check review counts and area pages.{remaining !== null ? ` ${remaining} questions left today.` : ""}</p>
              </form>
          </>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="group relative flex h-14 w-14 items-center justify-center rounded-2xl border border-green-800/10 bg-[#0c3021] text-white shadow-xl shadow-slate-950/20 transition after:absolute after:-bottom-1 after:right-2.5 after:h-3 after:w-3 after:rotate-45 after:rounded-[2px] after:bg-[#0c3021] after:content-[''] hover:-translate-y-0.5 hover:bg-[#12442f] hover:after:bg-[#12442f]" aria-label="Open LagosRentHelp AI assistant" title="Ask LagosRentHelp AI">
          <Bot className="h-7 w-7 transition group-hover:scale-105" />
        </button>
      )}
    </aside>
  );
};

export default AreaReviewsAiAssistant;
