export type ResumeData = {
  personal: {
    name: string
    title: string
    summary: string
    photo: string
    primaryPhoto: string
    secondaryPhoto: string
  }
  contact: {
    email: string
    phone: string
    location: string
  }
  links: {
    github: string
    linkedin: string
    twitter: string
    portfolio: string
  }
  experience: Array<{
    company: string
    role: string
    startDate: string
    endDate: string
    description: string
  }>
  projects: Array<{
    name: string
    description: string
    tech: string[]
    link: string
  }>
  skills: string[]
  education: string[]
}
