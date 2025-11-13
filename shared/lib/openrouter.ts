import { createOpenAI } from '@ai-sdk/openai'

/**
 * OpenRouter Provider
 *
 * OpenRouter provides access to 400+ AI models through a single unified API.
 * It uses the OpenAI SDK format but with a custom baseURL.
 *
 * Documentation: https://openrouter.ai/docs
 */
export const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
})

/**
 * Custom OpenRouter Streaming with Reasoning Support
 *
 * This function manually parses OpenRouter's SSE stream to extract both
 * content and reasoning deltas, which AI SDK's streamText() doesn't support.
 *
 * Based on arbrain.ai's working implementation.
 */
export async function* streamOpenRouterChat(config: {
  model: string
  messages: Array<{ role: string; content: string }>
  systemPrompt?: string
  reasoningConfig?: {
    effort: 'low' | 'medium' | 'high'
    exclude?: boolean
  }
}): AsyncGenerator<{
  type: 'content' | 'reasoning' | 'done' | 'error'
  delta?: string
  error?: string
}> {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    yield { type: 'error', error: 'Missing OPENROUTER_API_KEY' }
    return
  }

  const requestBody: any = {
    model: config.model,
    messages: config.systemPrompt
      ? [{ role: 'system', content: config.systemPrompt }, ...config.messages]
      : config.messages,
    stream: true,
  }

  // Add reasoning config if provided
  if (config.reasoningConfig) {
    requestBody.reasoning = config.reasoningConfig
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': process.env.NEXT_PUBLIC_SITE_NAME || 'AI Chat',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      yield { type: 'error', error: `OpenRouter API error: ${response.status} ${errorText}` }
      return
    }

    if (!response.body) {
      yield { type: 'error', error: 'No response body from OpenRouter' }
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        yield { type: 'done' }
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim()

          if (jsonStr === '[DONE]') {
            yield { type: 'done' }
            continue
          }

          try {
            const data = JSON.parse(jsonStr)
            const delta = data.choices?.[0]?.delta

            if (!delta) continue

            // Extract content delta
            if (delta.content) {
              yield { type: 'content', delta: delta.content }
            }

            // Extract reasoning delta (THIS IS THE KEY PART!)
            if (delta.reasoning) {
              yield { type: 'reasoning', delta: delta.reasoning }
            }
          } catch (parseError) {
            console.error('[OpenRouter Stream] JSON parse error:', parseError)
            // Continue processing other chunks
          }
        }
      }
    }
  } catch (error) {
    console.error('[OpenRouter Stream] Error:', error)
    yield {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown streaming error',
    }
  }
}

/**
 * OpenRouter Model IDs
 *
 * These are the official model IDs from OpenRouter.
 * They support extended thinking when using Anthropic models.
 */
export const OPENROUTER_MODELS = {
  // Anthropic Claude models via OpenRouter
  CLAUDE_OPUS_4: 'anthropic/claude-opus-4',
  CLAUDE_SONNET_4: 'anthropic/claude-sonnet-4',
  CLAUDE_SONNET_4_5: 'anthropic/claude-sonnet-4.5',
  CLAUDE_HAIKU_4_5: 'anthropic/claude-haiku-4.5',

  // OpenAI models via OpenRouter
  GPT_4O: 'openai/gpt-4o',
  GPT_4O_MINI: 'openai/gpt-4o-mini',
  O1: 'openai/o1',
  O1_MINI: 'openai/o1-mini',

  // Google models via OpenRouter
  GEMINI_2_5_PRO: 'google/gemini-2.5-pro',
  GEMINI_2_5_FLASH: 'google/gemini-2.5-flash',

  // Meta models via OpenRouter
  LLAMA_3_3_70B: 'meta-llama/llama-3.3-70b-instruct',

  // DeepSeek models via OpenRouter
  DEEPSEEK_V3: 'deepseek/deepseek-v3',
} as const

export type OpenRouterModelId = (typeof OPENROUTER_MODELS)[keyof typeof OPENROUTER_MODELS]
