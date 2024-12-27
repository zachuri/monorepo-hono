'use client'

import { Button } from '@repo/ui/components/ui/button'
import { signIn } from '~/lib/auth.client'

export default function SignIn() {
  const homePageUrl = process.env.NEXT_PUBLIC_APP_URL

  return (
    <div className='flex flex-col items-center flex-1 m-8'>
      <div className='flex flex-col gap-12 flex-1 w-full max-w-md'>
        <Button onClick={() => signIn.social({ provider: 'github', callbackURL: homePageUrl })}>
          Github SignIn
        </Button>
        <Button
          onClick={() =>
            signIn.social({
              provider: 'google',
              callbackURL: homePageUrl,
            })
          }
        >
          Google SignIn
        </Button>
      </div>
    </div>
  )
}
