"use client"

import { useState, useEffect } from "react"
import { VideoInfo } from "@/components/video-info"
import { Skeleton } from "@/components/ui/skeleton"
import type { VideoData } from "@/lib/types"

export default function VideoDetails({ videoId }: { videoId: string }) {
  const [video, setVideo] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchVideoDetails() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/videos/details/${videoId}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch video details: ${response.status}`)
        }

        const videoData = await response.json()
        setVideo(videoData)
      } catch (err) {
        console.error("Error fetching video details:", err)
        setError("Failed to load video details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchVideoDetails()
  }, [videoId])

  if (loading) {
    return <VideoDetailsSkeleton />
  }

  if (error) {
    return <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mt-4">{error}</div>
  }

  if (!video) {
    return <div className="mt-4">Video not found</div>
  }

  return <VideoInfo video={video} />
}

function VideoDetailsSkeleton() {
  return (
    <div className="mt-4 space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24 mt-1" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-16 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  )
}
