import { NextResponse } from "next/server"
import { createServerClient } from "../../../lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const genre = searchParams.get("genre")
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "9")
  const offset = (page - 1) * limit

  const supabase = createServerClient()

  try {
    let query = supabase
      .from("books")
      .select("*", { count: "exact" })

    if (genre) {
      query = query.eq("genre", genre)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Add pagination
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      books: data,
      total: count,
      page,
      limit,
      hasMore: offset + limit < (count || 0)
    })
  } catch (error: any) {
    console.error("Error fetching books:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: "Failed to fetch books from the database"
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  // This would be an admin-only endpoint to add new books
  const book = await request.json()
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase
      .from("books")
      .insert(book)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      book: data 
    })
  } catch (error: any) {
    console.error("Error creating book:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: "Failed to create book in the database"
      }, 
      { status: 500 }
    )
  }
}
