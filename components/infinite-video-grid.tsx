import { useEffect, useState } from "react"
import { VideoData } from "@/lib/types"
import { VideoCard } from "./video-card"
import { useInView } from "react-intersection-observer"

interface InfiniteVideoGridProps {
  initialVideos: VideoData[]
  fetchMoreVideos: (pageToken?: string) => Promise<{ videos: VideoData[], nextPageToken?: string }>
  className?: string
}

export function InfiniteVideoGrid({ initialVideos, fetchMoreVideos, className = "" }: InfiniteVideoGridProps) {
  const [videos, setVideos] = useState<VideoData[]>(initialVideos)
  const [nextPageToken, setNextPageToken] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const { ref, inView } = useInView()

  useEffect(() => {
    setVideos(initialVideos)
  }, [initialVideos])

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMoreVideos()
    }
  }, [inView])

  const loadMoreVideos = async () => {
    try {
      setIsLoading(true)
      const { videos: newVideos, nextPageToken: newNextPageToken } = await fetchMoreVideos(nextPageToken)
      
      if (newVideos.length === 0) {
        setHasMore(false)
        return
      }

      setVideos(prev => {
        const existingIds = new Set(prev.map(v => v.id))
        const uniqueNewVideos = newVideos.filter(v => !existingIds.has(v.id))
        return [...prev, ...uniqueNewVideos]
      })
      
      setNextPageToken(newNextPageToken)
      setHasMore(!!newNextPageToken)
    } catch (error) {
      console.error("Error loading more videos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {videos.map((video) => (
        <VideoCard key={`${video.id}-${video.publishedAt}`} video={video} />
      ))}
      <div ref={ref} className="col-span-full flex justify-center py-4">
        {isLoading && (
          <div className="loading-spinner h-8 w-8" />
        )}
      </div>
    </div>
  )
} 