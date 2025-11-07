'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock } from 'lucide-react'

interface ThinkingBlockProps {
  content: string
}

export function ThinkingBlock({ content }: ThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!content || content.trim() === '') return null

  return (
    <div className="mb-3">
      {/* Toggle Button - Minimalista estilo Anthropic */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-sm group"
      >
        <Clock className="w-3.5 h-3.5" strokeWidth={2} />
        <span className="italic font-medium">Pensando...</span>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5" strokeWidth={2} />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />
        )}
      </button>

      {/* Thinking Content - Collapsible */}
      {isExpanded && (
        <div className="mt-2 pl-6 border-l-2 border-[var(--text-muted)]/20 animate-fade-in">
          <p className="text-[var(--text-muted)] text-sm italic leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>
      )}
    </div>
  )
}
