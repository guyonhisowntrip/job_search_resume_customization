import { Skeleton } from "@/components/ui/skeleton"

export default function PublicPortfolioLoading() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Skeleton className="h-12 w-72" />
      <Skeleton className="mt-4 h-80 w-full" />
      <Skeleton className="mt-4 h-60 w-full" />
    </main>
  )
}
