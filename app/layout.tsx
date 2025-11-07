import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from '@/features/theme/context/ThemeContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Agent Base Template',
  description: 'AI-powered conversational agent with streaming and persistent history',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
