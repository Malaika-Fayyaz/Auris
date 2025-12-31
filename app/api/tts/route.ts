// app/api/tts/route.ts
import { NextResponse } from 'next/server'
import googleTTS from 'google-tts-api'

export async function POST(request: Request) {
  try {
    const { text, lang = 'en', slow = false } = await request.json()
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }
    // Get the TTS audio URL from Google
    const url = googleTTS.getAudioUrl(text, { lang, slow })
    return NextResponse.json({ url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}