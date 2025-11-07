import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to chat if authenticated, login if not
  if (user) {
    redirect('/chat')
  } else {
    redirect('/login')
  }
}
