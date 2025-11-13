/**
 * Extract thinking/reasoning content from AI messages
 *
 * Supports multiple formats:
 * - Vercel AI SDK reasoning parts (standard)
 * - OpenRouter reasoning_details (raw response)
 * - Anthropic experimental_providerMetadata (backward compatibility)
 *
 * @param message - The message object from useChat or API
 * @returns The thinking/reasoning text content, or empty string if none
 */
export function extractThinkingContent(message: any): string {
  if (!message) return ''

  // 1. Try Vercel AI SDK reasoning parts (AI SDK 4.2+)
  // This is the standard format from streamText with reasoning support
  if (message.parts && Array.isArray(message.parts)) {
    const reasoningPart = message.parts.find((p: any) => p.type === 'reasoning')
    if (reasoningPart?.text) {
      return reasoningPart.text
    }
  }

  // 2. Try OpenRouter reasoning_details (raw response format)
  // OpenRouter returns reasoning in a structured format
  if (message.reasoning_details && Array.isArray(message.reasoning_details)) {
    const thinkingTexts = message.reasoning_details
      .filter((r: any) => r.type === 'reasoning.text')
      .map((r: any) => r.text)
      .filter((text: string) => text && text.trim())

    if (thinkingTexts.length > 0) {
      return thinkingTexts.join('\n\n')
    }
  }

  // 3. Fallback: Anthropic experimental_providerMetadata (backward compatibility)
  // This was the format used with Anthropic API direct
  const anthropicThinking = message.experimental_providerMetadata?.anthropic?.thinking
  if (anthropicThinking && typeof anthropicThinking === 'string') {
    return anthropicThinking
  }

  return ''
}

/**
 * Check if a message has thinking/reasoning content
 *
 * @param message - The message object to check
 * @returns True if the message contains thinking content
 */
export function hasThinkingContent(message: any): boolean {
  return extractThinkingContent(message).trim().length > 0
}
