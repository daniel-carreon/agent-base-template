import { streamText } from 'ai'
import { SYSTEM_PROMPT } from '@/shared/lib/anthropic'
import { createClient } from '@/shared/lib/supabase/server'
import { getModelInstance, validateModelId } from '@/shared/lib/models'
import { getModelById } from '@/config/models'

export async function POST(req: Request) {
  try {
    const { messages, conversationId, modelId: rawModelId } = await req.json()

    // Validate and sanitize model ID
    const modelId = validateModelId(rawModelId)
    const modelInfo = getModelById(modelId)

    // Auth check
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate conversation belongs to user
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

    // Get model instance based on modelId
    const model = getModelInstance(modelId)

    // Configure extended thinking for supported models
    const thinkingConfig =
      modelInfo?.supportsThinking
        ? {
            thinking: {
              type: 'enabled' as const,
              budget_tokens: 10000, // 10k tokens for thinking
            },
          }
        : {}

    // Stream response
    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages,
      ...thinkingConfig, // Add thinking config if supported
      onFinish: async ({ text, usage }) => {
        // Auto-save assistant message
        if (conversationId) {
          try {
            await supabase.from('messages').insert({
              conversation_id: conversationId,
              user_id: user.id,
              role: 'assistant',
              content: text,
              model_used: modelId,
              tokens_input: usage.inputTokens,
              tokens_output: usage.outputTokens,
            })

            // Check if this is the first message pair (user + assistant)
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conversationId)

            // If first exchange, generate title
            if (count === 2) {
              const titleResult = await streamText({
                model, // Use same model for title generation
                system:
                  'Generate a short title (max 5 words) for this conversation based on the first user message. Respond ONLY with the title, no quotes or punctuation.',
                messages: [
                  {
                    role: 'user',
                    content: messages.find((m: { role: string }) => m.role === 'user')?.content || '',
                  },
                ],
              })

              const title = await titleResult.text

              await supabase
                .from('conversations')
                .update({ title: title.trim() })
                .eq('id', conversationId)
            }
          } catch (error) {
            console.error('Error saving assistant message:', error)
          }
        }
      },
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Chat endpoint error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
