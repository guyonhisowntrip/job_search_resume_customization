import { Skeleton } from "@/components/ui/skeleton"

export default function RootLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </main>
  )
}
