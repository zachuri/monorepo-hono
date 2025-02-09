'use client'

import { Button } from '@repo/ui/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { client } from '~/lib/api.client'
import { signOut, useSession } from '~/lib/auth.client'

export default function App() {
  const router = useRouter()
  const session = useSession()

  const { data: hello, isLoading: userIsLoading } = useQuery({
    queryKey: ['hello'],
    queryFn: async () => {
      const response = await client.api.hello.$get()
      if (!response.ok) {
        return null
      }

      return await response.json()
    },
  })

  const user = session.data?.user

  if (!user || userIsLoading) {
    return <p>Not logged in</p>
  }

  // TODO: update use of useSession with useQueryClient
  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out failed', error)
    }
  }

  return (
    <div>
      <p>Logged in as: {user.email}</p>
      {hello && <p>Hello: {hello.message}</p>}
      <Button onClick={handleSignOut}>Sign Out</Button>
    </div>
  )
}
