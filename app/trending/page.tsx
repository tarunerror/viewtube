"use client"

import { useState, useEffect } from "react"
import { InfiniteVideoGrid } from "@/components/infinite-video-grid"
import { CountrySelector } from "@/components/country-selector"
import type { VideoData } from "@/lib/types"

export default function TrendingPage() {
  const [country, setCountry] = useState("IN")
  const [initialVideos, setInitialVideos] = useState<VideoData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInitialVideos = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/videos/trending?country=${country}`)
        if (!response.ok) throw new Error('Failed to fetch trending videos')
        const data = await response.json()
        setInitialVideos(data.videos)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trending videos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialVideos()
  }, [country])

  if (isLoading) {
    return (
      <main className="container-custom py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold">Trending Videos</h1>
          <CountrySelector onCountryChange={setCountry} selectedCountry={country} />
        </div>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold">Trending Videos</h1>
          <CountrySelector onCountryChange={setCountry} selectedCountry={country} />
        </div>
        <div className="text-red-500">Error: {error}</div>
      </main>
    )
  }

  return (
    <main className="container-custom py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">Trending Videos</h1>
        <CountrySelector onCountryChange={setCountry} selectedCountry={country} />
      </div>
      <InfiniteVideoGrid 
        initialVideos={initialVideos} 
        fetchMoreVideos={async (pageToken) => {
          const response = await fetch(`/api/videos/trending?pageToken=${pageToken || ''}&country=${country}`)
          if (!response.ok) throw new Error('Failed to fetch videos')
          return response.json()
        }}
      />
    </main>
  )
}
