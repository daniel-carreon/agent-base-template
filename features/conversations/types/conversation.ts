export interface Conversation {
  id: string
  user_id: string
  title: string
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  user_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model_used?: string
  tokens_input?: number
  tokens_output?: number
  timestamp: string
}

export interface CreateConversationInput {
  title?: string
}

export interface CreateMessageInput {
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  model_used?: string
  tokens_input?: number
  tokens_output?: number
}

export interface UpdateConversationInput {
  title?: string
}
