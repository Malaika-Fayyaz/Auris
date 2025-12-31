import { createClient } from "@supabase/supabase-js"

// These would come from environment variables in production
const supabaseUrl = "https://hamrsqroyaxswrlaqosb.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhbXJzcXJveWF4c3dybGFxb3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NjI4NzcsImV4cCI6MjA2NTAzODg3N30.hF_nKpRe19hAjlZNVr64C9Xe4qI6WoNQYCwnPNQmJsw"

// Get the site URL from environment variable or use the current origin
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')

// Create a single supabase client for the browser
export const createBrowserClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true
    }
  })
}

// Create a single supabase client for server components or API routes
export const createServerClient = (options?: { cookies?: any, accessToken?: string }) => {
  // If accessToken is provided, use it for Authorization header
  if (options && options.accessToken) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${options.accessToken}` } },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
    })
  }
  // If cookies are provided (from Next.js API route), use them for auth context
  if (options && options.cookies) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Cookie: options.cookies } },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
    })
  }
  // Default: no cookies or accessToken
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
  })
}

// Validate Supabase key format
const isValidSupabaseKey = (key: string) => {
  // Check if key starts with eyJ (valid JWT token)
  if (!key.startsWith('eyJ')) {
    return false
  }
  
  // Check if key has three parts separated by dots (JWT format)
  const parts = key.split('.')
  if (parts.length !== 3) {
    return false
  }
  
  return true
}

// Create a supabase client with service role for admin operations
// This should ONLY be used in server-side code (API routes, server components)
export const createServiceClient = () => {
  // Only check for service role key on the server side
  if (typeof window === 'undefined') {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseServiceKey) {
      console.error('Service role key is missing. Please check your .env.local file')
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables')
    }

    // Validate the key format
    if (!isValidSupabaseKey(supabaseServiceKey)) {
      console.error('Invalid service role key format. Key should start with eyJ and be a valid JWT token')
      throw new Error('Invalid SUPABASE_SERVICE_ROLE_KEY format')
    }

    // Log the first few characters of the key for debugging (safely)
    if (process.env.NODE_ENV === 'development') {
      console.log('Service role key check:', {
        hasKey: true,
        keyLength: supabaseServiceKey.length,
        keyPrefix: supabaseServiceKey.substring(0, 10) + '...',
        keyEndsWith: '...' + supabaseServiceKey.substring(supabaseServiceKey.length - 10),
        isValidFormat: isValidSupabaseKey(supabaseServiceKey)
      })
    }
    
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
    })
  }
  
  // On the client side, return the regular client
  return createBrowserClient()
}
