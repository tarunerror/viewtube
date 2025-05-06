import { Suspense } from "react"
import { SearchResults } from "@/components/search-results"
import { SearchSkeleton } from "@/components/search-skeleton"

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q: string }
}) {
  const query = searchParams.q || ""

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">
        Search results for: <span className="text-primary">{query}</span>
      </h1>

      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults query={query} />
      </Suspense>
    </div>
  )
}
