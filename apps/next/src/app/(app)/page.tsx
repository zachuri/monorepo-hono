'use client'

import { Button } from '@repo/ui/button'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from '~/lib/api.client'
import { signOut, useSession } from '~/lib/auth.client'

export default function App() {
  const router = useRouter()
  const session = useSession()

  const { data: test, isLoading } = useQuery({
    queryKey: ['hello'],
    queryFn: async () => {
      const response = await api.user.accounts.$get()
      if (!response.ok) {
        return null
      }

      return await response.json()
    },
  })

  const user = session.data?.user

  // TODO: update use of useSession with useQueryClient
  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/sign-in')
    } catch (error) {
      console.error('Sign out failed', error)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      {isLoading && <p>Loading</p>}
      {!isLoading && !user && <p>User not found</p>}
      {!isLoading && user && (
        <div className='flex flex-col items-center justify-center gap-5'>
          <h2 className='text-2xl'>Logged in as: {user.email}</h2>
          {test && <p className='text-lg'>Providers: {test.map(provider => provider.providerId).join(', ')}</p>}
          <Button onClick={handleSignOut}>Sign Out</Button>
        </div>
      )}
    </div>
  )
}
