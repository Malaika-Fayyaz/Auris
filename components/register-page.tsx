"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Headphones, ArrowLeft, Eye, EyeOff, Crown } from "lucide-react"
import { toast } from "sonner"

interface RegisterPageProps {
  onRegister: (user: { id: string }, tier: "free" | "premium") => void
  onNavigate: (page: string) => void
}

export default function RegisterPage({ onRegister, onNavigate }: RegisterPageProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    tier: "free",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "register",
          ...formData,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Registration failed")
      }

      // Registration successful
    toast.success("Registration successful", {
      description: `Welcome to AURIS, ${formData.name}!`,
    })

      // Pass the user's id and tier to the parent component
      onRegister({ id: data.profile.id }, data.profile.tier)
    } catch (error: any) {
    toast.error("Registration failed", {
      description: error.message,
    })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Button variant="ghost" className="text-gray-300 hover:text-white mb-6" onClick={() => onNavigate("home")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Join AURIS</CardTitle>
            <CardDescription className="text-gray-300">Create your account and start listening</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-300">Choose Your Plan</Label>
                <RadioGroup
                  value={formData.tier}
                  onValueChange={(value) => setFormData({ ...formData, tier: value })}
                  className="space-y-3"
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-white/10 bg-white/5">
                    <RadioGroupItem value="free" id="free" />
                    <div className="flex-1">
                      <Label htmlFor="free" className="text-white font-medium cursor-pointer">
                        Free Tier
                      </Label>
                      <p className="text-sm text-gray-400">Basic AI voices, SimpleAudio & XTTS models</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                    <RadioGroupItem value="premium" id="premium" />
                    <div className="flex-1">
                      <Label
                        htmlFor="premium"
                        className="text-white font-medium cursor-pointer flex items-center gap-2"
                      >
                        Premium Tier
                        <Crown className="w-4 h-4 text-yellow-400" />
                      </Label>
                      <p className="text-sm text-gray-400">Advanced models: Bark, ElevenLabs, PlayHT</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Already have an account?{" "}
                <button
                  onClick={() => onNavigate("login")}
                  className="text-purple-400 hover:text-purple-300 font-medium"
                  disabled={isLoading}
                >
                  Sign in
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
