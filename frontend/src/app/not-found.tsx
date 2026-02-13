import Link from "next/link"

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold text-[#10243e]">Page Not Found</h1>
      <p className="mt-2 text-sm text-[#58708a]">The URL may be incorrect or no longer available.</p>
      <Link href="/" className="mt-6 inline-flex rounded-xl bg-[#0f4c81] px-4 py-2 text-sm font-semibold text-white">
        Back to Home
      </Link>
    </main>
  )
}
