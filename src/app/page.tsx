import { redirect } from 'next/navigation'

// Root → proxy redirects to /login if unauthenticated, /overview if already authed
export default function RootPage() {
  redirect('/overview')
}
