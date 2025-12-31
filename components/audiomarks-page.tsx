"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Search, Play, Trash2, Edit } from "lucide-react"
import { toast } from "sonner"
import { createBrowserClient } from "../lib/supabase"

interface AudiomarksPageProps {
  user?: { id: string }
  userTier?: "free" | "premium"
}

export default function AudiomarksPage({ user, userTier }: AudiomarksPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [audiomarks, setAudiomarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentAudio, setCurrentAudio] = useState<string | null>(null)
  const [currentAudioTime, setCurrentAudioTime] = useState<number>(0)

  console.debug("[AudiomarksPage] user prop:", user)
  console.debug("[AudiomarksPage] userTier prop:", userTier)
  console.log("[AudiomarksPage] MOUNTED", { user, userTier: typeof userTier });

  const handlePlayAudiomark = (timestamp: number, audioUrl?: string) => {
    if (!audioUrl) {
      toast.error("No audio available for this book.")
      return
    }
    setCurrentAudio(audioUrl)
    setCurrentAudioTime(timestamp)
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = timestamp
        audioRef.current.play()
      }
    }, 100) // Wait for src to update
  }

  useEffect(() => {
    const fetchAudiomarks = async () => {
      if (!user) {
        console.debug("[AudiomarksPage] No user, skipping fetchAudiomarks")
        return
      }
      setLoading(true)
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from("audiomarks")
        .select("*, books(title, author, cover_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      console.debug("[AudiomarksPage] Fetched audiomarks:", { data, error })
      if (!error && data) setAudiomarks(data)
      setLoading(false)
    }
    if (user) fetchAudiomarks()
  }, [user])

  if (loading) {
    console.debug("[AudiomarksPage] Loading audiomarks...")
    return (
      <div className="flex flex-col items-center justify-center min-h-[90vh]">
        <span className="text-white font-bold text-4xl text-center">Please Log In</span>
        <br></br>
        <span className="text-white text-2xl text-center">You need to be logged in to view your audiomarks.</span>
      </div>
    )
  }

  if (!user) {
    console.debug("[AudiomarksPage] Rendering login message (no user)")
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Please Log In</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You need to be logged in to view your audiomarks.</p>
            {/* Add your login button here if needed */}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (audiomarks.length === 0) {
    console.debug("[AudiomarksPage] No audiomarks found for user")
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh]">
        <span className="text-white font-bold text-4xl text-center">No Saved Audiomarks.</span>
      </div>
    )
  }

  console.debug("[AudiomarksPage] Rendering audiomarks list:", audiomarks)

  const filteredAudiomarks = audiomarks.filter(
    (mark) =>
      (mark.books?.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (mark.note?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (mark.books?.author?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  )

  const handleDeleteAudiomark = async (id: number) => {
    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const res = await fetch(`/api/audiomarks?id=${id}`, {
        method: "DELETE",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      })
      const json = await res.json()
      if (!json.success) {
        throw new Error(json.error || "Failed to delete audiomark")
      }
      setAudiomarks(audiomarks.filter((mark) => mark.id !== id))
      toast.success("Audiomark deleted", {
        description: "Your audiomark has been removed",
      })
    } catch (error) {
      toast.error("Error deleting audiomark", {
        description: "Please try again",
      })
    }
  }

  const handleEditAudiomark = async (id: number) => {
    const audiomark = audiomarks.find((mark) => mark.id === id)
    if (!audiomark) return

    const newNote = prompt("Edit your note:", audiomark.note)
    if (!newNote || newNote === audiomark.note) return

    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const res = await fetch(`/api/audiomarks?id=${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ note: newNote }),
      })
      const json = await res.json()

      if (!json.success) {
        throw new Error(json.error || "Failed to update audiomark")
      }

      setAudiomarks(audiomarks.map((mark) => (mark.id === id ? { ...mark, note: newNote } : mark)))
      toast.success("Audiomark updated", {
        description: "Your note has been updated",
      })
    } catch (error) {
      toast.error("Error updating audiomark", {
        description: "Please try again",
      })
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">Your Audiomarks</h1>
          <p className="text-gray-300 text-lg">All your saved moments and favorite passages in one place</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search your audiomarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="h-6 bg-white/10 animate-pulse rounded mb-2 w-3/4" />
                      <div className="h-4 bg-white/10 animate-pulse rounded w-2/4" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
<div className="space-y-4">
  {filteredAudiomarks.map((mark) => (
    <Card key={mark.id} className="bg-white/5 border-white/10 backdrop-blur-sm flex flex-row items-center">
      <img
        src={mark.books?.cover_url || "/placeholder.svg"}
        alt={mark.books?.title || "Book cover"}
        className="w-16 h-24 object-cover rounded-lg m-4"
        style={{ flexShrink: 0 }}
      />
      <div className="flex-1">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-white text-lg font-semibold">
                {mark.books?.title || mark.bookTitle}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {mark.books?.author || mark.bookAuthor}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" onClick={() => handlePlayAudiomark(mark.timestamp, mark.books?.audio_url)}>
                <Play className="h-4 w-4 text-white" />
              </Button>
              <Button variant="ghost" onClick={() => handleEditAudiomark(mark.id)}>
                <Edit className="h-4 w-4 text-white" />
              </Button>
              <Button variant="ghost" onClick={() => handleDeleteAudiomark(mark.id)}>
                <Trash2 className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">{mark.note}</p>
          <Badge className="mt-2 bg-white/10 text-white">
            {new Date(mark.created_at).toLocaleDateString()}
          </Badge>
        </CardContent>
      </div>
    </Card>
  ))}
</div>
        )}
      </div>
      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        src={currentAudio || undefined}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            audioRef.current.currentTime = currentAudioTime
          }
        }}
        onEnded={() => setCurrentAudio(null)}
        className="hidden"
      />
    </div>
  )
}
