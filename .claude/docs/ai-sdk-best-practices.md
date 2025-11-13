# AI SDK 5.0 Best Practices

## Stream Protocol Selection (Next.js App Router)

### ✅ Recommended: UI Message Stream

**Use `toUIMessageStreamResponse()` for Next.js App Router**

```typescript
// ✅ CORRECT - UI Message Stream (Next.js App Router)
const result = streamText({ model, messages })
return result.toUIMessageStreamResponse()
```

```typescript
// ❌ INCORRECT - This method doesn't exist in AI SDK 5.0.89+
const result = streamText({ model, messages })
return result.toDataStreamResponse() // TypeError: not a function
```

```typescript
// ⚠️ AVOID - Text Stream (requires extra config)
const result = streamText({ model, messages })
return result.toTextStreamResponse()
// Frontend needs: streamProtocol: 'text'
```

### Why UI Message Stream?

1. **Correct method** - `toUIMessageStreamResponse()` is the official method for Next.js App Router
2. **Default protocol** - `useChat` expects it by default (no config needed)
3. **Feature-rich** - Supports thinking blocks, tool calling, metadata, message parts
4. **Better error handling** - Structured error streaming
5. **Future-proof** - All new Next.js features use this method

### Available Methods (AI SDK 5.0.89+)

1. **`toUIMessageStreamResponse()`** - ⭐ For Next.js App Router
2. **`toTextStreamResponse()`** - For simple text-only streaming
3. **`textStream`** - For custom manual processing

## Error Handling Patterns

### Backend Error Handling

```typescript
try {
  // 1. Save message
  const { error: insertError } = await supabase.from('messages').insert(...)
  
  if (insertError) {
    console.error('[Chat API] Failed to save:', insertError)
    return // Early return - don't block UX
  }
  
  // 2. Continue with non-critical operations
} catch (error) {
  console.error('[Chat API] Error:', error)
  // Don't throw - persistence failures shouldn't break chat
}
```

### Logging Convention

Use prefixed logs for easy filtering:
- `[Chat API]` - Chat endpoint logs
- `[Auth]` - Authentication logs
- `[DB]` - Database logs

### Development vs Production

```typescript
return Response.json({
  error: 'User-friendly message',
  details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
}, { status: 500 })
```

## Message Format Handling

### Support Both UIMessage and ModelMessage

```typescript
// Handle both formats when extracting content
const content = 
  message?.content ||                                    // ModelMessage
  message?.parts?.find(p => p.type === 'text')?.text ||  // UIMessage
  ''
```

### Convert Before Sending to AI

```typescript
import { convertToModelMessages } from 'ai'

const result = streamText({
  messages: convertToModelMessages(messages) // Always convert
})
```

## Thinking Blocks Support

### Enable for Claude Models

```typescript
const thinkingConfig = modelInfo.supportsThinking
  ? {
      thinking: {
        type: 'enabled' as const,
        budget_tokens: 10000
      }
    }
  : {}

const result = streamText({
  ...thinkingConfig
})
```

### Frontend Rendering

Thinking blocks are automatically handled by `useChat` when using data stream protocol.

## onFinish Callback Best Practices

### 1. Don't Block Stream

```typescript
onFinish: async ({ text, usage }) => {
  // ✅ This runs AFTER stream completes
  // Won't block user experience
  await saveToDatabase(text)
}
```

### 2. Handle Failures Gracefully

```typescript
onFinish: async ({ text }) => {
  if (!conversationId) return // Early return
  
  try {
    await saveMessage(text)
  } catch (error) {
    console.error('Failed to save:', error)
    // Don't throw - let user continue chatting
  }
}
```

### 3. Separate Critical from Non-Critical

```typescript
onFinish: async ({ text }) => {
  // Critical: Save message
  const { error } = await save(text)
  if (error) {
    console.error('Failed to save:', error)
    return // Stop here
  }
  
  // Non-critical: Generate title
  try {
    await generateTitle()
  } catch (e) {
    // Ignore - title is nice-to-have
  }
}
```

## Security Best Practices

### 1. Always Authenticate

