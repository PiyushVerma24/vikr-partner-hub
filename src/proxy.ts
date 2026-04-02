import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Refresh the Supabase session on every request
  const response = await updateSession(request)

  // Redirect unauthenticated users away from /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const hasSession = [...request.cookies.getAll()].some(
      (c) => c.name.includes('auth-token') || c.name.includes('sb-access-token') || c.name.includes('sb-refresh-token')
    )
    if (!hasSession) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|favicon-32\\.png|icon-192\\.png|icon-512\\.png|apple-touch-icon\\.png|vikr-logo.*|sw\\.js|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
