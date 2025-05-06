import { NextResponse } from "next/server"
import { getRelatedVideos } from "@/lib/video-service"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const videos = await getRelatedVideos(params.id)
    return NextResponse.json(videos)
  } catch (error) {
    console.error("Error fetching related videos:", error)
    return NextResponse.json(
      { error: "Failed to fetch related videos" },
      { status: 500 }
    )
  }
}
