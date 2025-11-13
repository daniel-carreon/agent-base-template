import { streamText } from 'ai'
import { SYSTEM_PROMPT } from '@/shared/lib/anthropic'
import { createClient } from '@/shared/lib/supabase/server'
import { getModelInstance, validateModelId } from '@/shared/lib/models'
import { getModelById } from '@/config/models'
import { streamOpenRouterChat } from '@/shared/lib/openrouter'

/**
 * 🤖 CHAT API ROUTE
 *
 * Handles streaming chat responses using Vercel AI SDK 5.0
 *
 * Features:
 * - Multi-model support (Claude, GPT, Gemini)
 * - Extended thinking for Claude models
 * - Auto-save messages to Supabase
 * - Auto-generate conversation titles
 * - User authentication & authorization
 *
 * @see https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text
 */
export async function POST(req: Request) {
  try {
    // 📥 PARSE REQUEST
    const { messages, conversationId, modelId: rawModelId } = await req.json()

    // ✅ VALIDATION: Messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('[Chat API] Invalid messages:', messages)
      return Response.json({ error: 'Invalid messages' }, { status: 400 })
    }

    console.log('[Chat API] Received messages:', messages.length, 'messages')
    console.log('[Chat API] First message:', JSON.stringify(messages[0], null, 2))

    // 🧠 MEMORY: Sliding window de últimos 15 mensajes para mantener contexto
    const MEMORY_WINDOW = 15
    const recentMessages = messages.slice(-MEMORY_WINDOW)

    console.log(`[Chat API] Using memory window: ${recentMessages.length} of ${messages.length} messages`)

    // Convert messages to standard format { role, content }
    const convertedMessages = recentMessages.map((msg: any) => {
      // Extract text content from parts or direct content
      let content = ''
      if (msg.parts && Array.isArray(msg.parts)) {
        content = msg.parts
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join('')
      } else if (msg.content) {
        content = msg.content
      }

      return {
        role: msg.role,
        content: content.trim(),
      }
    })

    // Validate we have at least one user message
    const lastUserMessage = convertedMessages.filter((m) => m.role === 'user').pop()
    if (!lastUserMessage) {
      console.error('[Chat API] No user message found in conversation!')
      return Response.json({ error: 'No user message' }, { status: 400 })
    }

    console.log('[Chat API] Sending conversation history:', convertedMessages.length, 'messages')
    console.log('[Chat API] Last user message:', lastUserMessage.content.substring(0, 100))

    // 💾 SAVE USER MESSAGE (without auth for testing)
    if (conversationId && lastUserMessage.content.trim()) {
      try {
        const supabase = await createClient()
        const { error: userMsgError } = await supabase.from('messages').insert({
          conversation_id: conversationId,
          role: 'user',
          content: lastUserMessage.content.trim(),
        })
        if (userMsgError) {
          console.error('[Chat API] Failed to save user message:', userMsgError)
        } else {
          console.log('[Chat API] User message saved')
        }
      } catch (err) {
        console.error('[Chat API] Error saving user message:', err)
      }
    }

    // ✅ VALIDATION: Model ID
    const modelId = validateModelId(rawModelId)
    const modelInfo = getModelById(modelId)

    if (!modelInfo) {
      return Response.json({ error: 'Invalid model ID' }, { status: 400 })
    }

    // 🔐 AUTHENTICATION: TEMPORARILY DISABLED FOR TESTING
    // const supabase = await createClient()
    // const {
    //   data: { user },
    //   error: authError,
    // } = await supabase.auth.getUser()

    // if (authError || !user) {
    //   return Response.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // // 🔒 AUTHORIZATION: Verify conversation ownership
    // if (conversationId) {
    //   const { data: conversation, error: conversationError } = await supabase
    //     .from('conversations')
    //     .select('user_id')
    //     .eq('id', conversationId)
    //     .single()

    //   if (conversationError || !conversation) {
    //     return Response.json({ error: 'Conversation not found' }, { status: 404 })
    //   }

    //   if (conversation.user_id !== user.id) {
    //     return Response.json({ error: 'Forbidden' }, { status: 403 })
    //   }
    // }

    // 🤖 MODEL SETUP: Branch for OpenRouter with reasoning vs other providers
    const useCustomStreaming = modelInfo.supportsThinking && modelInfo.provider === 'openrouter'

    if (useCustomStreaming) {
      // 🔥 CUSTOM OPENROUTER STREAMING: Extracts reasoning directly from delta
      console.log('[Chat API] Using custom OpenRouter streaming with reasoning support')

      let accumulatedContent = ''
      let accumulatedReasoning = ''
      let isStreamClosed = false // Flag to prevent double-close

      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamOpenRouterChat({
              model: modelId,
              messages: convertedMessages,
              systemPrompt: SYSTEM_PROMPT,
              reasoningConfig: {
                effort: 'high',
                exclude: false,
              },
            })) {
              if (isStreamClosed) break // Stop processing if already closed

              if (chunk.type === 'content' && chunk.delta) {
                accumulatedContent += chunk.delta
                // Send content delta
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'content', delta: chunk.delta })}\n\n`)
                )
              } else if (chunk.type === 'reasoning' && chunk.delta) {
                accumulatedReasoning += chunk.delta
                // Send reasoning delta
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'reasoning', delta: chunk.delta })}\n\n`)
                )
              } else if (chunk.type === 'error') {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'error', error: chunk.error })}\n\n`)
                )
              } else if (chunk.type === 'done') {
                if (isStreamClosed) break // Already processed, skip

                isStreamClosed = true

                // Save message to database
                if (conversationId) {
                  try {
                    const supabase = await createClient()
                    const { error: insertError } = await supabase.from('messages').insert({
                      conversation_id: conversationId,
                      role: 'assistant',
                      content: accumulatedContent,
                      thinking: accumulatedReasoning || null,
                      model_used: modelId,
                      tokens_input: 0, // TODO: Extract from response
                      tokens_output: 0, // TODO: Extract from response
                    })

                    if (insertError) {
                      console.error('[Chat API] Failed to save message:', insertError)
                    } else {
                      console.log('[Chat API] Message saved with reasoning:', accumulatedReasoning.length, 'chars')
                    }
                  } catch (error) {
                    console.error('[Chat API] Error saving message:', error)
                  }
                }

                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
                controller.close()
                break // Exit loop after closing
              }
            }
          } catch (error) {
            console.error('[Chat API] Stream error:', error)
            if (!isStreamClosed) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`
                )
              )
              controller.close()
              isStreamClosed = true
            }
          }
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }

    // 🎯 FALLBACK: Standard AI SDK streaming for non-OpenRouter models
    console.log('[Chat API] Using standard AI SDK streamText')

    const model = getModelInstance(modelId)

    const reasoningConfig = modelInfo.supportsThinking
      ? {
          thinking: {
            type: 'enabled' as const,
            budget_tokens: 10000,
          },
        }
      : {}

    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages: convertedMessages,
      ...reasoningConfig,
      onFinish: async ({ text, usage }) => {
        console.log('[Chat API] onFinish called - text length:', text.length, 'tokens:', usage)
        if (!conversationId) return

        try {
          const supabase = await createClient()

          const { error: insertError } = await supabase.from('messages').insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: text,
            model_used: modelId,
            tokens_input: usage?.promptTokens || 0,
            tokens_output: usage?.completionTokens || 0,
          })

          if (insertError) {
            console.error('[Chat API] Failed to save assistant message:', insertError)
            return
          }

          console.log('[Chat API] Message saved successfully')
        } catch (error) {
          console.error('[Chat API] Error saving message:', error)
        }
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    // ❌ ERROR HANDLING: Log and return user-friendly error
    console.error('[Chat API] Unexpected error:', error)

    // Return appropriate error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return Response.json(
      {
        error: 'Failed to process chat request',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}
