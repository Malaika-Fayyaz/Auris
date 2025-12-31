import { NextResponse } from "next/server"
import { createServerClient } from "../../../lib/supabase"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const bookId = searchParams.get("bookId")

  if (!userId) {
    return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
  }

  const supabase = createServerClient({ cookies: cookies().toString() })

  try {
    let query = supabase
      .from("audiomarks")
      .select("*, books(title, author, cover_url)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (bookId) {
      query = query.eq("book_id", bookId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, audiomarks: data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Debug helper
function logDebug(...args: any[]) {
  try {
    // eslint-disable-next-line no-console
    console.log('[AURIS API DEBUG]', ...args)
  } catch {}
}

export async function POST(request: Request) {
  const audiomark = await request.json()
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "");
  logDebug('POST /api/audiomarks - incoming audiomark:', audiomark);
  logDebug('POST /api/audiomarks - accessToken:', accessToken);
  const supabase = createServerClient({ accessToken });
  // Try to get the user from the session
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  logDebug('POST /api/audiomarks - supabase.auth.getUser:', { user, userError });

  try {
    const { data, error } = await supabase
      .from("audiomarks")
      .insert({
        user_id: audiomark.userId,
        book_id: audiomark.bookId,
        timestamp: audiomark.timestamp,
        note: audiomark.note,
      })
      .select()
    logDebug('POST /api/audiomarks - insert result:', { data, error })

    if (error) throw error

    return NextResponse.json({ success: true, audiomark: data[0] })
  } catch (error: any) {
    logDebug('POST /api/audiomarks - CATCH error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ success: false, error: "Audiomark ID is required" }, { status: 400 })
  }

  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "");
  const supabase = createServerClient({ accessToken });

  try {
    const { error } = await supabase.from("audiomarks").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const { note } = await request.json()

  if (!id) {
    return NextResponse.json({ success: false, error: "Audiomark ID is required" }, { status: 400 })
  }

  if (!note) {
    return NextResponse.json({ success: false, error: "Note is required" }, { status: 400 })
  }

  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "");
  const supabase = createServerClient({ accessToken });

  try {
    const { data, error } = await supabase
      .from("audiomarks")
      .update({ note })
      .eq("id", id)
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, audiomark: data[0] })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
