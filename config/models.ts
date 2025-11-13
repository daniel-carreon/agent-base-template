import type { ModelInfo } from '@/shared/types/models'

/**
 * Available AI Models Configuration
 *
 * All models are now accessed via OpenRouter for simplified API management.
 * OpenRouter provides unified access to 400+ models with a single API key.
 *
 * Update this list when adding new models or when pricing changes.
 * Pricing shown is approximate and may vary based on OpenRouter's rates.
 */
export const AVAILABLE_MODELS: ModelInfo[] = [
  // ========================================
  // ANTHROPIC MODELS (via OpenRouter)
  // ========================================
  {
    id: 'anthropic/claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    description: 'Rápido y eficiente con razonamiento extendido',
    provider: 'openrouter',
    isPremium: false, // Free tier model
    supportsThinking: true, // Extended thinking support via OpenRouter
    statusIndicator: 'enabled',
    contextWindow: 200000, // 200k tokens
    costPerMillionInput: 1,
    costPerMillionOutput: 5,
  },
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    description: 'Balance perfecto entre velocidad y capacidad',
    provider: 'openrouter',
    isPremium: true,
    supportsThinking: true, // Extended thinking support
    statusIndicator: 'enabled',
    contextWindow: 200000,
    costPerMillionInput: 3,
    costPerMillionOutput: 15,
  },
  {
    id: 'anthropic/claude-opus-4',
    name: 'Claude Opus 4',
    description: 'Máxima capacidad para tareas complejas',
    provider: 'openrouter',
    isPremium: true,
    supportsThinking: true, // Extended thinking support
    statusIndicator: 'enabled',
    contextWindow: 200000,
    costPerMillionInput: 15,
    costPerMillionOutput: 75,
  },

  // ========================================
  // OPENAI MODELS (via OpenRouter)
  // ========================================
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'Modelo multimodal de alta capacidad',
    provider: 'openrouter',
    isPremium: true,
    statusIndicator: 'enabled',
    contextWindow: 128000,
    costPerMillionInput: 2.5,
    costPerMillionOutput: 10,
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Versión optimizada y económica de GPT-4o',
    provider: 'openrouter',
    isPremium: false,
    statusIndicator: 'enabled',
    contextWindow: 128000,
    costPerMillionInput: 0.15,
    costPerMillionOutput: 0.6,
  },

  // ========================================
  // GOOGLE MODELS (via OpenRouter)
  // ========================================
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Modelo avanzado de Google para razonamiento',
    provider: 'openrouter',
    isPremium: true,
    statusIndicator: 'enabled',
    contextWindow: 1000000, // 1M tokens
    costPerMillionInput: 3.5,
    costPerMillionOutput: 10.5,
  },
]

/**
 * Default model configuration
 * Updated to use OpenRouter format
 */
export const DEFAULT_MODEL_ID = 'anthropic/claude-haiku-4.5'

/**
 * Get model info by ID
 */
export function getModelById(id: string): ModelInfo | undefined {
  return AVAILABLE_MODELS.find((model) => model.id === id)
}

/**
 * Get free tier models
 */
export function getFreeModels(): ModelInfo[] {
  return AVAILABLE_MODELS.filter((model) => !model.isPremium)
}

/**
 * Get premium models
 */
export function getPremiumModels(): ModelInfo[] {
  return AVAILABLE_MODELS.filter((model) => model.isPremium)
}

/**
 * Validate if model exists and is available
 */
export function isValidModel(id: string): boolean {
  return AVAILABLE_MODELS.some((model) => model.id === id)
}
