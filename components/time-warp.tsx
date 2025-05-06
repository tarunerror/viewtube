"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

export function TimeWarp() {
  const [isOpen, setIsOpen] = useState(false)
  const [date, setDate] = useState(new Date())

  // Update the date every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const formattedDate = format(date, "MMMM d, yyyy h:mm a")

  return (
    <>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsOpen(true)}>
        <Clock className="h-4 w-4" />
        <span>Time Warp</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="relative max-w-lg w-full bg-card rounded-lg shadow-lg p-6"
            >
              <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>

              <h2 className="text-2xl font-bold mb-4">Time Warp</h2>

              <div className="space-y-4">
                <p className="text-muted-foreground">Current time: {formattedDate}</p>

                <div className="grid gap-2">
                  <h3 className="text-lg font-semibold">Popular on this day in history</h3>

                  <div className="border rounded-lg p-3 space-y-2">
                    <h4 className="font-medium">1 year ago</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="aspect-video bg-muted rounded-md"></div>
                      <div className="aspect-video bg-muted rounded-md"></div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3 space-y-2">
                    <h4 className="font-medium">5 years ago</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="aspect-video bg-muted rounded-md"></div>
                      <div className="aspect-video bg-muted rounded-md"></div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3 space-y-2">
                    <h4 className="font-medium">10 years ago</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="aspect-video bg-muted rounded-md"></div>
                      <div className="aspect-video bg-muted rounded-md"></div>
                    </div>
                  </div>
                </div>

                <Button className="w-full" onClick={() => setIsOpen(false)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
