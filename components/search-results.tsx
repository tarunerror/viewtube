"use client"

import { useState, useEffect } from "react"
import { VideoCard } from "@/components/video-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { VideoData } from "@/lib/types"

interface SearchResultsProps {
  query: string
}

export function SearchResults({ query }: SearchResultsProps) {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true)
        setError(null)

        // Fetch videos from API
        const response = await fetch(`/api/videos/search?q=${encodeURIComponent(query)}`)

        if (!response.ok) {
          throw new Error(`Failed to search videos: ${response.status}`)
        }

        const fetchedVideos = await response.json()
        setVideos(fetchedVideos)
      } catch (err) {
        console.error("Error searching videos:", err)
        setError("Failed to load search results. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [query])

  if (loading) {
    return <SearchSkeleton />
  }

  if (error) {
    return <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">{error}</div>
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-xl font-semibold mb-2">No results found</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          We couldn't find any videos matching "{query}". Try different keywords or check your spelling.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  )
}

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array(12)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
    </div>
  )
}
