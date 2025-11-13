'use client'

import { formatDistanceToNow } from 'date-fns'
import { Bot } from 'lucide-react'
import { CopyButton } from '@/shared/components/CopyButton'
import { ThinkingBlock } from './ThinkingBlock'
import { MermaidDiagram } from '@/shared/components/MermaidDiagram'
import { parseMermaidBlocks } from '@/shared/utils/parseMermaid'

interface MessageProps {
  role: 'user' | 'assistant' | 'system'
  content: string
  thinking?: string // Extended thinking content (Claude 4 models)
  timestamp?: string
  tokensInput?: number // Input tokens used
  tokensOutput?: number // Output tokens used
  isStreaming?: boolean // Whether the message is currently streaming
}

export function Message({ role, content, thinking, timestamp, tokensInput, tokensOutput, isStreaming }: MessageProps) {
  const isUser = role === 'user'

  // Parse content for Mermaid diagrams
  const contentBlocks = parseMermaidBlocks(content)

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
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>

            {/* Copy Button - shows on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text={content} />
            </div>
          </div>
        )}

        {/* ThinkingBlock - minimalista en itálicas */}
        {!isUser && thinking && <ThinkingBlock content={thinking} />}

        {/* Content with Mermaid diagram support */}
        <div className="prose prose-invert prose-sm max-w-none">
          {contentBlocks.map((block, index) => {
            if (block.type === 'mermaid') {
              return <MermaidDiagram key={index} chart={block.content} />
            }
            return (
              <p key={index} className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                {block.content}
              </p>
            )
          })}
        </div>

        {timestamp && (
          <p className="text-xs text-[var(--text-muted)] mt-2">
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </p>
        )}
      </div>
    </div>
  )
}
