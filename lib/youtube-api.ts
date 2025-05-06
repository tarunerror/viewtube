import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import type { VideoData } from "./types"

// Function to fetch videos from YouTube API with authentication
async function fetchFromYouTubeAPI(endpoint: string, params: Record<string, string> = {}) {
  const session = await getServerSession(authOptions)

  // Base URL for YouTube API
  const baseUrl = "https://www.googleapis.com/youtube/v3"

  // Prepare URL with parameters
  const url = new URL(`${baseUrl}/${endpoint}`)

  // Add API key for unauthenticated requests
  if (!session?.accessToken) {
    url.searchParams.append("key", process.env.YOUTUBE_API_KEY || "")
  }

  // Add other parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  // Fetch data with authentication if available
  const headers: HeadersInit = {}
  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`
  }

  const response = await fetch(url.toString(), { headers })

  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Convert YouTube API video item to our VideoData format
function convertYouTubeVideoToVideoData(item: any): VideoData {
  const { id, snippet, contentDetails, statistics } = item

  // Handle different ID formats (string or object with videoId)
  const videoId = typeof id === "string" ? id : id.videoId

  // Format duration from ISO 8601 to readable format
  let duration = "0:00"
  if (contentDetails?.duration) {
    const match = contentDetails.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (match) {
      const hours = match[1] ? Number.parseInt(match[1]) : 0
      const minutes = match[2] ? Number.parseInt(match[2]) : 0
      const seconds = match[3] ? Number.parseInt(match[3]) : 0

      if (hours > 0) {
        duration = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      } else {
        duration = `${minutes}:${seconds.toString().padStart(2, "0")}`
      }
    }
  }

  return {
    id: videoId,
    title: snippet.title,
    description: snippet.description || "",
    thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url,
    duration,
    views: Number.parseInt(statistics?.viewCount || "0"),
    likes: Number.parseInt(statistics?.likeCount || "0"),
    publishedAt: snippet.publishedAt,
    channelName: snippet.channelTitle,
    channelAvatar: `/api/channel-avatar/${snippet.channelId}`,
    subscribers: 0, // Not available in this API response
  }
}

// Fetch home page videos (recommended for the user)
export async function fetchHomePageVideosAPI(): Promise<VideoData[]> {
  try {
    const session = await getServerSession(authOptions)

    // If user is authenticated, fetch from their feed
    if (session?.accessToken) {
      const data = await fetchFromYouTubeAPI("activities", {
        part: "snippet,contentDetails",
        mine: "true",
        maxResults: "20",
      })

      // Filter for video activities and extract video IDs
      const videoIds = data.items
        .filter(
          (item: any) =>
            item.snippet &&
            (item.snippet.type === "upload" ||
              item.snippet.type === "recommendation" ||
              (item.contentDetails && item.contentDetails.upload)),
        )
        .map((item: any) => {
          if (item.contentDetails && item.contentDetails.upload) {
            return item.contentDetails.upload.videoId
          }
          if (item.contentDetails && item.contentDetails.recommendation) {
            return item.contentDetails.recommendation.resourceId.videoId
          }
          return null
        })
        .filter(Boolean)
        .slice(0, 16)

      // If we have video IDs, fetch the full video details
      if (videoIds.length > 0) {
        const videoData = await fetchFromYouTubeAPI("videos", {
          part: "snippet,contentDetails,statistics",
          id: videoIds.join(","),
        })

        return videoData.items.map(convertYouTubeVideoToVideoData)
      }
    }

    // Fallback to popular videos if no authenticated feed or no videos in feed
    const data = await fetchFromYouTubeAPI("videos", {
      part: "snippet,contentDetails,statistics",
      chart: "mostPopular",
      maxResults: "16",
      regionCode: "US",
    })

    return data.items.map(convertYouTubeVideoToVideoData)
  } catch (error) {
    console.error("Error fetching home page videos from API:", error)
    throw error
  }
}

// Fetch trending videos
export async function fetchTrendingVideosAPI(regionCode = "US"): Promise<VideoData[]> {
  try {
    const data = await fetchFromYouTubeAPI("videos", {
      part: "snippet,contentDetails,statistics",
      chart: "mostPopular",
      maxResults: "20",
      regionCode,
    })

    return data.items.map(convertYouTubeVideoToVideoData)
  } catch (error) {
    console.error("Error fetching trending videos from API:", error)
    throw error
  }
}

// Fetch video details
export async function fetchVideoDetailsAPI(videoId: string): Promise<VideoData> {
  try {
    const data = await fetchFromYouTubeAPI("videos", {
      part: "snippet,contentDetails,statistics",
      id: videoId,
    })

    if (!data.items || data.items.length === 0) {
      throw new Error(`Video with ID ${videoId} not found`)
    }

    return convertYouTubeVideoToVideoData(data.items[0])
  } catch (error) {
    console.error("Error fetching video details from API:", error)
    throw error
  }
}

// Fetch related videos
export async function fetchRelatedVideosAPI(videoId: string): Promise<VideoData[]> {
  try {
    const data = await fetchFromYouTubeAPI("search", {
      part: "snippet",
      relatedToVideoId: videoId,
      type: "video",
      maxResults: "15",
    })

    // For search results, we need to fetch additional details
    const videoIds = data.items.map((item: any) => item.id.videoId).join(",")

    if (!videoIds) {
      return []
    }

    const videoData = await fetchFromYouTubeAPI("videos", {
      part: "snippet,contentDetails,statistics",
      id: videoIds,
    })

    return videoData.items.map(convertYouTubeVideoToVideoData)
  } catch (error) {
    console.error("Error fetching related videos from API:", error)
    throw error
  }
}

// Search videos
export async function searchVideosAPI(query: string): Promise<VideoData[]> {
  try {
    const data = await fetchFromYouTubeAPI("search", {
      part: "snippet",
      q: query,
      type: "video",
      maxResults: "20",
    })

    // For search results, we need to fetch additional details
    const videoIds = data.items.map((item: any) => item.id.videoId).join(",")

    if (!videoIds) {
      return []
    }

    const videoData = await fetchFromYouTubeAPI("videos", {
      part: "snippet,contentDetails,statistics",
      id: videoIds,
    })

    return videoData.items.map(convertYouTubeVideoToVideoData)
  } catch (error) {
    console.error("Error searching videos from API:", error)
    throw error
  }
}
