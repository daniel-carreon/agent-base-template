import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { openrouter } from '@/shared/lib/openrouter'
import { getModelById, DEFAULT_MODEL_ID } from '@/config/models'
import type { LanguageModel } from 'ai'

/**
 * Get AI SDK model instance based on model ID
 *
 * Supports multiple providers: Anthropic, OpenAI, Google
 *
 * @param modelId - The model ID to instantiate
 * @returns Language model instance
 */
export function getModelInstance(modelId: string): LanguageModel {
  const modelInfo = getModelById(modelId)

  if (!modelInfo) {
    console.warn(`Model ${modelId} not found, falling back to default`)
    return openrouter('anthropic/claude-haiku-4.5')
  }

  switch (modelInfo.provider) {
    case 'anthropic':
      return anthropic(modelId)

    case 'openai':
      return openai(modelId)

    case 'google':
      return google(modelId)

    case 'openrouter':
      return openrouter(modelId)

    default:
      console.warn(`Unknown provider for model ${modelId}, falling back to default`)
      return openrouter('anthropic/claude-haiku-4.5')
  }
}

/**
 * Get default model instance
 */
export function getDefaultModel(): LanguageModel {
  return getModelInstance(DEFAULT_MODEL_ID)
}

/**
 * Validate and sanitize model ID from user input
 */
export function validateModelId(modelId: unknown): string {
  if (typeof modelId !== 'string' || !modelId) {
    return DEFAULT_MODEL_ID
  }

  const modelInfo = getModelById(modelId)
  return modelInfo ? modelId : DEFAULT_MODEL_ID
}
