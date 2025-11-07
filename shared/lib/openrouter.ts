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
 * OpenRouter Model IDs
 *
 * These are the official model IDs from OpenRouter.
 * They support extended thinking when using Anthropic models.
 */
export const OPENROUTER_MODELS = {
  // Anthropic Claude models via OpenRouter
  CLAUDE_OPUS_4: 'anthropic/claude-opus-4',
  CLAUDE_SONNET_4: 'anthropic/claude-sonnet-4',
  CLAUDE_SONNET_4_5: 'anthropic/claude-sonnet-4-5',
  CLAUDE_HAIKU_4_5: 'anthropic/claude-haiku-4-5',

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
