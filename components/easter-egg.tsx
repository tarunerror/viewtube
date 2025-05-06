"use client"

import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

// Konami code sequence
const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
]

export function EasterEgg() {
  const [isVaporwaveMode, setIsVaporwaveMode] = useState(false)
  const [keySequence, setKeySequence] = useState<string[]>([])

  // Check for konami code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newSequence = [...keySequence, e.key]

      // Only keep the last N keys (where N is the length of the code)
      if (newSequence.length > KONAMI_CODE.length) {
        newSequence.shift()
      }

      setKeySequence(newSequence)

      // Check if the sequence matches the Konami code
      const isMatch = newSequence.length === KONAMI_CODE.length && newSequence.every((key, i) => key === KONAMI_CODE[i])

      if (isMatch) {
        toggleVaporwaveMode()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [keySequence])

  const toggleVaporwaveMode = () => {
    const newMode = !isVaporwaveMode
    setIsVaporwaveMode(newMode)

    // Apply vaporwave class to body
    if (typeof document !== "undefined") {
      if (newMode) {
        document.body.classList.add("vaporwave-mode")
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("vaporwave-discovered", "true")
        }
        toast({
          title: "ｖａｐｏｒｗａｖｅ　ｍｏｄｅ　ａｃｔｉｖａｔｅｄ",
          description: "Ｅｎｊｏｙ　ｔｈｅ　ａｅｓｔｈｅｔｉｃｓ",
        })
      } else {
        document.body.classList.remove("vaporwave-mode")
      }
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="fixed bottom-4 right-4 h-8 w-8 rounded-full opacity-10 hover:opacity-100 transition-opacity z-50"
      onClick={toggleVaporwaveMode}
      title="Secret Mode"
    >
      <Sparkles className="h-4 w-4" />
    </Button>
  )
}
