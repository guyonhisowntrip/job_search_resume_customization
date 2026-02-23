"use client"

import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"

import { ApplyModalMode } from "./types"

type ApplyImprovementModalProps = {
  open: boolean
  mode: ApplyModalMode
  scoreDelta: number
  isApplying: boolean
  isSavingVersion: boolean
  onClose: () => void
  onConfirmApply: () => void
  onConfirmSaveVersion: () => void
}

export function ApplyImprovementModal({
  open,
  mode,
  scoreDelta,
  isApplying,
  isSavingVersion,
  onClose,
  onConfirmApply,
  onConfirmSaveVersion
}: ApplyImprovementModalProps) {
  useEffect(() => {
    if (!open) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleEscape)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleEscape)
    }
  }, [open, onClose])

  const isApply = mode === "apply"
  const isPending = isApplying || isSavingVersion

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d223a]/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-improvements-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg rounded-2xl border border-[#d5e1ed] bg-white p-5 shadow-[0_12px_40px_rgba(14,41,68,0.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="apply-improvements-title" className="text-lg font-semibold text-[#10243e]">
                  {isApply ? "Apply Resume Improvements" : "Save Improved Resume Version"}
                </h3>
                <p className="mt-1 text-sm text-[#58708a]">
                  {isApply
                    ? "This will replace the current draft in your editor with the improved version."
                    : "This creates a timestamped version and keeps a snapshot for recovery."}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-1 text-[#5d7894] hover:bg-[#ecf2f8] hover:text-[#16395c]"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-[#d8e3ee] bg-[#f6f9fd] px-3 py-2 text-sm text-[#35506d]">
              Score uplift: <span className="font-semibold text-[#1f6b4a]">+{Math.max(0, Math.round(scoreDelta))} points</span>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <Button variant="secondary" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              {isApply ? (
                <Button onClick={onConfirmApply} disabled={isPending}>
                  {isApplying ? "Applying..." : "Apply Improvements to Resume"}
                </Button>
              ) : (
                <Button onClick={onConfirmSaveVersion} disabled={isPending}>
                  {isSavingVersion ? "Saving..." : "Save As New Version"}
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

