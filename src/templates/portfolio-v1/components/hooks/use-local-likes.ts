"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "portfolio:project-likes"

type LikeState = Record<string, number>

export function useLocalLikes(projectId: string) {
  const [likes, setLikes] = useState(0)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as LikeState
        setLikes(parsed[projectId] ?? 0)
      } catch {
        setLikes(0)
      }
    }
  }, [projectId])

  const increment = () => {
    setLikes((prev) => {
      const next = prev + 1
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        const parsed = stored ? (JSON.parse(stored) as LikeState) : {}
        parsed[projectId] = next
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      }
      return next
    })
  }

  return { likes, increment }
}
