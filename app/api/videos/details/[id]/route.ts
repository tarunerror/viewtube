import { NextResponse } from "next/server"
import { getVideoDetails } from "@/lib/video-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const videoId = params.id

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    const video = await getVideoDetails(videoId)
    return NextResponse.json(video)
  } catch (error) {
    console.error("Error fetching video details:", error)
    return NextResponse.json({ error: "Failed to fetch video details" }, { status: 500 })
  }
}
