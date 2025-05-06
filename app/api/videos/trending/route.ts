import { getTrendingVideos } from "@/lib/video-service"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const pageToken = searchParams.get('pageToken') || undefined
    const country = searchParams.get('country') || 'IN'
    
    const result = await getTrendingVideos(country, pageToken)
    return Response.json(result)
  } catch (error) {
    console.error("Error in trending videos API:", error)
    return Response.json(
      { error: "Failed to fetch trending videos" },
      { status: 500 }
    )
  }
}
