import type { VideoData } from "./types"

// This file contains functions to scrape YouTube data
// Note: Web scraping may violate YouTube's Terms of Service
// This is for educational purposes only

// Function to extract video ID from various YouTube URL formats
export function extractVideoId(url: string): string | null {
  // Handle youtu.be links
  const shortUrlRegex = /youtu\.be\/([a-zA-Z0-9_-]+)/
  const shortMatch = url.match(shortUrlRegex)
  if (shortMatch) return shortMatch[1]

  // Handle youtube.com links
  const standardRegex = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/
  const standardMatch = url.match(standardRegex)
  if (standardMatch) return standardMatch[1]

  // Handle youtube.com/embed links
  const embedRegex = /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/
  const embedMatch = url.match(embedRegex)
  if (embedMatch) return embedMatch[1]

  // If the input is just the ID
  const idRegex = /^[a-zA-Z0-9_-]{11}$/
  if (idRegex.test(url)) return url

  return null
}

// Simplified function to fetch only video title from YouTube
export async function fetchVideoTitle(videoId: string): Promise<string> {
  try {
    // Use our proxy endpoint instead of direct fetching
    const response = await fetch("/api/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }),
    })

    if (!response.ok) {
      console.error(`Failed to fetch video data: ${response.status}`)
      return `Video ${videoId}`
    }

    const proxyResponse = await response.json()

    if (proxyResponse.status !== 200) {
      console.error(`Proxy returned error: ${proxyResponse.status}`)
      return `Video ${videoId}`
    }

    const html = proxyResponse.data

    // Try to extract title from meta tags first (more reliable)
    const titleMetaRegex = /<meta\s+name="title"\s+content="([^"]+)"/
    const titleMetaMatch = html.match(titleMetaRegex)

    if (titleMetaMatch && titleMetaMatch[1]) {
      return titleMetaMatch[1]
    }

    // Fallback to title tag
    const titleTagRegex = /<title>([^<]+)<\/title>/
    const titleTagMatch = html.match(titleTagRegex)

    if (titleTagMatch && titleTagMatch[1]) {
      // Remove " - YouTube" suffix if present
      return titleTagMatch[1].replace(/ - YouTube$/, "")
    }

    return `Video ${videoId}`
  } catch (error) {
    console.error("Error fetching video title:", error)
    // Return a more informative fallback that includes the video ID
    return `Video ${videoId}`
  }
}

// Function to search YouTube
export async function searchYouTube(query: string): Promise<VideoData[]> {
  if (!query) return []

  try {
    // Use our proxy endpoint instead of direct fetching
    const response = await fetch("/api/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }),
    })

    if (!response.ok) {
      console.error(`Failed to fetch search results: ${response.status}`)
      return []
    }

    const proxyResponse = await response.json()

    if (proxyResponse.status !== 200) {
      console.error(`Proxy returned error: ${proxyResponse.status}`)
      return []
    }

    const html = proxyResponse.data

    // Extract initial data
    const initialDataRegex = /var\s+ytInitialData\s*=\s*({.+?})(?:;|<\/script>)/
    const match = html.match(initialDataRegex)

    if (!match) {
      console.error("Could not extract initial data from YouTube search page")
      return []
    }

    // Parse the JSON data with better error handling
    let initialData
    try {
      // Clean the JSON string before parsing
      const cleanData = match[1].replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) =>
        String.fromCharCode(Number.parseInt(hex, 16)),
      )

      initialData = JSON.parse(cleanData)
    } catch (e) {
      console.error("Failed to parse YouTube search data:", e)

      // Try an alternative approach
      try {
        const altRegex = /ytInitialData\s*=\s*({[\s\S]*?});/
        const altMatch = html.match(altRegex)

        if (altMatch) {
          initialData = Function(`return ${altMatch[1]}`)()
        } else {
          return []
        }
      } catch (fallbackError) {
        console.error("Failed fallback parsing:", fallbackError)
        return []
      }
    }

    // Extract search results
    const contents =
      initialData.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || []

    // Find the item list renderer which contains the search results
    let itemSectionRenderer = null
    for (const content of contents) {
      if (content.itemSectionRenderer) {
        itemSectionRenderer = content.itemSectionRenderer
        break
      }
    }

    if (!itemSectionRenderer) {
      console.error("Could not find item section renderer")
      return []
    }

    // Extract video renderers
    const videoRenderers = itemSectionRenderer.contents
      .filter((item: any) => item.videoRenderer)
      .map((item: any) => item.videoRenderer)

    // Convert to VideoData objects
    const videos: VideoData[] = videoRenderers.map((renderer: any) => {
      const videoId = renderer.videoId
      const title = renderer.title?.runs?.[0]?.text || "Unknown Title"
      const channelName = renderer.ownerText?.runs?.[0]?.text || "Unknown Channel"
      const channelId = renderer.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || ""

      // Extract view count
      let viewCount = 0
      const viewCountText = renderer.viewCountText?.simpleText || renderer.viewCountText?.runs?.[0]?.text || "0 views"
      const viewMatch = viewCountText.match(/[\d,]+/)
      if (viewMatch) {
        viewCount = Number.parseInt(viewMatch[0].replace(/,/g, ""))
      }

      // Extract duration
      let duration = "0:00"
      if (renderer.lengthText?.simpleText) {
        duration = renderer.lengthText.simpleText
      }

      // Extract publish time
      const publishedAt = renderer.publishedTimeText?.simpleText || new Date().toISOString()

      return {
        id: videoId,
        title,
        description: "",
        thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        duration,
        views: viewCount,
        likes: 0,
        publishedAt,
        channelName,
        channelAvatar: `/api/channel-avatar/${channelId}`,
        subscribers: 0,
      }
    })

    return videos
  } catch (error) {
    console.error("Error searching YouTube:", error)
    return []
  }
}

