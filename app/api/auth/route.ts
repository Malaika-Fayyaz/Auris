import { NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "../../../lib/supabase"

export async function POST(request: Request) {
  try {
    // Debug: Log environment variables (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Environment check:', {
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
        nodeEnv: process.env.NODE_ENV
      })
    }

    const body = await request.json()
    const { action, email, password, name, tier } = body

    console.log('Registration attempt:', { action, email, name, tier }) // Debug log

    if (!action || !email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing required fields",
          details: "Action, email, and password are required"
        },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    let supabaseAdmin

    try {
      supabaseAdmin = createServiceClient()
    } catch (error: any) {
      console.error("Failed to create service client:", error)
      return NextResponse.json(
        { 
          success: false, 
          error: "Server configuration error",
          details: "Service role key is not properly configured. Please check your .env.local file and make sure SUPABASE_SERVICE_ROLE_KEY is set correctly."
        },
        { status: 500 }
      )
    }

    if (action === "register") {
      if (!name) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Missing required field",
            details: "Name is required for registration"
          },
          { status: 400 }
        )
      }

      // Get the site URL from the request
      const requestUrl = new URL(request.url)
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin
      
      console.log('Using site URL for redirects:', siteUrl) // Debug log

      // Register new user
      console.log('Attempting to sign up user...') // Debug log
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            tier: tier || "free"
          },
          // Use the correct redirect URL
          emailRedirectTo: `${siteUrl}/auth/callback`
        }
      })

      console.log('Sign up response:', { 
        hasUser: !!authData?.user,
        hasError: !!authError,
        errorMessage: authError?.message,
        userData: authData?.user ? {
          id: authData.user.id,
          email: authData.user.email,
          emailConfirmed: authData.user.email_confirmed_at,
          createdAt: authData.user.created_at
        } : null
      }) // Debug log

      if (authError) {
        console.error("Auth error during registration:", {
          message: authError.message,
          status: authError.status,
          name: authError.name
        })
        return NextResponse.json(
          { 
            success: false, 
            error: authError.message || "Registration failed",
            details: `Failed to create user account: ${authError.message}`,
            code: authError.name
          },
          { status: 400 }
        )
      }

      if (!authData.user) {
        console.error("No user data returned from sign up")
        return NextResponse.json(
          { 
            success: false, 
            error: "Registration failed",
            details: "Failed to create user account - no user data returned from Supabase"
          },
          { status: 500 }
        )
      }

      console.log('User created, attempting to create profile...') // Debug log

      try {
        // Create user profile with explicit user_id using admin client
        const { error: profileError } = await supabaseAdmin
          .from("users")
          .insert({
            id: authData.user.id,
            email: email,
            name: name,
            tier: tier || "free",
          })
          .select()
          .single()

        console.log('Profile creation response:', { 
          hasError: !!profileError,
          errorMessage: profileError?.message,
          errorDetails: profileError?.details,
          errorCode: profileError?.code,
          fullError: JSON.stringify(profileError, null, 2)
        }) // Debug log

        if (profileError) {
          console.error("Profile creation error:", {
            message: profileError.message,
            details: profileError.details,
            code: profileError.code,
            hint: profileError.hint,
            fullError: JSON.stringify(profileError, null, 2)
          })
          // If profile creation fails, we should clean up the auth user
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
          return NextResponse.json(
            { 
              success: false, 
              error: "Profile creation failed",
              details: `Failed to create user profile: ${profileError.message}${profileError.hint ? ` (${profileError.hint})` : ''}`,
              code: profileError.code
            },
            { status: 500 }
          )
        }

        return NextResponse.json({ 
          success: true, 
          user: authData.user,
          message: "Registration successful. Please check your email to confirm your account." 
        })
      } catch (error: any) {
        console.error("Unexpected error during profile creation:", {
          message: error.message,
          details: error.details,
          code: error.code,
          stack: error.stack
        })
        // Clean up auth user if it was created
        if (authData.user) {
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        }
        return NextResponse.json(
          { 
            success: false, 
            error: "Unexpected error",
            details: `An unexpected error occurred: ${error.message}`,
            code: error.code
          },
          { status: 500 }
        )
      }
    } else if (action === "login") {
      console.log('Login attempt:', { email }) // Debug log

      // Login existing user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Login response:', {
        hasUser: !!data?.user,
        hasError: !!error,
        errorMessage: error?.message,
        userData: data?.user ? {
          id: data.user.id,
          email: data.user.email,
          emailConfirmed: data.user.email_confirmed_at,
          createdAt: data.user.created_at
        } : null
      }) // Debug log

      if (error) {
        console.error("Auth error during login:", {
          message: error.message,
          status: error.status,
          name: error.name
        })
        return NextResponse.json(
          { 
            success: false, 
            error: error.message === "Email not confirmed" ? "Please confirm your email" : "Login failed",
            details: error.message === "Email not confirmed" 
              ? "Please check your email for a confirmation link. Click the link to confirm your email address before logging in."
              : error.message
          },
          { status: 401 }
        )
      }

      if (!data.user) {
        console.error("No user data returned from login")
        return NextResponse.json(
          { 
            success: false, 
            error: "Login failed",
            details: "User not found"
          },
          { status: 404 }
        )
      }

      console.log('User authenticated, fetching profile...') // Debug log

      // Get user profile
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single()

      console.log('Profile fetch response:', {
        hasData: !!userData,
        hasError: !!userError,
        errorMessage: userError?.message,
        errorCode: userError?.code
      }) // Debug log

      if (userError) {
        console.error("Profile fetch error:", {
          message: userError.message,
          code: userError.code,
          details: userError.details
        })
        // If profile doesn't exist, return a specific error
        if (userError.code === "PGRST116") {
          return NextResponse.json(
            { 
              success: false, 
              error: "Account not found",
              details: "Please register first",
              code: "PROFILE_NOT_FOUND"
            }, 
            { status: 404 }
          )
        }
        return NextResponse.json(
          { 
            success: false, 
            error: "Profile fetch failed",
            details: userError.message
          },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        user: data.user, 
        profile: userData,
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token
      })
    } else if (action === "logout") {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Logout error:", error)
        return NextResponse.json(
          { 
            success: false, 
            error: "Logout failed",
            details: error.message
          },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Invalid action",
        details: "The provided action is not supported"
      }, 
      { status: 400 }
    )
  } catch (error: any) {
    console.error("Unexpected error in auth route:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Unexpected error",
        details: error.message || "An unexpected error occurred",
        code: error.code || "UNKNOWN_ERROR"
      }, 
      { status: 500 }
    )
  }
}
