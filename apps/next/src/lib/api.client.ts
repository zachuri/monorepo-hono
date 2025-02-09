import type { AppType } from '@repo/api/src/app'
import { env } from '@repo/app/env/next'
import { getItem } from '@repo/app/provider/auth/cookie-store'
import { hc } from 'hono/client'

const API_URL = env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

// Function to create the API client with headers
export const createApiClient = () => {
  // Get the token from cookies, provide a default value if not found
  const token = getItem('better-auth.session_token') ?? ''

  // Create and return the client with the Authorization header
  return hc<AppType>(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
      // Ensure other necessary headers are included
      'Content-Type': 'application/json',
    },
  })
}

// Usage
export const client = createApiClient()
