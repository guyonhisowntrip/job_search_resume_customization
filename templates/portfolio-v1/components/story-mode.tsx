"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "./ui/button"

const STORY_SCRIPT =
  "Meet Aditya Pratap Singh Tomar — a data scientist, ML engineer, and AI researcher. He builds production-ready AI systems with deep learning, Transformers, and scalable deployment. You'll see a bold builder who delivers measurable impact and communicates clearly with stakeholders. His flagship work includes ForesightX, a forecasting system that decodes market signals using deep time-series models. You'll also find systems across healthcare, RAG, and safety tooling, each with clear outcomes, evaluation, and deployment readiness. His experience shows ownership from research to shipping, and his skills are backed by real projects and technical depth. He leads with clarity, executes fast, and keeps reliability at the core. Key strengths: time-series forecasting, LLM systems, MLOps pipelines, and production-grade evaluation. Key outcomes: measurable impact, fast iteration, and strong stakeholder trust. If you're hiring for machine learning or AI roles, you're looking at a candidate who moves fast, ships reliably, and thinks in systems."

const STORY_TIMELINE = [
  { time: 0, sectionId: "hero", highlight: "hero-photo" },
  { time: 7, sectionId: "hero", highlight: "dominant-text" },
  { time: 20, sectionId: "projects", highlight: "project-foresightx" },
  { time: 44, sectionId: "experience" },
  { time: 64, sectionId: "skills" },
  { time: 82, sectionId: "projects", highlight: "project-foresightx" },
  { time: 94, sectionId: "contact" },
]

export function StoryMode() {
  const [active, setActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const highlightRef = useRef<HTMLElement | null>(null)
  const timeoutsRef = useRef<number[]>([])

  useEffect(() => {
    if (!active) return

    const scale = getTimelineScale(STORY_SCRIPT, 1.02)

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = speakScript(STORY_SCRIPT)
      utterance.onend = () => {
        clearHighlight(highlightRef)
        setActive(false)
      }
    }

    timeoutsRef.current = STORY_TIMELINE.map((step, index) =>
      window.setTimeout(() => {
        setStepIndex(index)
        const section = document.getElementById(step.sectionId)
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" })
        }
        if (step.highlight) {
          applyHighlight(step.highlight, highlightRef)
        } else {
          clearHighlight(highlightRef)
        }
      }, step.time * 1000 * scale)
    )

    return () => {
      timeoutsRef.current.forEach((t) => window.clearTimeout(t))
      clearHighlight(highlightRef)
    }
  }, [active])

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setStepIndex(0)
            setActive((prev) => {
              if (prev && typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel()
              }
              return !prev
            })
          }}
        >
          {active ? "Stop tour" : "Take a 90-second tour"}
        </Button>
      </div>

      {active ? (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-40 flex justify-center">
          <div className="flex items-center gap-3 rounded-full border border-border bg-card/90 px-4 py-2 text-sm text-foreground shadow-lg">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-background">
              <img src="/placeholder-user.jpg" alt="AI narrator" className="h-full w-full object-cover" />
            </span>
            <span>Story mode in progress...</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function speakScript(text: string) {
  const synth = window.speechSynthesis
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  const voices = synth.getVoices()
  const preferred =
    voices.find((voice) => voice.lang.includes("en-IN") && voice.name.toLowerCase().includes("female")) ||
    voices.find((voice) => voice.lang.includes("en-IN")) ||
    voices.find((voice) => voice.lang.includes("en-GB")) ||
    voices.find((voice) => voice.lang.includes("en-US"))
  if (preferred) utterance.voice = preferred
  utterance.rate = 1.02
  utterance.pitch = 1.1
  utterance.volume = 0.9
  synth.speak(utterance)
  return utterance
}

function getTimelineScale(script: string, rate: number) {
  const words = script.trim().split(/\s+/).length
  const wordsPerMinute = 180 * rate
  const estimatedSeconds = (words / wordsPerMinute) * 60
  const baseSeconds = 100
  return Math.max(0.75, Math.min(1.3, estimatedSeconds / baseSeconds))
}

function applyHighlight(storyId: string, ref: React.MutableRefObject<HTMLElement | null>) {
  clearHighlight(ref)
  const element = document.querySelector(`[data-story=\"${storyId}\"]`) as HTMLElement | null
  if (element) {
    element.classList.add("story-highlight")
    ref.current = element
  }
}

function clearHighlight(ref: React.MutableRefObject<HTMLElement | null>) {
  if (ref.current) {
    ref.current.classList.remove("story-highlight")
    ref.current = null
  }
}
