"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { ArrowLeft, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { createBrowserClient } from "@supabase/ssr"
import { Checkbox } from "./ui/checkbox"

interface RequestBookPageProps {
  onNavigate: (page: string) => void
}

export default function RequestBookPage({ onNavigate }: RequestBookPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [formData, setFormData] = useState({
    bookName: "",
    author: "",
    edition: "",
    additionalNotes: "",
    email: "",
    wantToSignUp: false
  })

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { session } } = await supabase.auth.getSession()
    setIsSignedIn(!!session)
    if (session?.user?.email) {
      setFormData(prev => ({ ...prev, email: session.user.email || "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { session } } = await supabase.auth.getSession()

      const { error } = await supabase
        .from("book_requests")
        .insert([
          {
            book_name: formData.bookName,
            author: formData.author,
            edition: formData.edition || null,
            additional_notes: formData.additionalNotes || null,
            status: "pending",
            user_email: session?.user?.email || formData.email,
            user_id: session?.user?.id || null
          }
        ])

      if (error) throw error

      toast.success("Book request submitted successfully!", {
        description: "We'll notify you when the book is available."
      })

      // If user wants to sign up, show sign up form
      if (formData.wantToSignUp && !isSignedIn) {
        setShowSignUp(true)
        return
      }

      // Reset form
      setFormData({
        bookName: "",
        author: "",
        edition: "",
        additionalNotes: "",
        email: "",
        wantToSignUp: false
      })
    } catch (error: any) {
      toast.error("Failed to submit book request", {
        description: error.message || "Please try again later"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      wantToSignUp: checked
    }))
  }

  if (showSignUp) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" className="text-gray-300 hover:text-white mb-6" onClick={() => setShowSignUp(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Request Form
          </Button>

          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Create an Account</CardTitle>
              <CardDescription className="text-gray-300">
                Sign up to track your book requests and get notified when they're available
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={async (e) => {
                e.preventDefault()
                const supabase = createBrowserClient(
                  process.env.NEXT_PUBLIC_SUPABASE_URL!,
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                )
                
                const { error } = await supabase.auth.signUp({
                  email: formData.email,
                  password: "temp-password-123", // You might want to add a password field
                  options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                  }
                })

                if (error) {
                  toast.error("Failed to create account", {
                    description: error.message
                  })
                } else {
                  toast.success("Account created!", {
                    description: "Please check your email to verify your account."
                  })
                  setShowSignUp(false)
                }
              }} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-white">Email Address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Create Account
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" className="text-gray-300 hover:text-white mb-6" onClick={() => onNavigate("home")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Request a Book</CardTitle>
            <CardDescription className="text-gray-300">
              Can't find the book you're looking for? Let us know and we'll add it to our library
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bookName" className="text-white">Book Name *</Label>
                <Input
                  id="bookName"
                  name="bookName"
                  value={formData.bookName}
                  onChange={handleChange}
                  placeholder="Enter the book title"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author" className="text-white">Author *</Label>
                <Input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Enter the author's name"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edition" className="text-white">Edition (Optional)</Label>
                <Input
                  id="edition"
                  name="edition"
                  value={formData.edition}
                  onChange={handleChange}
                  placeholder="e.g., 2nd Edition, 2023"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                />
              </div>

              {!isSignedIn && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="additionalNotes" className="text-white">Additional Notes (Optional)</Label>
                <Textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  placeholder="Any additional information about the book"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 min-h-[100px]"
                />
              </div>

              {!isSignedIn && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wantToSignUp"
                    checked={formData.wantToSignUp}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label
                    htmlFor="wantToSignUp"
                    className="text-sm text-gray-300 cursor-pointer"
                  >
                    Create an account to track your requests and get notified
                  </Label>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 