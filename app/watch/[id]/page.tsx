import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { VideoPlayer } from "@/components/video-player"
import VideoDetails from "@/components/video-details"
import RelatedVideosSection from "@/components/related-videos-section"

export default function WatchPage({ params }: { params: { id: string } }) {
  const videoId = params.id

  return (
    <div className="container py-4 md:py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VideoPlayer videoId={videoId} title="Loading..." />
          <Suspense fallback={<VideoDetailsSkeleton />}>
            <VideoDetails videoId={videoId} />
          </Suspense>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Related Videos</h2>
          <Suspense fallback={<RelatedVideosSkeleton />}>
            <RelatedVideosSection videoId={videoId} />
          </Suspense>
        </div>
      </div>
    </div>
  )
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