```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser()

if (authError || !user) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 2. Verify Ownership

```typescript
if (conversationId) {
  const { data: conversation } = await supabase
    .from('conversations')
    .select('user_id')
    .eq('id', conversationId)
    .single()
    
  if (!conversation || conversation.user_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
}
```

### 3. Validate Model IDs

```typescript
const modelId = validateModelId(rawModelId)
const modelInfo = getModelById(modelId)

if (!modelInfo) {
  return Response.json({ error: 'Invalid model ID' }, { status: 400 })
}
```

## Performance Optimizations

### 1. Use Optional Chaining

```typescript
tokens_input: usage?.inputTokens || 0
tokens_output: usage?.outputTokens || 0
```

### 2. Early Returns

```typescript
if (!conversationId) return
if (error) return
```

### 3. Parallel Non-Dependent Operations

```typescript
// If operations don't depend on each other:
const [result1, result2] = await Promise.all([
  operation1(),
  operation2()
])
```

## Documentation Standards

### JSDoc Comments

```typescript
/**
 * 🤖 CHAT API ROUTE
 *
 * Brief description
 *
 * Features:
 * - Feature 1
 * - Feature 2
 *
 * @see https://link-to-docs
 */
```

### Inline Comments

```typescript
// 🎯 SECTION NAME: Brief explanation
// Multi-line details about why/how
const code = here()
```

### Emoji Convention

- 🤖 AI/Model related
- 🎯 Core functionality
- 💾 Persistence/Database
- 🔐 Authentication
- 🔒 Authorization
- ✅ Validation
- ❌ Error handling
- 🚀 Response/Output
- 🧠 Thinking/Logic
- 📥 Input/Parsing

## Common Pitfalls

### ❌ DON'T: Use non-existent methods

```typescript
// Backend - AI SDK 5.0.89+
return result.toDataStreamResponse() // TypeError: not a function
```

### ❌ DON'T: Use Text Stream without config

```typescript
// Backend
return result.toTextStreamResponse()

// Frontend
useChat({ api: '/api/chat' }) // Will fail - protocol mismatch
```

### ✅ DO: Use UI Message Stream for Next.js

```typescript
// Backend - AI SDK 5.0.89+ with Next.js App Router
return result.toUIMessageStreamResponse()

// Frontend
useChat({ api: '/api/chat' }) // Works perfectly - default protocol
```

### ❌ DON'T: Throw in onFinish

```typescript
onFinish: async () => {
  throw new Error('This breaks the stream!')
}
```

### ✅ DO: Handle errors gracefully

```typescript
onFinish: async () => {
  try {
    await operation()
  } catch (error) {
    console.error('Non-critical error:', error)
  }
}
```

## OpenRouter Integration

### Using OpenRouter as Unified Provider

OpenRouter provides access to 400+ AI models through a single API key, simplifying API management.

```typescript
// shared/lib/openrouter.ts
import { createOpenAI } from '@ai-sdk/openai'

export const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
})
```

### Model IDs Format

Use provider/model format for OpenRouter:

```typescript
// ✅ CORRECT - OpenRouter format
const model = openrouter('anthropic/claude-haiku-4-5')
const model = openrouter('openai/gpt-4o')
const model = openrouter('google/gemini-2.5-pro')

// ❌ INCORRECT - Direct provider format
const model = anthropic('claude-haiku-4-5') // Won't work with OpenRouter
```

### Extended Thinking / Reasoning Support

OpenRouter supports extended thinking for Anthropic models and reasoning tokens for OpenAI models.

**Enable thinking in streamText:**

```typescript
const thinkingConfig = modelInfo.supportsThinking
  ? {
      thinking: {
        type: 'enabled' as const,
        budget_tokens: 10000
      }
    }
  : {}

const result = streamText({
  model,
  ...thinkingConfig,
  // ...
})
```

**Extract reasoning from messages:**

```typescript
// AI SDK 4.2+ format (standard)
const reasoningPart = message.parts?.find(p => p.type === 'reasoning')
const thinking = reasoningPart?.text

// OpenRouter raw format (reasoning_details)
const thinking = message.reasoning_details
  ?.filter(r => r.type === 'reasoning.text')
  .map(r => r.text)
  .join('\n\n')
```

### Benefits of OpenRouter

- ✅ **Single API key** for all models
- ✅ **Simplified billing** and usage tracking
- ✅ **Access to 400+ models** including new releases
- ✅ **Automatic failover** between providers
- ✅ **Competitive pricing** with volume discounts

## Testing Checklist

- [ ] Test with different models (Claude, GPT, Gemini)
- [ ] Test thinking blocks (Claude models via OpenRouter)
- [ ] Test reasoning extraction with multiple formats
- [ ] Test error scenarios (auth failures, DB failures)
- [ ] Test first conversation (title generation)
- [ ] Test conversation ownership validation
- [ ] Test network failures and retries
- [ ] Test mobile viewport
- [ ] Check browser console for errors
- [ ] Verify Mermaid diagram rendering

## References

- [AI SDK 5.0 Docs](https://ai-sdk.dev/docs)
- [Stream Protocols](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol)
- [streamText Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text)
- [useChat Reference](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat)
- [OpenRouter Docs](https://openrouter.ai/docs)
- [OpenRouter Reasoning Tokens](https://openrouter.ai/docs/use-cases/reasoning-tokens)
- [Mermaid Docs](https://mermaid.js.org/)

---

*Last Updated: 2025-01-12*
