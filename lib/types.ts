export interface User {
  id: string
  email: string
  name: string
  tier: "free" | "premium"
  created_at: string
}

export interface Book {
  id: string
  title: string
  author: string
  description: string
  cover_url: string
  audio_url: string
  duration: string
  rating: number
  genre: string
  book_content: string
  user_id?: string
}

export interface Audiomark {
  id: string
  user_id: string
  book_id: string
  timestamp: number
  note: string
  created_at: string
}

export interface ClonedVoice {
  id: string
  user_id: string
  model: string
  voice_url: string
  created_at: string
}
