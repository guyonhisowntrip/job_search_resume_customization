"use client"

import { cn } from "@/lib/cn"

function scorePalette(score: number) {
  if (score < 50) {
    return {
      track: "bg-[#fbe7e2]",
      fill: "bg-[#c45138]",
      text: "text-[#9b3d2a]"
    }
  }
  if (score <= 75) {
    return {
      track: "bg-[#fbf2df]",
      fill: "bg-[#b2751f]",
      text: "text-[#7f5318]"
    }
  }
  return {
    track: "bg-[#e5f4eb]",
    fill: "bg-[#2c7a52]",
    text: "text-[#2f6f4c]"
  }
}

type ScoreMeterProps = {
  score: number
  label: string
}

export function ScoreMeter({ score, label }: ScoreMeterProps) {
  const roundedScore = Math.max(0, Math.min(100, Math.round(score)))
  const palette = scorePalette(roundedScore)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#1c3f62]">{label}</p>
        <p className={cn("text-sm font-semibold", palette.text)}>{roundedScore}%</p>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={roundedScore}
        className={cn("h-2.5 overflow-hidden rounded-full", palette.track)}
      >
        <div className={cn("h-full rounded-full transition-[width] duration-500 ease-out", palette.fill)} style={{ width: `${roundedScore}%` }} />
      </div>
    </div>
  )
}

