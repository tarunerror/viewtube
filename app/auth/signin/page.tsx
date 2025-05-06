"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignIn() {
  const handleSignIn = () => {
    signIn("google", {
      callbackUrl: "/",
      redirect: true
    })
  }

  return (
    <div className="container-custom flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Sign in to access your personalized experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={handleSignIn}
          >
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
