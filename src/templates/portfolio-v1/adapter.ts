import type { ResumeData } from "./resume-schema"

export type PortfolioData = {
  profile: {
    name: string
    title: string
    location: string
    email: string
    phone: string
    photo: string
    primaryPhoto: string
    secondaryPhoto: string
    headline: string
    summary: string
    socials: Record<string, string>
    stats: Array<{ value: string; label: string }>
  }
  experience: Array<{
    id: string
    role: string
    company: string
    period: string
    highlights: string[]
    stack: string[]
  }>
  projects: Array<{
    id: string
    title: string
    tagline: string
    impact: string
    videoUrl: string
    repo: string
    caseStudy: string
    category: "featured" | "hackathon" | "learning"
    skills: string[]
    tools: string[]
    highlights: string[]
    live: string
  }>
  skills: Array<{
    id: string
    name: string
    summary: string
    projects: string[]
    tools: string[]
  }>
  skillGroups: Array<{ title: string; items: string[] }>
  research: Array<{ id: string; title: string; summary: string; area: string; year: string }>
  achievements: Array<{ id: string; title: string; detail: string }>
  education: Array<{
    degree: string
    field: string
    institution: string
    period: string
    score: string
    highlights: string[]
  }>
  certifications: Array<{ title: string; issuer: string; date: string; link: string }>
  leadership: Array<{
    role: string
    organization: string
    period: string
    description: string
    links: Array<{ label: string; url: string }>
    highlights: string[]
  }>
  services: Array<{ title: string; description: string }>
  activities: { github: string; leetcode: string }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function githubUsername(url: string) {
  if (!url) return ""
  const match = url.match(/github\.com\/(.+)/)
  return match?.[1]?.split("/")[0] ?? ""
}

export function mapResumeToPortfolio(resume: ResumeData): PortfolioData {
  const experience = resume.experience.map((item, index) => ({
    id: `exp-${index}`,
    role: item.role,
    company: item.company,
    period: `${item.startDate} - ${item.endDate}`,
    highlights: [item.description],
    stack: []
  }))

  const projects: PortfolioData["projects"] = resume.projects.map((project, index) => ({
    id: slugify(project.name || `project-${index}`),
    title: project.name,
    tagline: project.description,
    impact: project.description,
    videoUrl: "",
    repo: project.link,
    caseStudy: "",
    category: index < 3 ? "featured" : "learning",
    skills: project.tech,
    tools: project.tech,
    highlights: project.tech,
    live: project.link
  }))

  const skills = resume.skills.map((skill, index) => ({
    id: `skill-${index}`,
    name: skill,
    summary: "",
    projects: [],
    tools: []
  }))

  const primaryPhoto = resume.personal.primaryPhoto || resume.personal.photo || ""
  const secondaryPhoto = resume.personal.secondaryPhoto || primaryPhoto

  return {
    profile: {
      name: resume.personal.name,
      title: resume.personal.title,
      location: resume.contact.location,
      email: resume.contact.email,
      phone: resume.contact.phone,
      photo: primaryPhoto,
      primaryPhoto,
      secondaryPhoto,
      headline: resume.personal.summary,
      summary: resume.personal.summary,
      socials: {
        github: resume.links.github,
        linkedin: resume.links.linkedin,
        x: resume.links.twitter,
        portfolio: resume.links.portfolio
      },
      stats: [
        { value: `${resume.experience.length}`, label: "Experience" },
        { value: `${resume.projects.length}`, label: "Projects" },
        { value: `${resume.skills.length}`, label: "Skills" }
      ]
    },
    experience,
    projects,
    skills,
    skillGroups: [
      {
        title: "Skills",
        items: resume.skills
      }
    ],
    research: [],
    achievements: [],
    education: resume.education.map((item) => ({
      degree: item,
      field: "",
      institution: "",
      period: "",
      score: "",
      highlights: []
    })),
    certifications: [],
    leadership: [],
    services: [],
    activities: {
      github: githubUsername(resume.links.github),
      leetcode: ""
    }
  }
}
