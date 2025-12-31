"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Headphones, Users, Zap, Heart, Award, Globe } from "lucide-react"

export default function AboutPage() {
  const features = [
    {
      icon: Headphones,
      title: "AI-Powered Audio",
      description: "Experience books with cutting-edge AI voices that bring stories to life",
    },
    {
      icon: Users,
      title: "Voice Cloning",
      description: "Create personalized audiobook experiences with your own cloned voice",
    },
    {
      icon: Zap,
      title: "Smart Bookmarks",
      description: "Save and organize your favorite moments with intelligent audiomarks",
    },
    {
      icon: Heart,
      title: "Curated Library",
      description: "Access thousands of carefully selected audiobooks across all genres",
    },
  ]

  const stats = [
    { number: "10K+", label: "Happy Listeners" },
    { number: "5K+", label: "Audiobooks" },
    { number: "50+", label: "Languages" },
    { number: "99.9%", label: "Uptime" },
  ]

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      description: "Former audiobook narrator with 15+ years in the industry",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      description: "AI researcher specializing in voice synthesis and machine learning",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Content",
      description: "Literary expert curating our diverse audiobook collection",
    },
  ]

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Headphones className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">About AURIS</h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We're revolutionizing the audiobook experience by combining cutting-edge AI technology with the timeless joy
            of storytelling. Our mission is to make literature more accessible, personal, and engaging for everyone.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <p className="text-gray-300">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Our Story */}
        <div className="mb-16">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-white text-center">Our Story</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300 text-lg leading-relaxed">
              <p>
                AURIS was born from a simple observation: while audiobooks have transformed how we consume literature,
                the experience could be even more personal and immersive. Our founders, a team of literature enthusiasts
                and AI researchers, envisioned a platform where technology enhances rather than replaces the human
                connection to stories.
              </p>
              <p>
                In 2023, we launched with a revolutionary idea - what if you could hear your favorite books in your own
                voice, or choose from a variety of AI-generated voices that match the mood and tone of each story? What
                if you could bookmark not just pages, but specific moments in time, creating a personal library of
                meaningful passages?
              </p>
              <p>
                Today, AURIS serves thousands of listeners worldwide, offering both free and premium tiers to ensure
                that everyone can access the magic of personalized audiobooks. We continue to innovate, recently
                introducing advanced voice cloning technology and expanding our library with diverse voices and
                languages.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">What Makes Us Different</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-purple-400 mb-4" />
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm text-center">
                <CardHeader>
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <CardTitle className="text-white">{member.name}</CardTitle>
                  <Badge className="bg-purple-500/20 text-purple-300">{member.role}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission & Values */}
        <div className="mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <Award className="w-12 h-12 text-yellow-400 mb-4" />
                <CardTitle className="text-white">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  To democratize access to literature through innovative AI technology, making audiobooks more personal,
                  accessible, and engaging for readers worldwide.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <Globe className="w-12 h-12 text-blue-400 mb-4" />
                <CardTitle className="text-white">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  A world where every person can experience the joy of literature in their preferred voice, language,
                  and style, breaking down barriers to reading and learning.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="pt-8">
              <h3 className="text-2xl font-bold text-white mb-4">Join Our Journey</h3>
              <p className="text-gray-300 mb-6">
                Have questions, suggestions, or just want to say hello? We'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="text-purple-400">
                  <strong>Email:</strong> hello@auris.com
                </div>
                <div className="text-purple-400">
                  <strong>Phone:</strong> +1 (555) 123-4567
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
