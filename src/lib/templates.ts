import { ResumeData } from "@/lib/resume-schema"

export type TemplateConfig = {
  id: string
  name: string
  description: string
  accent: string
  previewTitle: string
  previewSubtitle: string
  isAvailable: boolean
}

export const TEMPLATE_LIST: TemplateConfig[] = [
  {
    id: "portfolio-v1",
    name: "Portfolio V1",
    description: "Focused portfolio with recruiter-first storytelling and technical depth.",
    accent: "from-[#2e7d6f] to-[#4f46e5]",
    previewTitle: "Narrative + outcomes",
    previewSubtitle: "Great for full-stack and product-minded engineers.",
    isAvailable: true
  }
]

export const DEFAULT_TEMPLATE_ID = TEMPLATE_LIST[0]?.id ?? "portfolio-v1"

export const TEMPLATE_PREVIEW_SAMPLE: ResumeData = {
  personal: {
    name: "Alex Martin",
    title: "Senior Software Engineer",
    summary: "I build developer platforms and reliable user-facing products.",
    photo: "",
    primaryPhoto: "",
    secondaryPhoto: ""
  },
  contact: {
    email: "alex@example.com",
    phone: "+1 555 0100",
    location: "San Francisco, CA"
  },
  links: {
    github: "https://github.com/alex",
    linkedin: "https://linkedin.com/in/alex",
    twitter: "",
    portfolio: ""
  },
  experience: [
    {
      company: "Nimbus Labs",
      role: "Senior Engineer",
      startDate: "2022",
      endDate: "Present",
      description: "Led the migration to event-driven services and reduced deployment time by 40%."
    }
  ],
  projects: [
    {
      name: "Realtime Dashboard",
      description: "Observability suite that aggregates and visualizes system health for product teams.",
      tech: ["Next.js", "TypeScript", "PostgreSQL"],
      link: ""
    }
  ],
  skills: ["TypeScript", "Next.js", "System Design", "DX Tooling"],
  education: ["B.Tech in Computer Science"]
}
