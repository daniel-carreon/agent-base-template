import { createClient } from '@/shared/lib/supabase/client'
import type {
  Conversation,
  Message,
  CreateConversationInput,
  CreateMessageInput,
  UpdateConversationInput,
} from '../types/conversation'

/**
 * Crear nueva conversación
 */
export async function createConversation(
  input: CreateConversationInput = {}
): Promise<Conversation> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: user.id,
      title: input.title || 'Nueva Conversación',
    })
    .select()
    .single()

  if (error) throw error

  return data
}

/**
 * Obtener todas las conversaciones del usuario
 */
export async function getConversations(): Promise<Conversation[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error

  return data || []
}

/**
 * Obtener conversación por ID
 */
export async function getConversation(id: string): Promise<Conversation | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  return data
}

/**
 * Actualizar título de conversación
 */
export async function updateConversation(
  id: string,
  input: UpdateConversationInput
): Promise<Conversation> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('conversations')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data
}

/**
 * Eliminar conversación
 */
export async function deleteConversation(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Toggle favorite status de conversación
 */
export async function toggleFavorite(id: string, isFavorite: boolean): Promise<Conversation> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('conversations')
    .update({ is_favorite: isFavorite })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data
}

/**
 * Obtener mensajes de una conversación
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: true })

  if (error) throw error

  return data || []
}

/**
 * Crear mensaje
 */
export async function createMessage(
  input: CreateMessageInput
): Promise<Message> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('messages')
    .insert({
      ...input,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error

  return data
}

/**
 * Contar mensajes de una conversación
 */
export async function getMessageCount(conversationId: string): Promise<number> {
  const supabase = createClient()

  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)

  if (error) throw error

  return count || 0
}
