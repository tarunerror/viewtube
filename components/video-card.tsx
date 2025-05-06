"use client"

import Link from "next/link"
import Image from "next/image"
import { VideoActions } from "@/components/video-actions"
import { cn } from "@/lib/utils"
import type { VideoData } from "@/lib/types"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"

interface VideoCardProps {
  video: VideoData
  className?: string
  aspectRatio?: "portrait" | "square" | "video"
  width?: number
  height?: number
}

export function VideoCard({ video, className, aspectRatio = "video", width, height }: VideoCardProps) {
  // Determine if we're using a placeholder image
  const isPlaceholder = video.thumbnailUrl.includes("/placeholder.svg")

  return (
    <motion.div
      className={cn("space-y-3 group", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03 }}
    >
      <div className="relative overflow-hidden rounded-lg">
        <Link href={`/watch/${video.id}`} className="block">
          <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
            <Image
              src={video.thumbnailUrl || "/placeholder.svg"}
              alt={video.title}
              width={width || 500}
              height={height || 280}
              className={cn(
                "h-auto w-full object-cover",
                aspectRatio === "portrait" && "aspect-[3/4]",
                aspectRatio === "square" && "aspect-square",
                aspectRatio === "video" && "aspect-video",
                isPlaceholder && "bg-secondary",
              )}
            />
          </motion.div>
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white rounded">
              {video.duration}
            </div>
          )}
        </Link>
        <motion.div
          className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 0 }}
          whileHover={{ opacity: 1, y: 0 }}
        >
          <VideoActions video={video} className="flex gap-1" />
        </motion.div>
      </div>
      <div className="space-y-1">
        <Link href={`/watch/${video.id}`} className="block">
          <h3 className="font-medium leading-tight line-clamp-2 hover:text-primary transition-colors">{video.title}</h3>
        </Link>
        <div className="text-sm text-muted-foreground">
          <p>{video.channelTitle}</p>
          <div className="flex items-center gap-1">
            <span>{video.viewCount.toLocaleString()} views</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
