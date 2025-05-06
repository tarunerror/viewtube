"use client"

import { useState, useEffect } from "react"
import VideoGrid from "@/components/video-grid"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import type { VideoData } from "@/lib/types"

export default function WatchLaterPage() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll check localStorage
    const loadWatchLater = () => {
      try {
        if (typeof window !== "undefined") {
          const savedVideos = localStorage.getItem("watch-later")
          if (savedVideos) {
            setVideos(JSON.parse(savedVideos))
          }
        }
      } catch (error) {
        console.error("Error loading watch later videos:", error)
      } finally {
        setLoading(false)
      }
    }

    loadWatchLater()
  }, [])

  if (loading) {
    return <div className="container py-6">Loading...</div>
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Watch Later</h1>

      {videos.length > 0 ? (
        <VideoGrid videos={videos} />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-secondary/30 p-4 rounded-full mb-4">
            <Info className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your watch later list is empty</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Save videos to watch later by clicking the clock icon on any video
          </p>
          <Button href="/" variant="default">
            Browse videos
          </Button>
        </div>
      )}
    </div>
  )
}
