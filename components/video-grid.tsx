import { VideoCard } from "@/components/video-card"
import type { VideoData } from "@/lib/types"

interface VideoGridProps {
  videos: VideoData[]
}

export default function VideoGrid({ videos }: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  )
}
