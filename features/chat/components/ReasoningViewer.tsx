'use client'

import { useState } from 'react'
import { Brain, ChevronDown, ChevronRight } from 'lucide-react'

interface ReasoningViewerProps {
  content: string
  isStreaming?: boolean
  tokensInput?: number
  tokensOutput?: number
  className?: string
}

/**
 * ReasoningViewer Component
 *
 * Displays the model's reasoning/thinking process in a collapsible purple-gradient UI.
 * Inspired by arbrain.ai's design with token count integration.
 *
 * Features:
 * - Brain icon with purple gradient styling
 * - Collapsible with expand/collapse animation
 * - Shows "Pensando..." when streaming
 * - Displays character count and token usage
 * - Dark mode support
 */
export function ReasoningViewer({
  content,
  isStreaming = false,
  tokensInput,
  tokensOutput,
  className = '',
}: ReasoningViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Don't render if no content and not streaming
  if (!content && !isStreaming) return null

  const toggleExpanded = () => {
    if (content) {
      setIsExpanded(!isExpanded)
    }
  }

  const characterCount = content ? content.length : 0
  const totalTokens = (tokensInput || 0) + (tokensOutput || 0)

  return (
    <div className={`reasoning-viewer mb-3 ${className}`}>
      {/* Header - clickable to expand/collapse */}
      <div
        onClick={toggleExpanded}
        className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700/30 cursor-pointer hover:bg-gradient-to-r hover:from-purple-100 hover:to-purple-150 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30 transition-all duration-200"
      >
        {/* Brain Icon */}
        <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />

        {/* Label */}
        <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
          {isStreaming && !content ? 'Pensando...' : 'Proceso de pensamiento'}
        </span>

        {/* Stats - character count and tokens */}
        {content && (
          <div className="flex items-center space-x-3 ml-auto text-xs text-purple-600 dark:text-purple-400">
            <span>{characterCount} chars</span>
            {totalTokens > 0 && (
              <span className="flex items-center space-x-1">
                <span>•</span>
                <span>{totalTokens.toLocaleString()} tokens</span>
              </span>
            )}
          </div>
        )}

        {/* Expand/Collapse Icon */}
        {content && (
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            )}
          </div>
        )}
      </div>

      {/* Content - collapsible */}
      {isExpanded && content && (
        <div className="mt-2 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700/30 animate-fade-in">
          <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
            {content}
          </pre>

          {/* Token breakdown (if available) */}
          {(tokensInput || tokensOutput) && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/30 flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
              {tokensInput && (
                <span>
                  Input: <span className="font-semibold">{tokensInput.toLocaleString()}</span> tokens
                </span>
              )}
              {tokensOutput && (
                <span>
                  Output: <span className="font-semibold">{tokensOutput.toLocaleString()}</span> tokens
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
