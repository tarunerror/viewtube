"use client"

import { useState } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogIn, LogOut, User } from "lucide-react"

export function AuthButton() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    await signIn("google", { callbackUrl: "/" })
    setIsLoading(false)
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut({ callbackUrl: "/" })
    setIsLoading(false)
  }

  if (status === "loading") {
    return (
      <Button variant="outline" size="sm" disabled>
        <User className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    )
  }

  if (session?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
              <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <User className="mr-2 h-4 w-4" />
            <span>{session.user.name}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      style={{ background: '#4285F4', color: 'white', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(66,133,244,0.15)' }}
      size="lg"
      className="w-full py-2 text-base rounded-lg flex items-center justify-center gap-2"
      onClick={handleSignIn}
      disabled={isLoading}
    >
      <LogIn className="mr-2 h-5 w-5" />
      Sign in with Google
    </Button>
  )
}
