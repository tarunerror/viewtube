'use client'

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Suspense } from "react"

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  return (
    <div className="container-custom flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            There was a problem signing you in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-red-500">
              {error === "Configuration" && "There is a problem with the server configuration."}
              {error === "AccessDenied" && "You do not have permission to sign in."}
              {error === "Verification" && "The verification token has expired or has already been used."}
              {error === "OAuthSignin" && "Error in the OAuth sign-in process."}
              {error === "OAuthCallback" && "Error in the OAuth callback process."}
              {error === "OAuthCreateAccount" && "Could not create OAuth provider user in the database."}
              {error === "EmailCreateAccount" && "Could not create email provider user in the database."}
              {error === "Callback" && "Error in the OAuth callback process."}
              {error === "OAuthAccountNotLinked" && "Email on the account already exists with different credentials."}
              {error === "EmailSignin" && "Check your email address."}
              {error === "CredentialsSignin" && "Sign in failed. Check the details you provided are correct."}
              {error === "SessionRequired" && "Please sign in to access this page."}
              {!error && "An unknown error occurred."}
            </p>
            <Button
              className="w-full"
              onClick={() => window.location.href = "/auth/signin"}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading error page...</div>}>
      <AuthErrorContent />
    </Suspense>
  )
}
