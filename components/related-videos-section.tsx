"use client"

import { useState, useEffect } from "react"
import { VideoCard } from "@/components/video-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { VideoData } from "@/lib/types"

export default function RelatedVideosSection({ videoId }: { videoId: string }) {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRelatedVideos() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/videos/related/${videoId}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch related videos: ${response.status}`)
        }

        const relatedVideos = await response.json()
        setVideos(relatedVideos)
      } catch (err) {
        console.error("Error fetching related videos:", err)
        setError("Failed to load related videos. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedVideos()
  }, [videoId])

  if (loading) {
    return <RelatedVideosSkeleton />
  }

  if (error) {
    return <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">{error}</div>
  }

  if (videos.length === 0) {
    return <div>No related videos found</div>
  }

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          className="flex flex-col sm:flex-row gap-3"
          aspectRatio="video"
          width={180}
          height={100}
        />
      ))}
    </div>
  )
}

function RelatedVideosSkeleton() {
  return (
    <div className="space-y-4">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-24 w-40 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
    </div>
  )
}
