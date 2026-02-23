"use client"

import Link from "next/link"
import { StoryMode } from "./story-mode"
import { ThemeToggle } from "./theme-toggle"

const navItems = [
  { href: "#hero", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#resume", label: "Role Fit" }
]

export function Navigation() {
  return (
    <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="#hero" className="text-sm font-semibold tracking-wide text-foreground">
          apst.me
        </Link>
        <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <StoryMode />
        </div>
      </div>
    </nav>
  )
}
