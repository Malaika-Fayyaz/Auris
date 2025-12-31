import { createServerClient } from "../../../lib/supabase"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirect to the home page after successful confirmation
      return NextResponse.redirect(new URL("/", requestUrl.origin))
    }
  }

  // If there's an error or no code, redirect to the login page
  return NextResponse.redirect(new URL("/login", requestUrl.origin))
} 