// Add this function to improve the reliability of YouTube scraping
function cleanHtml(html: string): string {
  // Remove problematic characters that might cause JSON parsing issues
  return html
    .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/\\u([0-9A-Fa-f]{4})/g, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/\\n/g, "")
    .replace(/\\r/g, "")
    .replace(/\\t/g, " ")
}

// Function to fetch trending videos with country option
export async function fetchTrendingVideos(countryCode = "global"): Promise<VideoData[]> {
  try {
    // Construct URL based on country code
    let url = "https://www.youtube.com/feed/trending"

    // Add country code if not global
    if (countryCode !== "global") {
      url = `https://www.youtube.com/feed/trending?gl=${countryCode}`
    }

    // Use our proxy endpoint instead of direct fetching
    const response = await fetch("/api/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept-Language": countryCode === "global" ? "en-US,en;q=0.9" : `${countryCode};q=0.9,en;q=0.8`,
        },
      }),
    })

    if (!response.ok) {
      console.error(`Failed to fetch trending videos: ${response.status}`)
      return []
    }

    const proxyResponse = await response.json()

    if (proxyResponse.status !== 200) {
      console.error(`Proxy returned error: ${proxyResponse.status}`)
      return []
    }

    const html = proxyResponse.data
    const cleanedHtml = cleanHtml(html)

    // Try multiple regex patterns to extract initial data
    const patterns = [
      /var\s+ytInitialData\s*=\s*({.+?})(?:;|<\/script>)/,
      /ytInitialData\s*=\s*({[\s\S]*?});/,
      /window\["ytInitialData"\]\s*=\s*({[\s\S]*?});/,
    ]

    let initialData = null

    for (const pattern of patterns) {
      const match = cleanedHtml.match(pattern)
      if (match) {
        try {
          initialData = JSON.parse(match[1])
          break
        } catch (e) {
          console.error(`Failed to parse with pattern ${pattern}:`, e)
          // Try next pattern
          continue
        }
      }
    }

    if (!initialData) {
      console.error("Could not extract initial data from YouTube trending page")
      return []
    }

    // Navigate through the data structure to find trending videos
    const tabs = initialData.contents?.twoColumnBrowseResultsRenderer?.tabs || []

    // Find the trending tab - try different possible identifiers
    const trendingTab = tabs.find(
      (tab: any) =>
        tab.tabRenderer?.endpoint?.browseEndpoint?.browseId === "FEtrending" ||
        tab.tabRenderer?.title === "Trending" ||
        tab.tabRenderer?.selected === true,
    )

    if (!trendingTab) {
      console.error("Could not find trending tab")
      return []
    }

    // Try different possible paths to the video content
    const possiblePaths = [
      trendingTab.tabRenderer?.content?.sectionListRenderer?.contents,
      trendingTab.tabRenderer?.content?.richGridRenderer?.contents,
      // Add more possible paths if needed
    ]

    let contents = []
    for (const path of possiblePaths) {
      if (path && Array.isArray(path) && path.length > 0) {
        contents = path
        break
      }
    }

    if (!contents.length) {
      console.error("Could not find video contents in YouTube trending data")
      return []
    }

    // Extract video renderers from all sections
    const videos: VideoData[] = []

    // Process each section
    for (const section of contents) {
      try {
        // Try different possible structures
        const itemSectionRenderer = section.itemSectionRenderer
        const richSectionRenderer = section.richSectionRenderer

        if (itemSectionRenderer) {
          // Process item section renderer
          for (const item of itemSectionRenderer.contents || []) {
            try {
              // Check different possible structures
              const videoRenderer = item.videoRenderer || item.gridVideoRenderer || item.compactVideoRenderer

              if (!videoRenderer) continue

              const videoId = videoRenderer.videoId
              if (!videoId) continue

              const title = videoRenderer.title?.runs?.[0]?.text || videoRenderer.title?.simpleText || "Unknown Title"

              const channelName =
                videoRenderer.ownerText?.runs?.[0]?.text ||
                videoRenderer.shortBylineText?.runs?.[0]?.text ||
                "Unknown Channel"

              const channelId =
                videoRenderer.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
                videoRenderer.shortBylineText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
                ""

              // Extract view count
              let viewCount = 0
              const viewCountText =
                videoRenderer.viewCountText?.simpleText || videoRenderer.viewCountText?.runs?.[0]?.text || "0 views"
              const viewMatch = viewCountText.match(/[\d,]+/)
              if (viewMatch) {
                viewCount = Number.parseInt(viewMatch[0].replace(/,/g, ""))
              }

              // Extract duration
              let duration = "0:00"
              if (videoRenderer.lengthText?.simpleText) {
                duration = videoRenderer.lengthText.simpleText
              } else if (videoRenderer.thumbnailOverlays) {
                const overlay = videoRenderer.thumbnailOverlays.find((o: any) => o.thumbnailOverlayTimeStatusRenderer)
                if (overlay?.thumbnailOverlayTimeStatusRenderer?.text?.simpleText) {
                  duration = overlay.thumbnailOverlayTimeStatusRenderer.text.simpleText
                }
              }

              // Extract publish time
              const publishedAt = videoRenderer.publishedTimeText?.simpleText || "Recently"

              videos.push({
                id: videoId,
                title,
                description: "",
                thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
                duration,
                views: viewCount,
                likes: 0,
                publishedAt,
                channelName,
                channelAvatar: `/api/channel-avatar/${channelId}`,
                subscribers: 0,
              })
            } catch (itemError) {
              console.error("Error processing trending video item:", itemError)
              // Continue to next item
              continue
            }
          }
        } else if (richSectionRenderer) {
          // Process rich section renderer if present
          const content = richSectionRenderer.content
          if (content?.richShelfRenderer?.contents) {
            for (const item of content.richShelfRenderer.contents) {
              try {
                const videoRenderer = item.richItemRenderer?.content?.videoRenderer
                if (!videoRenderer) continue

                const videoId = videoRenderer.videoId
                if (!videoId) continue

                // Process similar to above...
                const title = videoRenderer.title?.runs?.[0]?.text || "Unknown Title"
                const channelName = videoRenderer.ownerText?.runs?.[0]?.text || "Unknown Channel"
                const channelId = videoRenderer.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || ""

                // Extract view count
                let viewCount = 0
                const viewCountText = videoRenderer.viewCountText?.simpleText || "0 views"
                const viewMatch = viewCountText.match(/[\d,]+/)
                if (viewMatch) {
                  viewCount = Number.parseInt(viewMatch[0].replace(/,/g, ""))
                }

                // Extract duration
                let duration = "0:00"
                if (videoRenderer.lengthText?.simpleText) {
                  duration = videoRenderer.lengthText.simpleText
                }

                // Extract publish time
                const publishedAt = videoRenderer.publishedTimeText?.simpleText || "Recently"

                videos.push({
                  id: videoId,
                  title,
                  description: "",
                  thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
                  duration,
                  views: viewCount,
                  likes: 0,
                  publishedAt,
                  channelName,
                  channelAvatar: `/api/channel-avatar/${channelId}`,
                  subscribers: 0,
                })
              } catch (itemError) {
                console.error("Error processing rich item:", itemError)
                continue
              }
            }
          }
        }
      } catch (sectionError) {
        console.error("Error processing trending section:", sectionError)
        // Continue to next section
        continue
      }
    }

    return videos
  } catch (error) {
    console.error("Error fetching trending videos:", error)
    return []
  }
}

