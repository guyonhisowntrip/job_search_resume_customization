"use client"

import { PortfolioProvider } from "./portfolio-context"
import type { ResumeData } from "./resume-schema"
import { ThemeProvider } from "./components/theme-provider"
import { InsightsProvider } from "./components/insights-context"
import { IntentTracker } from "./components/intent-tracker"
import { Navigation } from "./components/navigation"
import { HeroSection } from "./components/hero-section"
import { AboutSection } from "./components/about-section"
import { ProjectsSection } from "./components/projects-section"
import { ExperienceSection } from "./components/experience-section"
import { SkillsSection } from "./components/skills-section"
import { ResearchSection } from "./components/research-section"
import { AchievementsSection } from "./components/achievements-section"
import { ResumeTailorSection } from "./components/resume-tailor-section"
import { ContactSection } from "./components/contact-section"
import { Footer } from "./components/footer"
import { AiChatWidget } from "./components/ai-chat-widget"

export default function PortfolioTemplateV1({ resumeData }: { resumeData: ResumeData }) {
  return (
    <PortfolioProvider resumeData={resumeData}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <InsightsProvider>
          <main className="min-h-screen">
            <IntentTracker />
            <Navigation />
            <HeroSection />
            <AboutSection />
            <ProjectsSection
              variant="featured"
              title="Flagship AI Systems"
              subtitle="Recruiter-ready projects with measurable impact and deep technical notes."
            />
            <ExperienceSection />
            <SkillsSection />
            <ResearchSection />
            <AchievementsSection />
            <ResumeTailorSection />
            <ContactSection />
            <Footer />
            <AiChatWidget />
          </main>
        </InsightsProvider>
      </ThemeProvider>
    </PortfolioProvider>
  )
}
