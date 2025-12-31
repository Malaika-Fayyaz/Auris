"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { BookOpen, Headphones, Star, Crown, Mail, Phone, MapPin, Mic, Bookmark } from "lucide-react"
import Navigation from "../components/navigation"
import LoginPage from "../components/login-page"
import RegisterPage from "../components/register-page"
import BooksPage from "../components/books-page"
import AudiomarksPage from "../components/audiomarks-page"
import AboutPage from "../components/about-page"
import RequestBookPage from "../components/request-book-page"
import AudioPlayer from "../components/audio-player"

export default function AurisHome() {
  const [currentPage, setCurrentPage] = useState("home")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userTier, setUserTier] = useState<"free" | "premium">("free")
  const [currentBook, setCurrentBook] = useState<any>(null)
  const [hasClonedVoice, setHasClonedVoice] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)

  const handleLogin = (userObj: { id: string }, tier: "free" | "premium") => {
    setIsLoggedIn(true)
    setUser(userObj)
    setUserTier(tier)
    setCurrentPage("home")
  }

  const handleBookSelect = (book: any) => {
    setCurrentBook(book)
  }

  if (currentPage === "login") {
    return <LoginPage onLogin={handleLogin} onNavigate={setCurrentPage} />
  }

  if (currentPage === "register") {
    return <RegisterPage onRegister={handleLogin} onNavigate={setCurrentPage} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isLoggedIn={isLoggedIn}
        userTier={userTier}
        onLogout={() => {
          setIsLoggedIn(false)
          setCurrentPage("home")
          setCurrentBook(null)
        }}
      />

      {currentPage === "home" && <HomePage isLoggedIn={isLoggedIn} userTier={userTier} onNavigate={setCurrentPage} />}

      {currentPage === "books" && (
        <BooksPage 
          onBookSelect={handleBookSelect} 
          userTier={userTier} 
        />
      )}

      {currentPage === "audiomarks" && <AudiomarksPage user={user ?? undefined} userTier={userTier} />}

      {currentPage === "about" && <AboutPage />}

      {currentPage === "request-book" && <RequestBookPage onNavigate={setCurrentPage} />}

      {currentBook && (
        <AudioPlayer
          book={currentBook}
          userTier={userTier}
          userId={user ? user.id : null}
          hasClonedVoice={hasClonedVoice}
          onClonedVoiceGenerated={() => setHasClonedVoice(true)}
          onClose={() => setCurrentBook(null)}
        />
      )}
    </div>
  )
}

function HomePage({
  isLoggedIn,
  userTier,
  onNavigate,
}: {
  isLoggedIn: boolean
  userTier: "free" | "premium"
  onNavigate: (page: string) => void
}) {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Headphones className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
              Welcome to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">AURIS</span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience audiobooks like never before with AI-powered voices and personalized voice cloning technology
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {!isLoggedIn ? (
                <>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg"
                    onClick={() => onNavigate("register")}
                  >
                    Get Started Free
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-4 text-lg"
                    onClick={() => onNavigate("login")}
                  >
                    Sign In
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg"
                  onClick={() => onNavigate("books")}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Browse Books
                </Button>
              )}
            </div>

            {isLoggedIn && userTier === "free" && (
              <Card className="max-w-md mx-auto bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                <CardHeader className="text-center">
                  <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <CardTitle className="text-white">Upgrade to Premium</CardTitle>
                  <CardDescription className="text-gray-300">
                    Unlock advanced voice cloning models and premium features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-12">Why Choose AURIS?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <Mic className="w-12 h-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">Voice Cloning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Clone your own voice or choose from AI voices to personalize your audiobook experience
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <Bookmark className="w-12 h-12 text-pink-400 mb-4" />
                <CardTitle className="text-white">Audiomarks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Save your favorite moments with timestamp bookmarks for easy reference</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <BookOpen className="w-12 h-12 text-blue-400 mb-4" />
                <CardTitle className="text-white">Vast Library</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Access thousands of audiobooks across all genres with high-quality audio
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-12">Get in Touch</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-center">
              <CardHeader>
                <Mail className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <CardTitle className="text-white">Email Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">support@auris.com</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-center">
              <CardHeader>
                <Phone className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <CardTitle className="text-white">Call Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">+1 (555) 123-4567</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-center">
              <CardHeader>
                <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <CardTitle className="text-white">Visit Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">123 Audio Street, Sound City</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
