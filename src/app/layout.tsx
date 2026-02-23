import type { Metadata } from "next"

import { AppProvider } from "@/components/providers/app-provider"
import "@/styles/globals.css"

export const metadata: Metadata = {
  title: {
    default: "OneTapp Resume Portfolio",
    template: "%s | OneTapp"
  },
  description:
    "Transform your resume into a clean, deployable portfolio in minutes with a guided flow for upload, editing, template selection, and deployment."
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#f3f7fc] text-[#10243e] antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
