import { Suspense } from 'react'
import { LoginForm } from './LoginForm'

// Suspense boundary required because LoginForm calls useSearchParams()
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
