import { SignIn } from '@clerk/nextjs'

import { authAppearance } from "@/lib/auth-appearance";

export default function Page() {
  return (
    <SignIn
      appearance={authAppearance}
      forceRedirectUrl="/dashboard"
      fallbackRedirectUrl="/dashboard"
    />
  )
}
