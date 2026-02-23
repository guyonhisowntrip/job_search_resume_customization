"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { MessageCircle, Send, Sparkles, X } from "lucide-react"
import { Button } from "./ui/button"
import { useInsights } from "./insights-context"

const PROMPT_CHIPS = [
  "Best ML project?",
  "Explain ECG project",
  "Is Aditya suitable for data science roles?",
  "What research work has Aditya done?",
]

const STORAGE_KEY = "portfolio:chat-history"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

export function AiChatWidget() {
  const { intent, recordSources } = useInsights()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setMessages(JSON.parse(stored) as ChatMessage[])
      } catch {
        setMessages([])
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const greeting = useMemo(() => {
    switch (intent) {
      case "recruiter":
        return "Hi! I can highlight Aditya's fit for roles, impact, and leadership.";
      case "tech":
        return "Ask me about models, architecture decisions, and trade-offs.";
      case "research":
        return "Happy to cover research focus and experimentation details.";
      default:
        return "Ask anything about Aditya's projects, skills, or experience.";
    }
  }, [intent])

  const sendMessage = async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, intent }),
      })
      const data = (await response.json()) as {
        response?: string
        sources?: { id: string; type: string }[]
        error?: string
      }

      if (data.sources) recordSources(data.sources)

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: stripMarkdown(data.response ?? data.error ?? "I couldn't generate a response."),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Something went wrong while contacting the AI service.",
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-[340px] rounded-3xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/10 sm:w-[380px]">
          <div className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">Aditya's AI Portfolio Assistant</p>
                <p className="text-xs text-muted-foreground">{greeting}</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full border border-border/70 p-2 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[360px] space-y-3 overflow-y-auto px-5 py-4 text-sm">
            {messages.length === 0 ? (
              <div className="rounded-2xl border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
                Ask me about projects, experience, skills, or research. I’ll answer using only portfolio facts.
              </div>
            ) : null}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/80 text-foreground"
                }`}
              >
                {message.content}
              </div>
            ))}
            {loading ? <p className="text-xs text-muted-foreground">Thinking...</p> : null}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border/70 px-5 py-4">
            <div className="flex flex-wrap gap-2 pb-3">
              {PROMPT_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  className="rounded-full border border-border/70 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  {chip}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-background/70 px-2 py-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about Aditya's work..."
                className="h-9 flex-1 bg-transparent px-2 text-sm focus:outline-none"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    sendMessage(input)
                  }
                }}
              />
              <Button size="icon" onClick={() => sendMessage(input)} disabled={loading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-3 rounded-full border border-border/60 bg-card/80 px-4 py-3 text-sm font-semibold text-foreground shadow-lg shadow-primary/10 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-primary/50"
          aria-label="Open AI portfolio assistant"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary transition group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-left">
            <span className="block text-xs text-muted-foreground">Ask the assistant</span>
            <span className="block">AI Portfolio Chat</span>
          </span>
        </button>
      )}
    </div>
  )
}

function stripMarkdown(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .trim()
}
