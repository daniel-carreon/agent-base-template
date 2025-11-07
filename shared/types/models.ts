/**
 * Model Information Interface
 * Defines the structure for AI model configuration
 */
export interface ModelInfo {
  /** Unique identifier for the model */
  id: string

  /** Display name shown in UI */
  name: string

  /** Short description of model capabilities */
  description: string

  /** Provider name (anthropic, openai, google, openrouter) */
  provider: 'anthropic' | 'openai' | 'google' | 'openrouter'

  /** Supports extended thinking (Claude models only) */
  supportsThinking?: boolean

  /** Whether this model requires premium/pro access */
  isPremium: boolean

  /** Visual indicator status (enabled by default) */
  statusIndicator?: 'enabled' | 'disabled'

  /** Maximum context window in tokens */
  contextWindow: number

  /** Cost per million input tokens in USD */
  costPerMillionInput: number

  /** Cost per million output tokens in USD */
  costPerMillionOutput: number
}

/**
 * Model Selection State
 * Used for tracking selected model in UI
 */
export interface ModelSelection {
  currentModelId: string
  availableModels: ModelInfo[]
}
