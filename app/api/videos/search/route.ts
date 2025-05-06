import { NextResponse } from "next/server"
import { getSearchResults } from "@/lib/video-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const videos = await getSearchResults(query)
    return NextResponse.json(videos)
  } catch (error) {
    console.error("Error searching videos:", error)
    return NextResponse.json({ error: "Failed to search videos" }, { status: 500 })
  }
}
