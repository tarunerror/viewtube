"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Repeat, Maximize, Minimize, Palette, PictureInPicture } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

interface VideoPlayerProps {
  videoId: string
  title: string
}

export function VideoPlayer({ videoId, title }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [isAmbientMode, setIsAmbientMode] = useState(false)
  const [dominantColor, setDominantColor] = useState("rgba(0, 0, 0, 0.8)")

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (typeof document !== "undefined") {
        setIsFullscreen(!!document.fullscreenElement)
      }
    }

    if (typeof document !== "undefined") {
      document.addEventListener("fullscreenchange", handleFullscreenChange)
      return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange)
      }
    }
  }, [])

  // Ambient mode effect
  useEffect(() => {
    if (!isAmbientMode) {
      return
    }

    // Load the thumbnail to get the dominant color
    if (typeof window !== "undefined") {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`

      img.onload = () => {
        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Draw image to canvas
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        // Get image data for color analysis
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Simple algorithm to find a dominant color
        let r = 0,
          g = 0,
          b = 0,
          count = 0

        // Sample pixels (every 10th pixel to save performance)
        for (let i = 0; i < data.length; i += 40) {
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
          count++
        }

        // Average the colors
        r = Math.floor(r / count)
        g = Math.floor(g / count)
        b = Math.floor(b / count)

        // Set the dominant color with reduced opacity for a subtle effect
        setDominantColor(`rgba(${r}, ${g}, ${b}, 0.8)`)
      }

      img.onerror = () => {
        // Use a fallback color if image fails to load
        setDominantColor("rgba(0, 0, 0, 0.8)")
      }
    }
  }, [isAmbientMode, videoId])

  const toggleFullscreen = () => {
    if (typeof document !== "undefined") {
      const container = containerRef.current
      if (!container) return

      if (!document.fullscreenElement) {
        container.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`)
          toast({
            title: "Fullscreen Error",
            description: "Could not enter fullscreen mode. Your browser may not support this feature.",
            variant: "destructive",
          })
        })
      } else {
        document.exitFullscreen()
      }
    }
  }

  const toggleLoop = () => {
    setIsLooping(!isLooping)
  }

  const toggleAmbientMode = () => {
    setIsAmbientMode(!isAmbientMode)

    if (!isAmbientMode) {
      toast({
        title: "Ambient Mode Activated",
        description: "Enjoy a more immersive viewing experience",
      })
    }
  }

  const togglePictureInPicture = async () => {
    try {
      if (typeof document !== "undefined") {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture()
        } else {
          toast({
            title: "Picture-in-Picture",
            description: "This feature works best with direct video elements. Try using the YouTube native PiP option.",
          })
        }
      }
    } catch (error) {
      console.error("PiP error:", error)
      toast({
        title: "Picture-in-Picture Failed",
        description: "Your browser may not support this feature or permission was denied.",
        variant: "destructive",
      })
    }
  }

  // Base YouTube embed URL with parameters
  const videoUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0&showinfo=0&enablejsapi=1${isLooping ? "&loop=1&playlist=" + videoId : ""}`

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full bg-black rounded-lg overflow-hidden transition-all duration-700",
        isAmbientMode && "ambient-mode",
      )}
      style={
        isAmbientMode
          ? {
              background: dominantColor,
              boxShadow: `0 0 100px 20px ${dominantColor}`,
            }
          : {}
      }
    >
      <div className="aspect-video w-full">
        <iframe
          ref={iframeRef}
          src={videoUrl}
          title={title}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        ></iframe>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Custom controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 text-white hover:bg-white/20", isLooping && "text-primary")}
              onClick={toggleLoop}
              title={isLooping ? "Disable loop" : "Enable loop"}
            >
              <Repeat className="h-5 w-5" />
              <span className="sr-only">{isLooping ? "Disable loop" : "Enable loop"}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 text-white hover:bg-white/20", isAmbientMode && "text-primary")}
              onClick={toggleAmbientMode}
              title={isAmbientMode ? "Disable ambient mode" : "Enable ambient mode"}
            >
              <Palette className="h-5 w-5" />
              <span className="sr-only">{isAmbientMode ? "Disable ambient mode" : "Enable ambient mode"}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={togglePictureInPicture}
              title="Picture-in-Picture"
            >
              <PictureInPicture className="h-5 w-5" />
              <span className="sr-only">Picture-in-Picture</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            <span className="sr-only">{isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