// Function to fetch related videos
export async function fetchRelatedVideos(videoId: string): Promise<VideoData[]> {
  try {
    // Use our proxy endpoint instead of direct fetching
    const response = await fetch("/api/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }),
    })

    if (!response.ok) {
      console.error(`Failed to fetch related videos: ${response.status}`)
      return []
    }

    const proxyResponse = await response.json()

    if (proxyResponse.status !== 200) {
      console.error(`Proxy returned error: ${proxyResponse.status}`)
      return []
    }

    const html = proxyResponse.data

    // Extract initial data
    const initialDataRegex = /var\s+ytInitialData\s*=\s*({.+?})(?:;|<\/script>)/
    const match = html.match(initialDataRegex)

    if (!match) {
      console.error("Could not extract initial data from YouTube page")
      return []
    }

    // Parse the JSON data with better error handling
    let initialData
    try {
      // Clean the JSON string before parsing
      const cleanData = match[1].replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) =>
        String.fromCharCode(Number.parseInt(hex, 16)),
      )

      initialData = JSON.parse(cleanData)
    } catch (e) {
      console.error("Failed to parse YouTube data:", e)

      // Try an alternative approach
      try {
        const altRegex = /ytInitialData\s*=\s*({[\s\S]*?});/
        const altMatch = html.match(altRegex)

        if (altMatch) {
          initialData = Function(`return ${altMatch[1]}`)()
        } else {
          return []
        }
      } catch (fallbackError) {
        console.error("Failed fallback parsing:", fallbackError)
        return []
      }
    }

    // Navigate through the data structure to find related videos
    const secondaryResults =
      initialData.contents?.twoColumnWatchNextResults?.secondaryResults?.secondaryResults?.results || []

    // Extract video renderers
    const videos: VideoData[] = []

    for (const result of secondaryResults) {
      const compactVideoRenderer = result.compactVideoRenderer
      if (!compactVideoRenderer) continue

      const relatedVideoId = compactVideoRenderer.videoId
      const title = compactVideoRenderer.title?.simpleText || "Unknown Title"
      const channelName = compactVideoRenderer.longBylineText?.runs?.[0]?.text || "Unknown Channel"
      const channelId =
        compactVideoRenderer.longBylineText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || ""

      // Extract view count
      let viewCount = 0
      const viewCountText =
        compactVideoRenderer.viewCountText?.simpleText ||
        compactVideoRenderer.viewCountText?.runs?.[0]?.text ||
        "0 views"
      const viewMatch = viewCountText.match(/[\d,]+/)
      if (viewMatch) {
        viewCount = Number.parseInt(viewMatch[0].replace(/,/g, ""))
      }

      // Extract duration
      let duration = "0:00"
      if (compactVideoRenderer.lengthText?.simpleText) {
        duration = compactVideoRenderer.lengthText.simpleText
      }

      // Extract publish time (not always available for related videos)
      const publishedAt = compactVideoRenderer.publishedTimeText?.simpleText || new Date().toISOString()

      videos.push({
        id: relatedVideoId,
        title,
        description: "",
        thumbnail: `https://i.ytimg.com/vi/${relatedVideoId}/mqdefault.jpg`,
        duration,
        views: viewCount,
        likes: 0,
        publishedAt,
        channelName,
        channelAvatar: `/api/channel-avatar/${channelId}`,
        subscribers: 0,
      })
    }

    return videos
  } catch (error) {
    console.error("Error fetching related videos:", error)
    return []
  }
}

