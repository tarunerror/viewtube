import { getPopularVideos } from "@/lib/video-service"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const pageToken = searchParams.get('pageToken') || undefined
    
    const result = await getPopularVideos(pageToken)
    return Response.json(result)
  } catch (error) {
    console.error("Error in popular videos API:", error)
    return Response.json(
      { error: "Failed to fetch popular videos" },
      { status: 500 }
    )
  }
}
