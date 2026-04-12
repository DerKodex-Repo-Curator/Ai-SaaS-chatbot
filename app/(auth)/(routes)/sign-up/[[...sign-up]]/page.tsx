import { SignUp } from "@clerk/nextjs";

import { authAppearance } from "@/lib/auth-appearance";

export default function SignUpPage() 
{
    return (
        <SignUp
            appearance={authAppearance}
            forceRedirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
        />
    )
}
