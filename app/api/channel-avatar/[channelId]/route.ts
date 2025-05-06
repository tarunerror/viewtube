import { type NextRequest, NextResponse } from "next/server"

// This API route fetches a channel's avatar
export async function GET(request: NextRequest, { params }: { params: { channelId: string } }) {
  const channelId = params.channelId

  if (!channelId) {
    return NextResponse.json({ error: "Channel ID is required" }, { status: 400 })
  }

  try {
    // In a real implementation, you would:
    // 1. Fetch the channel page
    // 2. Extract the avatar URL
    // 3. Return the avatar image

    // For this demo, we'll redirect to a placeholder
    // Note: This is just for demonstration purposes

    // Generate a placeholder avatar based on the channel ID
    // This ensures the same channel always gets the same avatar
    const hash = channelId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const color = `hsl(${hash % 360}, 70%, 60%)`
    const letter = channelId.charAt(0).toUpperCase()

    // Create an SVG placeholder
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <rect width="40" height="40" fill="${color}" rx="20" />
        <text x="50%" y="50%" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">${letter}</text>
      </svg>
    `

    // Convert SVG to base64
    const base64 = Buffer.from(svg).toString("base64")

    // Redirect to the data URL
    return new Response(null, {
      status: 302,
      headers: {
        Location: `data:image/svg+xml;base64,${base64}`,
      },
    })
  } catch (error) {
    console.error("Error fetching channel avatar:", error)

    // Return a default avatar
    return NextResponse.redirect("/placeholder.svg?height=40&width=40")
  }
}
