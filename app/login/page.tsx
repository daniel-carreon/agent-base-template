import { LoginButton } from '@/features/auth/components/LoginButton'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none" />

      {/* Main card */}
      <div className="glass-strong p-12 max-w-md w-full space-y-8 relative fade-in">
        {/* Logo/Icon - Placeholder geometric shape */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center glass">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gradient">
            Welcome Back
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">
            Sign in to continue your conversations
          </p>
        </div>

        {/* Divider */}
        <div className="divider" />

        {/* Login button */}
        <div className="flex flex-col items-center gap-4">
          <LoginButton />

          <p className="text-[var(--text-muted)] text-sm text-center max-w-xs">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Features */}
        <div className="pt-8 space-y-3">
          <div className="flex items-center gap-3 text-[var(--text-muted)] text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Secure authentication with Google</span>
          </div>
          <div className="flex items-center gap-3 text-[var(--text-muted)] text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>AI-powered conversations</span>
          </div>
          <div className="flex items-center gap-3 text-[var(--text-muted)] text-sm">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Persistent conversation history</span>
          </div>
        </div>
      </div>

      {/* Floating orbs - decorative */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  )
}