// Improve the fetchHomePageVideos function to be more reliable
export async function fetchHomePageVideos(): Promise<VideoData[]> {
  try {
    // Use our proxy endpoint instead of direct fetching
    const response = await fetch("/api/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "https://www.youtube.com",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }),
    })

    if (!response.ok) {
      console.error(`Failed to fetch homepage videos: ${response.status}`)
      return []
    }

    const proxyResponse = await response.json()

    if (proxyResponse.status !== 200) {
      console.error(`Proxy returned error: ${proxyResponse.status}`)
      return []
    }

    const html = proxyResponse.data
    const cleanedHtml = cleanHtml(html)

    // Try multiple regex patterns to extract initial data
    const patterns = [
      /var\s+ytInitialData\s*=\s*({.+?})(?:;|<\/script>)/,
      /ytInitialData\s*=\s*({[\s\S]*?});/,
      /window\["ytInitialData"\]\s*=\s*({[\s\S]*?});/,
    ]

    let initialData = null

    for (const pattern of patterns) {
      const match = cleanedHtml.match(pattern)
      if (match) {
        try {
          initialData = JSON.parse(match[1])
          break
        } catch (e) {
          console.error(`Failed to parse with pattern ${pattern}:`, e)
          // Try next pattern
          continue
        }
      }
    }

    if (!initialData) {
      console.error("Could not extract initial data from YouTube homepage")
      return []
    }

    // Navigate through the data structure to find homepage videos
    // Try multiple possible paths to the video content
    const possiblePaths = [
      initialData.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.richGridRenderer?.contents,
      initialData.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer
        ?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.shelfRenderer?.content?.horizontalListRenderer?.items,
      // Add more possible paths if needed
    ]

    let contents = []
    for (const path of possiblePaths) {
      if (path && Array.isArray(path) && path.length > 0) {
        contents = path
        break
      }
    }

    if (!contents.length) {
      console.error("Could not find video contents in YouTube homepage data")
      return []
    }

    // Extract video renderers
    const videos: VideoData[] = []

    for (const content of contents) {
      try {
        // Check different possible structures
        const videoRenderer =
          content.richItemRenderer?.content?.videoRenderer ||
          content.gridVideoRenderer ||
          content.videoRenderer ||
          content.compactVideoRenderer

        if (!videoRenderer) continue

        const videoId = videoRenderer.videoId
        if (!videoId) continue

        const title = videoRenderer.title?.runs?.[0]?.text || videoRenderer.title?.simpleText || "Unknown Title"

        const channelName =
          videoRenderer.ownerText?.runs?.[0]?.text ||
          videoRenderer.shortBylineText?.runs?.[0]?.text ||
          "Unknown Channel"

        const channelId =
          videoRenderer.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
          videoRenderer.shortBylineText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
          ""

        // Extract view count
        let viewCount = 0
        const viewCountText =
          videoRenderer.viewCountText?.simpleText || videoRenderer.viewCountText?.runs?.[0]?.text || "0 views"
        const viewMatch = viewCountText.match(/[\d,]+/)
        if (viewMatch) {
          viewCount = Number.parseInt(viewMatch[0].replace(/,/g, ""))
        }

        // Extract duration
        let duration = "0:00"
        if (videoRenderer.lengthText?.simpleText) {
          duration = videoRenderer.lengthText.simpleText
        } else if (videoRenderer.thumbnailOverlays) {
          const overlay = videoRenderer.thumbnailOverlays.find((o: any) => o.thumbnailOverlayTimeStatusRenderer)
          if (overlay?.thumbnailOverlayTimeStatusRenderer?.text?.simpleText) {
            duration = overlay.thumbnailOverlayTimeStatusRenderer.text.simpleText
          }
        }

        // Extract publish time
        const publishedAt = videoRenderer.publishedTimeText?.simpleText || "Recently"

        videos.push({
          id: videoId,
          title,
          description: "",
          thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
          duration,
          views: viewCount,
          likes: 0,
          publishedAt,
          channelName,
          channelAvatar: `/api/channel-avatar/${channelId}`,
          subscribers: 0,
        })
      } catch (itemError) {
        console.error("Error processing video item:", itemError)
        // Continue to next item
        continue
      }
    }

    return videos
  } catch (error) {
    console.error("Error fetching homepage videos:", error)
    return []
  }
}
