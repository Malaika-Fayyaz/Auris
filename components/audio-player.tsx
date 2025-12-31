"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Slider } from "./ui/slider"
import { Badge } from "./ui/badge"
import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Play, Pause, Square, Volume2, Bookmark, X, Upload, Loader2, Mic } from "lucide-react"
import { toast } from "sonner"
import { createBrowserClient } from "../lib/supabase"

interface AudioPlayerProps {
  book: any
  userTier: "free" | "premium"
  userId: string | null
  hasClonedVoice: boolean
  onClonedVoiceGenerated: () => void
  onClose: () => void
}

export default function AudioPlayer({
  book,
  userTier,
  userId,
  hasClonedVoice,
  onClonedVoiceGenerated,
  onClose,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState([80])
  const [voiceOption, setVoiceOption] = useState("ai")
  const [showVoiceCloning, setShowVoiceCloning] = useState(false)
  const [selectedModel, setSelectedModel] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isTtsLoading, setIsTtsLoading] = useState(false)
  const [isAudioReady, setIsAudioReady] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audiomarks, setAudiomarks] = useState<any[]>([])

  const freeModels = ["SimpleAudio", "XTTS"]
  const premiumModels = ["Bark", "ElevenLabs", "PlayHT"]
  const availableModels = userTier === "premium" ? premiumModels : freeModels

  console.log("[AudioPlayer] MOUNTED", { book, userTier, userId, hasClonedVoice });

  // Load audiomarks when component mounts
  useEffect(() => {
    const fetchAudiomarks = async () => {
      if (!userId || !book.id) return

      try {
        const supabase = createBrowserClient()
        const { data, error } = await supabase
          .from("audiomarks")
          .select("*")
          .eq("user_id", userId)
          .eq("book_id", book.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        if (data) {
          setAudiomarks(data)
        } else {
          // Fallback to mock data
          const mockAudiomarks = [
            { time: 45, note: "Interesting character introduction" },
            { time: 120, note: "Beautiful description of the setting" },
          ]
          setAudiomarks(mockAudiomarks)
        }
      } catch (error: any) {
        console.error("Error fetching audiomarks:", error)
        // Fallback to mock data
        const mockAudiomarks = [
          { time: 45, note: "Interesting character introduction" },
          { time: 120, note: "Beautiful description of the setting" },
        ]
        setAudiomarks(mockAudiomarks)
      }
    }

    fetchAudiomarks()
  }, [book.id, userId])

  // Handle audio duration and time updates
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
    }
  }, [])

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100
    }
  }, [volume])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleGenerateTTS = async () => {
    if (!book.book_content) {
      toast.error("No book content available for TTS.")
      return
    }

    setIsTtsLoading(true)
    try {
      const response = await fetch("/api/generate-voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: book.book_content }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to generate TTS")
      }

      const data = await response.json()
      if (!data.audioUrl) {
        throw new Error("No audio URL returned")
      }

      console.log("Generated audio URL:", data.audioUrl)
      setAudioUrl(data.audioUrl)
      setIsAudioReady(true)
      toast.success("TTS ready to play!")
    } catch (error) {
      console.error("TTS generation error:", error)
      toast.error(error instanceof Error ? error.message : "TTS generation failed")
    } finally {
      setIsTtsLoading(false)
    }
  }

  const handlePlayPause = async () => {
    console.debug("[AudioPlayer] handlePlayPause called", { isPlaying, audioUrl })
    if (!audioRef.current || !audioUrl) {
      toast.error("Audio not ready")
      return
    }

    try {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        await audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    } catch (error) {
      console.error("Playback error:", error)
      toast.error("Error playing audio")
    }
  }

  const handleStop = () => {
    if (!audioRef.current) return
    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setIsPlaying(false)
  }

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleSaveAudiomark = async () => {
    console.debug("[AudioPlayer] handleSaveAudiomark called", { userId, bookId: book.id, currentTime })
    if (!userId || !book.id) {
      toast.error("You must be logged in to save audiomarks.")
      return
    }
    // Get the current line (simulate with a substring of book_content at currentTime)
    const words = book.book_content.split(" ")
    const wordsPerSecond = 2 // adjust as needed
    const idx = Math.floor(currentTime * wordsPerSecond)
    const note = words.slice(idx, idx + 10).join(" ")
    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const res = await fetch("/api/audiomarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          userId,
          bookId: book.id,
          timestamp: currentTime,
          note,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Audiomark saved!")
        // Optionally, refresh audiomarks here
      } else {
        toast.error("Failed to save audiomark: " + (json.error || "Unknown error"))
      }
    } catch (err) {
      toast.error("Failed to save audiomark: " + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleVoiceCloning = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAudioFile(file)
      setShowVoiceCloning(true)
    }
  }

  const handleModelSelection = async () => {
    if (!selectedModel || !audioFile || !userId) {
      toast.error("Please select a model and upload a voice sample")
      return
    }

    setIsProcessing(true)
    setShowVoiceCloning(false)

    try {
      const supabase = createBrowserClient()

      // Upload the audio file to Supabase Storage
      const fileName = `${userId}-${Date.now()}.wav`
      const { error: uploadError } = await supabase.storage.from("voice-samples").upload(fileName, audioFile)

      if (uploadError) throw uploadError

      // Get the public URL
      const { data: urlData } = supabase.storage.from("voice-samples").getPublicUrl(fileName)

      // Store the cloned voice reference
      const { error: voiceError } = await supabase.from("cloned_voices").insert({
        user_id: userId,
        model: selectedModel,
        voice_url: urlData.publicUrl,
      })

      if (voiceError) throw voiceError

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setVoiceOption("cloned")
      onClonedVoiceGenerated()

      toast.success("Voice cloning complete", {
        description: `Your voice has been cloned using ${selectedModel}`,
      })
    } catch (error: any) {
      toast.error("Voice cloning failed", {
        description: error.message || "Please try again",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Debug log for Save Audiomark button rendering
  if (typeof window !== 'undefined') {
    console.debug("[AudioPlayer] Render Save Audiomark button", { userId, isPlaying, isAudioReady })
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
      <Card className="w-full bg-gradient-to-r from-slate-900 to-purple-900 border-t border-white/20 rounded-t-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={book.cover_url || book.cover || "/placeholder.svg"}
                alt={book.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <CardTitle className="text-white text-lg">{book.title}</CardTitle>
                <p className="text-gray-300">by {book.author}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-300 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* TTS Button */}
          {!book.audio_url && book.book_content && (
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleGenerateTTS} 
                disabled={isTtsLoading} 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isTtsLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Generate TTS
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              className="w-full"
              onValueChange={handleSeek}
              disabled={!isAudioReady}
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleStop}
              className="border-white/20 text-gray-300 hover:text-white"
              disabled={!isAudioReady}
            >
              <Square className="w-4 h-4" />
            </Button>

            <Button
              size="icon"
              onClick={handlePlayPause}
              className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={!isAudioReady}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <div className="flex flex-col items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (!userId) {
                    toast.error("You must be logged in to save audiomarks.")
                  } else if (isPlaying) {
                    toast.error("Pause the audio to save an audiomark.")
                  } else if (!isAudioReady) {
                    toast.error("Audio is not ready.")
                  } else {
                    handleSaveAudiomark()
                  }
                }}
                className="border-white/20 text-gray-300 hover:text-white"
                disabled={!userId || isPlaying || !isAudioReady}
                title="Save Audiomark"
              >
                <Bookmark className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <Slider 
              value={volume} 
              max={100} 
              step={1} 
              className="flex-1" 
              onValueChange={setVolume}
              disabled={!isAudioReady}
            />
            <span className="text-sm text-gray-400 w-8">{volume[0]}%</span>
          </div>

          {/* Voice Options */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Voice Options</h3>
            <RadioGroup value={voiceOption} onValueChange={setVoiceOption} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ai" id="ai" />
                <Label htmlFor="ai" className="text-gray-300">
                  Use AI Voice
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="generate" id="generate" />
                <Label htmlFor="generate" className="text-gray-300">
                  Generate Cloned Voice
                </Label>
                {voiceOption === "generate" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleVoiceCloning}
                    className="ml-2 border-white/20 text-gray-300 hover:text-white"
                    disabled={isProcessing || !userId}
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Upload WAV
                  </Button>
                )}
              </div>

              {(hasClonedVoice || voiceOption === "cloned") && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cloned" id="cloned" />
                  <Label htmlFor="cloned" className="text-gray-300">
                    Use Your Cloned Voice
                  </Label>
                  <Badge className="bg-green-500/20 text-green-300">Available</Badge>
                </div>
              )}
            </RadioGroup>
          </div>

          {/* Audiomarks List */}
          {audiomarks.length > 0 && (
            <div className="space-y-2 mt-4">
              <h3 className="text-white font-medium">Your Audiomarks</h3>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {audiomarks.map((mark, index) => (
                  <div
                    key={mark.id || index}
                    className="flex items-center justify-between text-sm cursor-pointer hover:bg-white/10 rounded px-2 py-1"
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = mark.timestamp
                        setCurrentTime(mark.timestamp)
                        audioRef.current.play()
                        setIsPlaying(true)
                      }
                    }}
                  >
                    <span className="text-gray-300">{Math.floor(mark.timestamp / 60)}:{String(Math.floor(mark.timestamp % 60)).padStart(2, "0")}</span>
                    <span className="text-gray-400 truncate ml-2">{mark.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".wav" onChange={handleFileUpload} className="hidden" />

      {/* Voice Cloning Dialog */}
      <Dialog open={showVoiceCloning} onOpenChange={setShowVoiceCloning}>
        <DialogContent className="bg-slate-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Choose Voice Cloning Model</DialogTitle>
            <DialogDescription className="text-gray-300">Select a model to process your voice sample</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <RadioGroup value={selectedModel} onValueChange={setSelectedModel}>
              {availableModels.map((model) => (
                <div key={model} className="flex items-center space-x-2">
                  <RadioGroupItem value={model} id={model} />
                  <Label htmlFor={model} className="text-gray-300">
                    {model}
                  </Label>
                  {userTier === "premium" && premiumModels.includes(model) && (
                    <Badge className="bg-yellow-500/20 text-yellow-300">Premium</Badge>
                  )}
                </div>
              ))}
            </RadioGroup>

            <div className="flex gap-2">
              <Button
                onClick={handleModelSelection}
                disabled={!selectedModel || isProcessing}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isProcessing ? "Processing..." : "Process Voice"}
              </Button>
              <Button variant="outline" onClick={() => setShowVoiceCloning(false)} disabled={isProcessing}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.error("Audio error:", e)
          toast.error("Error loading audio")
        }}
        className="hidden"
      />
    </div>
  )
}
