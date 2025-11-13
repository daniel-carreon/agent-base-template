'use client'

import { Spinner } from '@/shared/components/Spinner'
import { ModelSelector } from './ModelSelector'
import { FormEvent, KeyboardEvent, useRef, useEffect } from 'react'

interface ChatInputProps {
  input: string
  isLoading: boolean
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: FormEvent) => void
}

export function ChatInput({ input, isLoading, onInputChange, onSubmit }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input?.trim() && !isLoading) {
        onSubmit(e as unknown as FormEvent)
      }
    }
  }

  return (
    <form onSubmit={onSubmit} className="border-t border-[var(--glass-border)] p-6 bg-[var(--glass-bg)] backdrop-blur-xl">
      <div className="max-w-4xl mx-auto flex gap-4 items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          className="input-glass flex-1 min-h-[56px] max-h-[200px]"
          placeholder="Type your message..."
          rows={1}
        />

        <button
          type="submit"
          disabled={!input?.trim() || isLoading}
          className="btn-primary h-[56px] px-8 shrink-0"
        >
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      {/* Model Selector - Below Input */}
      <div className="max-w-4xl mx-auto mt-3 flex items-center justify-between">
        <ModelSelector />
        {input && input.length > 0 && (
          <div className="text-xs text-white/30">
            {input.length} characters
          </div>
        )}
      </div>
    </form>
  )
}
