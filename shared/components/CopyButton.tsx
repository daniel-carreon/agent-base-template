'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  /** Text to copy to clipboard */
  text: string
  /** Optional CSS classes */
  className?: string
}

/**
 * CopyButton Component
 *
 * Copies text to clipboard with visual feedback
 */
export function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`glass-hover p-2 rounded-lg transition-all duration-200 ${className}`}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
    >
      {copied ? (
        <Check className="w-4 h-4 text-[var(--success)]" strokeWidth={2.5} />
      ) : (
        <Copy className="w-4 h-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]" strokeWidth={2} />
      )}
    </button>
  )
}
