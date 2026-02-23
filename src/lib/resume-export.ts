import { ResumeData } from "@/lib/resume-schema"
import { jsPDF } from "jspdf"

function clean(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function splitBullets(text: string): string[] {
  if (!text.trim()) return []

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•\s]+/, "").trim())
    .filter(Boolean)

  if (lines.length > 1) {
    return lines
  }

  return text
    .split(/(?<=[.!?])\s+/)
    .map((segment) => clean(segment))
    .filter(Boolean)
}

function joinDateRange(startDate: string, endDate: string): string {
  const start = clean(startDate)
  const end = clean(endDate)

  if (start && end) return `${start} - ${end}`
  return start || end || "Duration not specified"
}

function toHeading(value: string): string {
  return value.trim().toUpperCase()
}

function makeDownloadFileName(fullName: string): string {
  const slug = clean(fullName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  const safeName = slug || "resume"
  const date = new Date().toISOString().slice(0, 10)
  return `${safeName}-tech-resume-${date}.pdf`
}

export function buildTechResumeTemplate(resume: ResumeData): string {
  const lines: string[] = []
  const name = clean(resume.personal.name) || "YOUR NAME"
  const title = clean(resume.personal.title) || "Software Engineer"

  const contactParts = [
    clean(resume.contact.email),
    clean(resume.contact.phone),
    clean(resume.contact.location),
    clean(resume.links.linkedin),
    clean(resume.links.github),
    clean(resume.links.portfolio)
  ].filter(Boolean)

  lines.push(toHeading(name))
  lines.push(title)
  if (contactParts.length > 0) {
    lines.push(contactParts.join(" | "))
  }
  lines.push("")

  lines.push("SUMMARY")
  lines.push(clean(resume.personal.summary) || "Add a concise summary tailored to the target role.")
  lines.push("")

  lines.push("TECHNICAL SKILLS")
  lines.push(resume.skills.length > 0 ? resume.skills.map(clean).filter(Boolean).join(", ") : "Add core technologies and tools.")
  lines.push("")

  lines.push("PROFESSIONAL EXPERIENCE")
  if (resume.experience.length === 0) {
    lines.push("- Add your relevant work experience.")
  } else {
    resume.experience.forEach((entry) => {
      const role = clean(entry.role) || "Role"
      const company = clean(entry.company) || "Company"
      lines.push(`${role} | ${company}`)
      lines.push(joinDateRange(entry.startDate, entry.endDate))

      const bullets = splitBullets(entry.description)
      if (bullets.length === 0) {
        lines.push("- Add measurable achievements and scope.")
      } else {
        bullets.forEach((bullet) => lines.push(`- ${bullet}`))
      }
      lines.push("")
    })
  }

  lines.push("PROJECTS")
  if (resume.projects.length === 0) {
    lines.push("- Add relevant technical projects.")
  } else {
    resume.projects.forEach((project) => {
      const nameLine = clean(project.name) || "Project"
      lines.push(nameLine)

      const tech = project.tech.map(clean).filter(Boolean)
      if (tech.length > 0) {
        lines.push(`Tech Stack: ${tech.join(", ")}`)
      }
      if (project.link) {
        lines.push(`Link: ${clean(project.link)}`)
      }

      const bullets = splitBullets(project.description)
      if (bullets.length === 0) {
        lines.push("- Add project outcome, impact, and your contribution.")
      } else {
        bullets.forEach((bullet) => lines.push(`- ${bullet}`))
      }
      lines.push("")
    })
  }

  lines.push("EDUCATION")
  if (resume.education.length === 0) {
    lines.push("- Add degree, institution, and graduation year.")
  } else {
    resume.education
      .map(clean)
      .filter(Boolean)
      .forEach((item) => lines.push(`- ${item}`))
  }

  return `${lines.join("\n").trim()}\n`
}

export function downloadTechResumeTemplate(resume: ResumeData): string {
  if (typeof window === "undefined") {
    throw new Error("Resume download is only available in the browser.")
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  })

  const marginX = 14
  const marginY = 14
  const lineHeight = 5.2
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const contentWidth = pageWidth - marginX * 2
  let y = marginY

  const ensureSpace = (requiredHeight = lineHeight) => {
    if (y + requiredHeight <= pageHeight - marginY) return
    doc.addPage()
    y = marginY
  }

  const drawWrapped = (text: string, fontSize = 10, style: "normal" | "bold" = "normal") => {
    const value = clean(text)
    if (!value) return

    doc.setFont("helvetica", style)
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(value, contentWidth) as string[]

    lines.forEach((line) => {
      ensureSpace(lineHeight)
      doc.text(line, marginX, y)
      y += lineHeight
    })
  }

  const drawSectionHeading = (heading: string) => {
    ensureSpace(lineHeight * 2)
    if (y > marginY) y += 1
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text(toHeading(heading), marginX, y)
    y += lineHeight
  }

  const drawBullet = (text: string) => {
    const value = clean(text)
    if (!value) return

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    const bulletOffset = 4
    const wrapped = doc.splitTextToSize(value, contentWidth - bulletOffset) as string[]

    wrapped.forEach((line, index) => {
      ensureSpace(lineHeight)
      const prefix = index === 0 ? "- " : "  "
      doc.text(`${prefix}${line}`, marginX, y)
      y += lineHeight
    })
  }

  const drawBlankLine = () => {
    ensureSpace(lineHeight)
    y += lineHeight * 0.5
  }

  const name = clean(resume.personal.name) || "YOUR NAME"
  const title = clean(resume.personal.title) || "Software Engineer"
  const contactParts = [
    clean(resume.contact.email),
    clean(resume.contact.phone),
    clean(resume.contact.location),
    clean(resume.links.linkedin),
    clean(resume.links.github),
    clean(resume.links.portfolio)
  ].filter(Boolean)

  drawWrapped(name.toUpperCase(), 16, "bold")
  drawWrapped(title, 11, "normal")
  if (contactParts.length > 0) {
    drawWrapped(contactParts.join(" | "), 9, "normal")
  }
  drawBlankLine()

  drawSectionHeading("Summary")
  drawWrapped(clean(resume.personal.summary) || "Add a concise summary tailored to the target role.")

  drawSectionHeading("Technical Skills")
  drawWrapped(
    resume.skills.length > 0 ? resume.skills.map(clean).filter(Boolean).join(", ") : "Add core technologies and tools."
  )

  drawSectionHeading("Professional Experience")
  if (resume.experience.length === 0) {
    drawBullet("Add your relevant work experience.")
  } else {
    resume.experience.forEach((entry) => {
      drawWrapped(`${clean(entry.role) || "Role"} | ${clean(entry.company) || "Company"}`, 10, "bold")
      drawWrapped(joinDateRange(entry.startDate, entry.endDate), 9, "normal")

      const bullets = splitBullets(entry.description)
      if (bullets.length === 0) {
        drawBullet("Add measurable achievements and scope.")
      } else {
        bullets.forEach((bullet) => drawBullet(bullet))
      }
      drawBlankLine()
    })
  }

  drawSectionHeading("Projects")
  if (resume.projects.length === 0) {
    drawBullet("Add relevant technical projects.")
  } else {
    resume.projects.forEach((project) => {
      drawWrapped(clean(project.name) || "Project", 10, "bold")
      const tech = project.tech.map(clean).filter(Boolean)
      if (tech.length > 0) {
        drawWrapped(`Tech Stack: ${tech.join(", ")}`, 9, "normal")
      }
      if (project.link) {
        drawWrapped(`Link: ${clean(project.link)}`, 9, "normal")
      }

      const bullets = splitBullets(project.description)
      if (bullets.length === 0) {
        drawBullet("Add project outcome, impact, and your contribution.")
      } else {
        bullets.forEach((bullet) => drawBullet(bullet))
      }
      drawBlankLine()
    })
  }

  drawSectionHeading("Education")
  if (resume.education.length === 0) {
    drawBullet("Add degree, institution, and graduation year.")
  } else {
    resume.education
      .map(clean)
      .filter(Boolean)
      .forEach((item) => drawBullet(item))
  }

  const fileName = makeDownloadFileName(resume.personal.name)
  doc.save(fileName)
  return fileName
}
