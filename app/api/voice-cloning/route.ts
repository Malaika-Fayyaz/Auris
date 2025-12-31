import { NextResponse } from "next/server"
import { createServerClient } from "../../../lib/supabase"

export async function POST(request: Request) {
  const formData = await request.formData()
  const userId = formData.get("userId") as string
  const model = formData.get("model") as string
  const audioFile = formData.get("audioFile") as File

  if (!userId || !model || !audioFile) {
    return NextResponse.json(
      {
        success: false,
        error: "User ID, model, and audio file are required",
      },
      { status: 400 },
    )
  }

  const supabase = createServerClient()

  try {
    // 1. Upload the audio file to Supabase Storage
    const fileName = `${userId}-${Date.now()}.wav`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("voice-samples")
      .upload(fileName, audioFile)

    if (uploadError) throw uploadError

    // 2. Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage.from("voice-samples").getPublicUrl(fileName)

    // 3. In a real app, you would call an AI service here to process the voice
    // For demo purposes, we'll simulate processing by waiting
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 4. Store the cloned voice reference in the database
    const { data: voiceData, error: voiceError } = await supabase
      .from("cloned_voices")
      .insert({
        user_id: userId,
        model,
        voice_url: urlData.publicUrl,
        // In a real app, you would store a reference to the processed voice model
      })
      .select()

    if (voiceError) throw voiceError

    return NextResponse.json({
      success: true,
      message: "Voice cloning processed successfully",
      voiceId: voiceData[0].id,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
  }

  const supabase = createServerClient()

  try {
    const { data, error } = await supabase
      .from("cloned_voices")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      hasClonedVoice: data.length > 0,
      voice: data[0] || null,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
