import type { VideoData } from "./types"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"

// Get popular videos for the home page
export async function getPopularVideos(pageToken?: string): Promise<{ videos: VideoData[], nextPageToken?: string }> {
  try {
    const session = await getServerSession(authOptions)
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
      throw new Error("YouTube API key not configured")
    }

    const response = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=IN&maxResults=12&pageToken=${pageToken || ''}&key=${apiKey}`
    )

    if (!response.ok) {
      throw new Error("Failed to fetch popular videos")
    }

    const data = await response.json()
    return {
      videos: data.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        viewCount: parseInt(item.statistics.viewCount),
        duration: item.contentDetails.duration,
      })),
      nextPageToken: data.nextPageToken
    }
  } catch (error) {
    console.error("Error getting popular videos:", error)
    throw error
  }
}

// Get trending videos with optional country code
export async function getTrendingVideos(countryCode = "IN", pageToken?: string): Promise<{ videos: VideoData[], nextPageToken?: string }> {
  try {
    const session = await getServerSession(authOptions)
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
      throw new Error("YouTube API key not configured")
    }

    const regionCode = countryCode === "global" ? "US" : countryCode.toUpperCase()
    const response = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=${regionCode}&maxResults=20&pageToken=${pageToken || ''}&key=${apiKey}`
    )

    if (!response.ok) {
      throw new Error("Failed to fetch trending videos")
    }

    const data = await response.json()
    return {
      videos: data.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        viewCount: parseInt(item.statistics.viewCount),
        duration: item.contentDetails.duration,
      })),
      nextPageToken: data.nextPageToken
    }
  } catch (error) {
    console.error("Error getting trending videos:", error)
    throw error
  }
}

// Get watch later videos
export async function getWatchLaterVideos(): Promise<VideoData[]> {
  // In a real app, this would fetch from a database
  // For now, return empty array (client-side will handle localStorage)
  return []
}

// Get liked videos
export async function getLikedVideos(): Promise<VideoData[]> {
  // In a real app, this would fetch from a database
  // For now, return empty array (client-side will handle localStorage)
  return []
}

// Get video details
export async function getVideoDetails(id: string): Promise<VideoData> {
  try {
    const session = await getServerSession(authOptions)
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
      throw new Error("YouTube API key not configured")
    }

    const response = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${id}&key=${apiKey}`
    )

    if (!response.ok) {
      throw new Error("Failed to fetch video details")
    }

    const data = await response.json()
    const item = data.items[0]

    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(item.statistics.viewCount),
      duration: item.contentDetails.duration,
    }
  } catch (error) {
    console.error("Error getting video details:", error)
    throw error
  }
}

// Get related videos
export async function getRelatedVideos(videoId: string): Promise<VideoData[]> {
  try {
    const session = await getServerSession(authOptions)
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
      throw new Error("YouTube API key not configured")
    }

    // First, get the related video IDs
    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&relatedToVideoId=${videoId}&type=video&maxResults=8&key=${apiKey}`
    )

    if (!searchResponse.ok) {
      console.error("Failed to fetch related videos (search)", await searchResponse.text())
      throw new Error("Failed to fetch related videos")
    }

    const searchData = await searchResponse.json()
    console.log('YouTube related searchData.items:', searchData.items)
    const videoIds = searchData.items
      .map((item: any) => (item.id.videoId || item.id))
      .filter(Boolean)
      .join(",")

    if (!videoIds) {
      return []
    }

    // Then, get the complete video data
    const videosResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`
    )

    if (!videosResponse.ok) {
      // Fallback: return basic info from searchData
      console.error("Failed to fetch related video details", await videosResponse.text())
      return searchData.items.map((item: any) => ({
        id: item.id.videoId || item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        viewCount: 0,
        duration: "",
      }))
    }

    const videosData = await videosResponse.json()
    return videosData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(item.statistics.viewCount),
      duration: item.contentDetails.duration,
    }))
  } catch (error) {
    console.error("Error getting related videos:", error)
    // Fallback: return empty array instead of throwing
    return []
  }
}

// Search videos
export async function getSearchResults(query: string): Promise<VideoData[]> {
  if (!query) return []

  try {
    const session = await getServerSession(authOptions)
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
      throw new Error("YouTube API key not configured")
    }

    const response = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=12&key=${apiKey}`
    )

    if (!response.ok) {
      throw new Error("Failed to search videos")
    }

    const data = await response.json()
    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      viewCount: 0, // This would require an additional API call
      duration: "", // This would require an additional API call
    }))
  } catch (error) {
    console.error("Error searching videos:", error)
    throw error
  }
}
