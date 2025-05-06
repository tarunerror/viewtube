"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { ThumbsUp, ThumbsDown, Share2, Flag, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import type { VideoData } from "@/lib/types"

interface VideoInfoProps {
  video: VideoData
}

export function VideoInfo({ video }: VideoInfoProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [isInWatchLater, setIsInWatchLater] = useState(false)

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

  const toggleLike = () => {
    if (typeof window !== "undefined") {
      try {
        const newStatus = !isLiked
        setIsLiked(newStatus)
        if (isDisliked) setIsDisliked(false)

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
      }
    }
  }

  const toggleDislike = () => {
    setIsDisliked(!isDisliked)
    if (isLiked) setIsLiked(false)
  }

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
      }
    }
  }

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: video.title,
          url: `${window.location.origin}/watch/${video.id}`,
        })
        .catch((err) => {
          console.error("Error sharing:", err)
        })
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard
        .writeText(`${window.location.origin}/watch/${video.id}`)
        .then(() => {
          toast({
            title: "Link copied",
            description: "Video link copied to clipboard",
          })
        })
        .catch((err) => {
          console.error("Error copying to clipboard:", err)
        })
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <h1 className="text-xl font-bold md:text-2xl">{video.title}</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`/api/channel-avatar/${video.channelId}`} alt={video.channelTitle} />
            <AvatarFallback>{video.channelTitle.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{video.channelTitle}</h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant={isLiked ? "default" : "secondary"} size="sm" className="gap-1.5" onClick={toggleLike}>
            <ThumbsUp className="h-4 w-4" />
            <span>Like</span>
          </Button>

          <Button variant={isDisliked ? "default" : "secondary"} size="sm" onClick={toggleDislike}>
            <ThumbsDown className="h-4 w-4" />
          </Button>

          <Button
            variant={isInWatchLater ? "default" : "secondary"}
            size="sm"
            className="gap-1.5"
            onClick={toggleWatchLater}
          >
            <Clock className="h-4 w-4" />
            <span>Watch Later</span>
          </Button>

          <Button variant="secondary" size="sm" className="gap-1.5" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>

          <Button variant="secondary" size="sm" className="gap-1.5">
            <Flag className="h-4 w-4" />
            <span>Report</span>
          </Button>
        </div>
      </div>

      <Separator />

      <div className="rounded-lg bg-secondary/50 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>{video.viewCount.toLocaleString()} views</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}</span>
        </div>

        <div className={isDescriptionExpanded ? "" : "line-clamp-3"}>
          <p className="whitespace-pre-line">{video.description}</p>
        </div>

        {video.description.split("\n").length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 px-0"
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          >
            {isDescriptionExpanded ? "Show less" : "Show more"}
          </Button>
        )}
      </div>
    </div>
  )
}
