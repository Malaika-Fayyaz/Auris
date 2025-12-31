import { NextResponse } from 'next/server'
import { writeFile, mkdir, readFile, unlink } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'
import espeak from 'espeak-ng'
import gTTS from 'node-gtts'

const execAsync = promisify(exec)

// Function to convert text to speech using espeak
async function textToSpeech(text: string): Promise<Buffer> {
  try {
    // Create a temporary file for the output
    const outputPath = join(process.cwd(), 'public', 'generated', `${uuidv4()}.wav`)
    console.log('Creating temporary file at:', outputPath)
    
    // Use espeak to convert text to speech
    // -v en: Use English voice
    // -w: Write to WAV file
    // -s 150: Speaking speed (words per minute)
    // -p 50: Pitch (0-99)
    const command = `espeak -v en -w "${outputPath}" -s 150 -p 50 "${text}"`
    console.log('Executing command:', command)
    
    const { stdout, stderr } = await execAsync(command)
    console.log('espeak stdout:', stdout)
    if (stderr) console.error('espeak stderr:', stderr)
    
    // Check if file exists
    if (!existsSync(outputPath)) {
      throw new Error(`Output file not created at ${outputPath}`)
    }
    
    // Read the generated WAV file
    console.log('Reading generated file')
    const audioData = await readFile(outputPath)
    console.log('File read successfully, size:', audioData.length)
    
    // Clean up the temporary file
    console.log('Cleaning up temporary file')
    await unlink(outputPath)
    
    return audioData
  } catch (error) {
    console.error('Text to speech conversion error:', error)
    throw error
  }
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json()
    console.log("Received text for TTS:", text?.substring(0, 100) + "...")

    if (!text) {
      console.error("No text provided in request")
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      )
    }

    // Create generated directory if it doesn't exist
    const generatedDir = join(process.cwd(), 'public', 'generated')
    console.log("Generated directory path:", generatedDir)
    
    try {
      await mkdir(generatedDir, { recursive: true })
      console.log("Generated directory created/verified")
    } catch (error) {
      console.error("Error creating generated directory:", error)
      throw new Error("Failed to create output directory")
    }

    // Generate unique filename
    const filename = `${uuidv4()}.mp3`
    const outputPath = join(generatedDir, filename)
    console.log("Output path:", outputPath)

    // Generate audio using Google Text-to-Speech
    try {
      const gtts = new gTTS("en")
      await new Promise<void>((resolve, reject) => {
        gtts.save(outputPath, text, (err: Error | null) => {
          if (err) reject(err)
          else resolve()
        })
      })

      console.log("Audio file generated successfully")
    } catch (error) {
      console.error("Error generating audio:", error)
      throw new Error("Failed to generate audio file")
    }

    // Verify the file was created
    try {
      const stats = await readFile(outputPath)
      console.log("Generated file size:", stats.length)
      if (stats.length === 0) {
        throw new Error("Generated file is empty")
      }
    } catch (error) {
      console.error("Error verifying generated file:", error)
      throw new Error("Failed to verify generated audio file")
    }

    // Construct URL for the generated file
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const audioUrl = `${baseUrl}/generated/${filename}`
    console.log("Generated audio URL:", audioUrl)

    return NextResponse.json({ audioUrl })
  } catch (error) {
    console.error("Error in generate-voice:", error)
    return NextResponse.json(
      { 
        error: "Failed to generate voice",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
} 