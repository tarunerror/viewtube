import { type NextRequest, NextResponse } from "next/server"

// This is a simple proxy endpoint that can be used to bypass CORS restrictions
// when fetching data from YouTube
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, headers = {} } = body

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Add default headers
    const requestHeaders = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      ...headers,
    }

    // Add a cache buster to avoid getting cached responses
    const cacheBuster = `?_=${Date.now()}`
    const urlWithCacheBuster = url.includes("?") ? `${url}&_=${Date.now()}` : `${url}${cacheBuster}`

    // Fetch the URL with a timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(urlWithCacheBuster, {
      headers: requestHeaders,
      method: "GET",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Get the response body
    const data = await response.text()

    // Return the response
    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data,
    })
  } catch (error) {
    console.error("Proxy error:", error)

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json({ error: "Request timed out" }, { status: 504 })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Failed to proxy request" }, { status: 500 })
  }
}
