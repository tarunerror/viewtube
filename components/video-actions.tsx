"use client"

import { useState, useEffect } from "react"
import { Clock, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import type { VideoData } from "@/lib/types"

interface VideoActionsProps {
  video: VideoData
  className?: string
}

export function VideoActions({ video, className }: VideoActionsProps) {
  const [isInWatchLater, setIsInWatchLater] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  // Check if video is in watch later or liked on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Check watch later status
        const watchLaterItems = localStorage.getItem("watch-later")
        if (watchLaterItems) {
          const watchLaterVideos = JSON.parse(watchLaterItems)
          setIsInWatchLater(watchLaterVideos.some((v: VideoData) => v.id === video.id))
        }

        // Check liked status
        const likedItems = localStorage.getItem("liked-videos")
        if (likedItems) {
          const likedVideos = JSON.parse(likedItems)
          setIsLiked(likedVideos.some((v: VideoData) => v.id === video.id))
        }
      } catch (error) {
        console.error("Error loading video status:", error)
      }
    }
  }, [video.id])

  const toggleWatchLater = () => {
    if (typeof window !== "undefined") {
      try {
        const newStatus = !isInWatchLater
        setIsInWatchLater(newStatus)

        // Get current watch later videos
        const watchLaterItems = localStorage.getItem("watch-later")
        let watchLaterVideos = watchLaterItems ? JSON.parse(watchLaterItems) : []

        if (newStatus) {
          // Add to watch later if not already there
          if (!watchLaterVideos.some((v: VideoData) => v.id === video.id)) {
            watchLaterVideos.push(video)
          }
        } else {
          // Remove from watch later
          watchLaterVideos = watchLaterVideos.filter((v: VideoData) => v.id !== video.id)
        }

        // Save back to localStorage
        localStorage.setItem("watch-later", JSON.stringify(watchLaterVideos))

        toast({
          title: newStatus ? "Added to Watch Later" : "Removed from Watch Later",
          description: newStatus
            ? "Video added to your Watch Later playlist"
            : "Video removed from your Watch Later playlist",
        })
      } catch (error) {
        console.error("Error updating watch later:", error)
        toast({
          title: "Error",
          description: "Failed to update Watch Later status",
          variant: "destructive",
        })
      }
    }
  }

  const toggleLike = () => {
    if (typeof window !== "undefined") {
      try {
        const newStatus = !isLiked
        setIsLiked(newStatus)

        // Get current liked videos
        const likedItems = localStorage.getItem("liked-videos")
        let likedVideos = likedItems ? JSON.parse(likedItems) : []

        if (newStatus) {
          // Add to liked if not already there
          if (!likedVideos.some((v: VideoData) => v.id === video.id)) {
            likedVideos.push(video)
          }
        } else {
          // Remove from liked
          likedVideos = likedVideos.filter((v: VideoData) => v.id !== video.id)
        }

        // Save back to localStorage
        localStorage.setItem("liked-videos", JSON.stringify(likedVideos))

        toast({
          title: newStatus ? "Added to liked videos" : "Removed from liked videos",
          description: newStatus ? "Video added to your liked videos" : "Video removed from your liked videos",
        })
      } catch (error) {
        console.error("Error updating liked status:", error)
        toast({
          title: "Error",
          description: "Failed to update liked status",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className={className}>
      <Button
        size="icon"
        variant={isInWatchLater ? "default" : "secondary"}
        className="h-8 w-8 bg-black/50 hover:bg-black/70"
        title={isInWatchLater ? "Remove from Watch Later" : "Add to Watch Later"}
        onClick={toggleWatchLater}
      >
        <Clock className="h-4 w-4" />
        <span className="sr-only">{isInWatchLater ? "Remove from Watch Later" : "Add to Watch Later"}</span>
      </Button>
      <Button
        size="icon"
        variant={isLiked ? "default" : "secondary"}
        className="h-8 w-8 bg-black/50 hover:bg-black/70"
        title={isLiked ? "Unlike Video" : "Like Video"}
        onClick={toggleLike}
      >
        <ThumbsUp className="h-4 w-4" />
        <span className="sr-only">{isLiked ? "Unlike Video" : "Like Video"}</span>
      </Button>
    </div>
  )
}
