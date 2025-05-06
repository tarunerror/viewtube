"use client"

import { useState, useEffect } from "react"
import { InfiniteVideoGrid } from "@/components/infinite-video-grid"
import type { VideoData } from "@/lib/types"

export default function Home() {
  const [initialVideos, setInitialVideos] = useState<VideoData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInitialVideos = async () => {
      try {
        const response = await fetch('/api/videos/popular')
        if (!response.ok) throw new Error('Failed to fetch initial videos')
        const data = await response.json()
        setInitialVideos(data.videos)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load videos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialVideos()
  }, [])

  if (isLoading) {
    return (
      <main className="container-custom py-8">
        <h1 className="text-3xl font-bold mb-8">Popular Videos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-lg mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container-custom py-8">
        <h1 className="text-3xl font-bold mb-8">Popular Videos</h1>
        <div className="text-red-500">Error: {error}</div>
      </main>
    )
  }

  return (
    <main className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Popular Videos</h1>
      <InfiniteVideoGrid 
        initialVideos={initialVideos} 
        fetchMoreVideos={async (pageToken) => {
          const response = await fetch(`/api/videos/popular?pageToken=${pageToken || ''}`)
          if (!response.ok) throw new Error('Failed to fetch videos')
          return response.json()
        }}
      />
    </main>
  )
}
