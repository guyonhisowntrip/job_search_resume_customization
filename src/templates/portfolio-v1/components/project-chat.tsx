"use client"

import { useEffect, useRef, useState } from "react"
import { MessageSquare } from "lucide-react"
import { Button } from "./ui/button"

const DEFAULT_SUGGESTIONS = [
  "Why was this tech stack chosen?",
  "What dataset was used?",
  "What were the trade-offs?",
]

type ProjectChatProps = {
  projectId: string
  projectTitle: string
}

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ProjectChat({ projectId, projectTitle }: ProjectChatProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const sendMessage = async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: trimmed }])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/ai/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, message: trimmed }),
      })
      const data = (await response.json()) as { response?: string; error?: string }
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: stripMarkdown(data.response ?? data.error ?? "No response generated."),
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Unable to reach the AI service.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-border bg-card/60 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Ask this project</p>
          <p className="text-xs text-muted-foreground">Scoped to {projectTitle}</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setOpen((prev) => !prev)}>
          <MessageSquare className="mr-2 h-4 w-4" />
          {open ? "Hide" : "Ask"}
        </Button>
      </div>
      {open ? (
        <div className="mt-3 space-y-3">
          <div className="max-h-[200px] space-y-2 overflow-y-auto rounded-lg border border-border bg-background/60 p-3 text-sm">
            {messages.length === 0 ? (
              <p className="text-muted-foreground">Ask about architecture, datasets, or decisions.</p>
            ) : null}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-md px-2 py-1.5 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {message.content}
              </div>
            ))}
            {loading ? <p className="text-xs text-muted-foreground">Thinking...</p> : null}
            <div ref={endRef} />
          </div>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => sendMessage(suggestion)}
                className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a project question..."
              className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  sendMessage(input)
                }
              }}
            />
            <Button size="sm" onClick={() => sendMessage(input)} disabled={loading}>
              Send
            </Button>
          </div>
        </div>
      ) : null}
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
