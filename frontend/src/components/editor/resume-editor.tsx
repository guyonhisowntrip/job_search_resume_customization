"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ImagePlus, Plus, Trash2, TriangleAlert, Upload } from "lucide-react"
import { ChangeEvent, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ConfidenceMap } from "@/lib/confidence"
import { cn } from "@/lib/cn"
import { ResumeData } from "@/lib/resume-schema"

type ResumeEditorProps = {
  data: ResumeData
  onChange: (next: ResumeData) => void
  confidenceMap: ConfidenceMap
  compact?: boolean
}

type SectionId = "personal" | "experience" | "projects" | "skills"

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "")
    reader.onerror = () => reject(new Error("Could not read image file"))
    reader.readAsDataURL(file)
  })
}

function SectionContainer({
  id,
  title,
  subtitle,
  lowCount,
  open,
  onToggle,
  children
}: {
  id: SectionId
  title: string
  subtitle: string
  lowCount: number
  open: boolean
  onToggle: (id: SectionId) => void
  children: React.ReactNode
}) {
  return (
    <Card className="overflow-hidden p-0">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[#f8fbff]"
      >
        <div>
          <h3 className="text-lg font-semibold text-[#10243e]">{title}</h3>
          <p className="text-sm text-[#58708a]">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {lowCount > 0 ? <Badge tone="warning">{lowCount} low confidence</Badge> : null}
          <ChevronDown className={cn("h-5 w-5 text-[#58708a] transition", open ? "rotate-180" : "rotate-0")} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key={`${id}-content`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="border-t border-[#e1e9f2]"
          >
            <div className="space-y-5 p-5">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  )
}

function FieldLabel({
  htmlFor,
  label,
  warning
}: {
  htmlFor: string
  label: string
  warning?: string
}) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-wide text-[#4d657f]">
        {label}
      </label>
      {warning ? (
        <span className="inline-flex items-center gap-1 text-xs text-[#ab4c32]">
          <TriangleAlert className="h-3.5 w-3.5" />
          {warning}
        </span>
      ) : null}
    </div>
  )
}

function confidenceMessage(confidenceMap: ConfidenceMap, path: string) {
  return confidenceMap[path]?.reason
}

function PhotoPreview({ title, src }: { title: string; src: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#4d657f]">{title}</p>
      <div className="overflow-hidden rounded-xl border border-[#d8e3ee] bg-[#f4f8fd]">
        {src ? (
          <img src={src} alt={title} className="h-36 w-full object-cover" />
        ) : (
          <div className="flex h-36 items-center justify-center text-sm text-[#6a8199]">
            <ImagePlus className="mr-2 h-4 w-4" />
            No image selected
          </div>
        )}
      </div>
    </div>
  )
}

export function ResumeEditor({ data, onChange, confidenceMap, compact = false }: ResumeEditorProps) {
  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>({
    personal: true,
    experience: true,
    projects: !compact,
    skills: !compact
  })

  const lowCounts = useMemo(() => {
    const counters: Record<SectionId, number> = {
      personal: 0,
      experience: 0,
      projects: 0,
      skills: 0
    }

    Object.keys(confidenceMap).forEach((path) => {
      if (path.startsWith("personal") || path.startsWith("contact") || path.startsWith("links")) {
        counters.personal += 1
      }
      if (path.startsWith("experience")) counters.experience += 1
      if (path.startsWith("projects")) counters.projects += 1
      if (path.startsWith("skills")) counters.skills += 1
    })

    return counters
  }, [confidenceMap])

  function toggleSection(id: SectionId) {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function updatePersonal(field: keyof ResumeData["personal"], value: string) {
    const nextPersonal = { ...data.personal, [field]: value }

    if (field === "primaryPhoto") {
      nextPersonal.photo = value
    }
    if (field === "photo" && !nextPersonal.primaryPhoto) {
      nextPersonal.primaryPhoto = value
    }

    onChange({ ...data, personal: nextPersonal })
  }

  async function handlePhotoUpload(field: "primaryPhoto" | "secondaryPhoto", event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const dataUrl = await fileToDataUrl(file)
      updatePersonal(field, dataUrl)
    } catch {
      // Keep editor stable when file read fails.
    }

    // Allow selecting the same file again.
    event.target.value = ""
  }

  function updateContact(field: keyof ResumeData["contact"], value: string) {
    onChange({ ...data, contact: { ...data.contact, [field]: value } })
  }

  function updateLink(field: keyof ResumeData["links"], value: string) {
    onChange({ ...data, links: { ...data.links, [field]: value } })
  }

  function updateExperience(index: number, field: keyof ResumeData["experience"][number], value: string) {
    const next = data.experience.map((item, itemIndex) => {
      if (itemIndex !== index) return item
      return { ...item, [field]: value }
    })
    onChange({ ...data, experience: next })
  }

  function addExperience() {
    onChange({
      ...data,
      experience: [
        ...data.experience,
        { company: "", role: "", startDate: "", endDate: "", description: "" }
      ]
    })
  }

  function removeExperience(index: number) {
    onChange({ ...data, experience: data.experience.filter((_, itemIndex) => itemIndex !== index) })
  }

  function updateProject(index: number, field: keyof ResumeData["projects"][number], value: string | string[]) {
    const next = data.projects.map((item, itemIndex) => {
      if (itemIndex !== index) return item
      return { ...item, [field]: value }
    })
    onChange({ ...data, projects: next })
  }

  function addProject() {
    onChange({
      ...data,
      projects: [...data.projects, { name: "", description: "", tech: [], link: "" }]
    })
  }

  function removeProject(index: number) {
    onChange({ ...data, projects: data.projects.filter((_, itemIndex) => itemIndex !== index) })
  }

  function addSkill() {
    onChange({
      ...data,
      skills: [...data.skills, ""]
    })
  }

  function updateSkill(index: number, value: string) {
    onChange({
      ...data,
      skills: data.skills.map((item, itemIndex) => (itemIndex === index ? value : item))
    })
  }

  function removeSkill(index: number) {
    onChange({ ...data, skills: data.skills.filter((_, itemIndex) => itemIndex !== index) })
  }

  return (
    <div className="space-y-4">
      <SectionContainer
        id="personal"
        title="Personal Info"
        subtitle="Identity, contact details, profile links, and portfolio photos"
        lowCount={lowCounts.personal}
        open={openSections.personal}
        onToggle={toggleSection}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel
              htmlFor="name"
              label="Full name"
              warning={confidenceMessage(confidenceMap, "personal.name")}
            />
            <Input
              id="name"
              hasError={Boolean(confidenceMessage(confidenceMap, "personal.name"))}
              value={data.personal.name}
              onChange={(event) => updatePersonal("name", event.target.value)}
              placeholder="Ada Lovelace"
            />
          </div>

          <div>
            <FieldLabel
              htmlFor="title"
              label="Professional title"
              warning={confidenceMessage(confidenceMap, "personal.title")}
            />
            <Input
              id="title"
              hasError={Boolean(confidenceMessage(confidenceMap, "personal.title"))}
              value={data.personal.title}
              onChange={(event) => updatePersonal("title", event.target.value)}
              placeholder="Full-Stack Engineer"
            />
          </div>

          <div className="md:col-span-2">
            <FieldLabel
              htmlFor="summary"
              label="Summary"
              warning={confidenceMessage(confidenceMap, "personal.summary")}
            />
            <Textarea
              id="summary"
              hasError={Boolean(confidenceMessage(confidenceMap, "personal.summary"))}
              value={data.personal.summary}
              onChange={(event) => updatePersonal("summary", event.target.value)}
              placeholder="Two to four lines that summarize your impact."
            />
          </div>

          <div>
            <FieldLabel htmlFor="primary-photo" label="Primary Photo URL (Hero)" />
            <Input
              id="primary-photo"
              value={data.personal.primaryPhoto}
              onChange={(event) => updatePersonal("primaryPhoto", event.target.value)}
              placeholder="https://..."
            />
            <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#c7d3df] bg-white px-3 py-2 text-xs font-semibold text-[#2f4f6f] hover:bg-[#f6f9fd]">
              <Upload className="h-3.5 w-3.5" />
              Upload Primary Photo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  void handlePhotoUpload("primaryPhoto", event)
                }}
              />
            </label>
          </div>

          <div>
            <FieldLabel htmlFor="secondary-photo" label="Secondary Photo URL (About)" />
            <Input
              id="secondary-photo"
              value={data.personal.secondaryPhoto}
              onChange={(event) => updatePersonal("secondaryPhoto", event.target.value)}
              placeholder="https://..."
            />
            <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#c7d3df] bg-white px-3 py-2 text-xs font-semibold text-[#2f4f6f] hover:bg-[#f6f9fd]">
              <Upload className="h-3.5 w-3.5" />
              Upload Secondary Photo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  void handlePhotoUpload("secondaryPhoto", event)
                }}
              />
            </label>
          </div>

          <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
            <PhotoPreview title="Primary Photo" src={data.personal.primaryPhoto} />
            <PhotoPreview title="Secondary Photo" src={data.personal.secondaryPhoto} />
          </div>

          <div>
            <FieldLabel
              htmlFor="email"
              label="Email"
              warning={confidenceMessage(confidenceMap, "contact.email")}
            />
            <Input
              id="email"
              hasError={Boolean(confidenceMessage(confidenceMap, "contact.email"))}
              value={data.contact.email}
              onChange={(event) => updateContact("email", event.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <FieldLabel
              htmlFor="phone"
              label="Phone"
              warning={confidenceMessage(confidenceMap, "contact.phone")}
            />
            <Input
              id="phone"
              hasError={Boolean(confidenceMessage(confidenceMap, "contact.phone"))}
              value={data.contact.phone}
              onChange={(event) => updateContact("phone", event.target.value)}
              placeholder="+1 000 000 0000"
            />
          </div>

          <div>
            <FieldLabel
              htmlFor="location"
              label="Location"
              warning={confidenceMessage(confidenceMap, "contact.location")}
            />
            <Input
              id="location"
              hasError={Boolean(confidenceMessage(confidenceMap, "contact.location"))}
              value={data.contact.location}
              onChange={(event) => updateContact("location", event.target.value)}
              placeholder="New York, NY"
            />
          </div>

          <div>
            <FieldLabel htmlFor="linkedin" label="LinkedIn" />
            <Input
              id="linkedin"
              value={data.links.linkedin}
              onChange={(event) => updateLink("linkedin", event.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div>
            <FieldLabel htmlFor="github" label="GitHub" />
            <Input
              id="github"
              value={data.links.github}
              onChange={(event) => updateLink("github", event.target.value)}
              placeholder="https://github.com/username"
            />
          </div>
        </div>
      </SectionContainer>

      <SectionContainer
        id="experience"
        title="Experience"
        subtitle="Add each role with concise impact"
        lowCount={lowCounts.experience}
        open={openSections.experience}
        onToggle={toggleSection}
      >
        <div className="space-y-4">
          {data.experience.map((item, index) => (
            <div key={`experience-${index}`} className="rounded-xl border border-[#dbe4ee] bg-[#fbfdff] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#213852]">Role #{index + 1}</h4>
                <Button variant="ghost" className="h-8 px-2 text-[#9b3f30]" onClick={() => removeExperience(index)}>
                  <Trash2 className="mr-1 h-4 w-4" />
                  Remove
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <FieldLabel
                    htmlFor={`company-${index}`}
                    label="Company"
                    warning={confidenceMessage(confidenceMap, `experience.${index}.company`)}
                  />
                  <Input
                    id={`company-${index}`}
                    hasError={Boolean(confidenceMessage(confidenceMap, `experience.${index}.company`))}
                    value={item.company}
                    onChange={(event) => updateExperience(index, "company", event.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel
                    htmlFor={`role-${index}`}
                    label="Role"
                    warning={confidenceMessage(confidenceMap, `experience.${index}.role`)}
                  />
                  <Input
                    id={`role-${index}`}
                    hasError={Boolean(confidenceMessage(confidenceMap, `experience.${index}.role`))}
                    value={item.role}
                    onChange={(event) => updateExperience(index, "role", event.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor={`start-${index}`} label="Start date" />
                  <Input
                    id={`start-${index}`}
                    value={item.startDate}
                    onChange={(event) => updateExperience(index, "startDate", event.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor={`end-${index}`} label="End date" />
                  <Input
                    id={`end-${index}`}
                    value={item.endDate}
                    onChange={(event) => updateExperience(index, "endDate", event.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel
                    htmlFor={`description-${index}`}
                    label="Impact summary"
                    warning={confidenceMessage(confidenceMap, `experience.${index}.description`)}
                  />
                  <Textarea
                    id={`description-${index}`}
                    hasError={Boolean(confidenceMessage(confidenceMap, `experience.${index}.description`))}
                    value={item.description}
                    onChange={(event) => updateExperience(index, "description", event.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button variant="secondary" onClick={addExperience}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Experience
          </Button>
        </div>
      </SectionContainer>

      <SectionContainer
        id="projects"
        title="Projects"
        subtitle="Show technical projects with stack details"
        lowCount={lowCounts.projects}
        open={openSections.projects}
        onToggle={toggleSection}
      >
        <div className="space-y-4">
          {data.projects.map((project, index) => (
            <div key={`project-${index}`} className="rounded-xl border border-[#dbe4ee] bg-[#fbfdff] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#213852]">Project #{index + 1}</h4>
                <Button variant="ghost" className="h-8 px-2 text-[#9b3f30]" onClick={() => removeProject(index)}>
                  <Trash2 className="mr-1 h-4 w-4" />
                  Remove
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <FieldLabel
                    htmlFor={`project-name-${index}`}
                    label="Project name"
                    warning={confidenceMessage(confidenceMap, `projects.${index}.name`)}
                  />
                  <Input
                    id={`project-name-${index}`}
                    hasError={Boolean(confidenceMessage(confidenceMap, `projects.${index}.name`))}
                    value={project.name}
                    onChange={(event) => updateProject(index, "name", event.target.value)}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor={`project-link-${index}`} label="Project URL" />
                  <Input
                    id={`project-link-${index}`}
                    value={project.link}
                    onChange={(event) => updateProject(index, "link", event.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <FieldLabel
                    htmlFor={`project-description-${index}`}
                    label="Description"
                    warning={confidenceMessage(confidenceMap, `projects.${index}.description`)}
                  />
                  <Textarea
                    id={`project-description-${index}`}
                    hasError={Boolean(confidenceMessage(confidenceMap, `projects.${index}.description`))}
                    value={project.description}
                    onChange={(event) => updateProject(index, "description", event.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <FieldLabel
                    htmlFor={`project-tech-${index}`}
                    label="Tech stack (comma separated)"
                    warning={confidenceMessage(confidenceMap, `projects.${index}.tech`)}
                  />
                  <Input
                    id={`project-tech-${index}`}
                    hasError={Boolean(confidenceMessage(confidenceMap, `projects.${index}.tech`))}
                    value={project.tech.join(", ")}
                    onChange={(event) =>
                      updateProject(
                        index,
                        "tech",
                        event.target.value
                          .split(",")
                          .map((tech) => tech.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="Next.js, Tailwind, PostgreSQL"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button variant="secondary" onClick={addProject}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Project
          </Button>
        </div>
      </SectionContainer>

      <SectionContainer
        id="skills"
        title="Skills"
        subtitle="Keep this focused and specific"
        lowCount={lowCounts.skills}
        open={openSections.skills}
        onToggle={toggleSection}
      >
        <div className="space-y-3">
          {data.skills.map((skill, index) => (
            <div key={`skill-${index}`} className="flex items-center gap-2">
              <Input
                hasError={Boolean(confidenceMessage(confidenceMap, "skills"))}
                value={skill}
                onChange={(event) => updateSkill(index, event.target.value)}
                placeholder="TypeScript"
              />
              <Button variant="ghost" className="h-10 px-3 text-[#9b3f30]" onClick={() => removeSkill(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button variant="secondary" onClick={addSkill}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Skill
          </Button>
        </div>
      </SectionContainer>
    </div>
  )
}
