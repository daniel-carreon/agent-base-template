'use client'

import { formatDistanceToNow } from 'date-fns'
import { Bot } from 'lucide-react'
import { CopyButton } from '@/shared/components/CopyButton'
import { ThinkingBlock } from './ThinkingBlock'

interface MessageProps {
  role: 'user' | 'assistant' | 'system'
  content: string
  thinking?: string // Extended thinking content (Claude 4 models)
  timestamp?: string
}

export function Message({ role, content, thinking, timestamp }: MessageProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} fade-in`}>
      <div
        className={`max-w-[80%] relative group ${
          isUser
            ? 'message-user'
            : 'message-assistant'
        }`}
      >
        {!isUser && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white dark:text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[var(--text-secondary)] text-sm font-medium">Agente Base</span>
            </div>

            {/* Copy Button - shows on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text={content} />
            </div>
          </div>
        )}

        {/* Extended Thinking Block - Claude 4 models only */}
        {!isUser && thinking && <ThinkingBlock content={thinking} />}

        <div className="prose prose-invert prose-sm max-w-none">
          <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>

        {timestamp && (
          <p className="text-xs text-white/30 mt-2">
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </p>
        )}
      </div>
    </div>
  )
}
