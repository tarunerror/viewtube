import { getRelatedVideos } from "@/lib/video-service"
import { VideoCard } from "@/components/video-card"

interface RelatedVideosProps {
  videoId: string
}

export async function RelatedVideos({ videoId }: RelatedVideosProps) {
  const videos = await getRelatedVideos(videoId)

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
