'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Star, Trash2, X, Edit2, Check } from 'lucide-react'
import { Spinner } from '@/shared/components/Spinner'
import {
  getConversations,
  createConversation,
  deleteConversation,
  toggleFavorite,
  batchDeleteConversations,
  updateConversation,
} from '../services/conversationService'
import type { Conversation } from '../types/conversation'

interface ConversationListProps {
  activeConversationId?: string
}

export function ConversationList({ activeConversationId }: ConversationListProps) {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBatchDeleting, setIsBatchDeleting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [isSavingTitle, setIsSavingTitle] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  // Auto-focus input when editing starts
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  const loadConversations = async () => {
    try {
      const data = await getConversations()
      setConversations(data)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewConversation = async () => {
    setCreating(true)
    try {
      const newConversation = await createConversation()
      router.push(`/chat/${newConversation.id}`)
      await loadConversations()
    } catch (error) {
      console.error('Error creating conversation:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this conversation?')) return

    setDeletingId(id)
    try {
      await deleteConversation(id)
      await loadConversations()

      // If deleting active conversation, redirect to chat home
      if (id === activeConversationId) {
        router.push('/chat')
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleFavorite = async (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      await toggleFavorite(conversation.id, !conversation.is_favorite)
      await loadConversations()
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const toggleSelection = (convId: string) => {
    const newSelectedIds = new Set(selectedIds)
    if (newSelectedIds.has(convId)) {
      newSelectedIds.delete(convId)
    } else {
      newSelectedIds.add(convId)
    }
    setSelectedIds(newSelectedIds)
  }

  const handleSelectAll = () => {
    setSelectedIds(new Set(conversations.map((c) => c.id)))
  }

  const handleDeselectAll = () => {
    setSelectedIds(new Set())
  }

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`¿Eliminar ${selectedIds.size} conversaciones? Esta acción no se puede deshacer.`)) return

    setIsBatchDeleting(true)
    try {
      await batchDeleteConversations(Array.from(selectedIds))
      await loadConversations()
      setSelectedIds(new Set())

      // If active conversation was deleted, redirect
      if (activeConversationId && selectedIds.has(activeConversationId)) {
        router.push('/chat')
      }
    } catch (error) {
      console.error('Error batch deleting conversations:', error)
    } finally {
      setIsBatchDeleting(false)
    }
  }

  const handleStartEdit = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(conversation.id)
    setEditTitle(conversation.title)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  const handleSaveTitle = async () => {
    if (!editingId || !editTitle.trim()) {
      handleCancelEdit()
      return
    }

    setIsSavingTitle(true)
    try {
      await updateConversation(editingId, { title: editTitle.trim() })
      await loadConversations()
      setEditingId(null)
      setEditTitle('')
    } catch (error) {
      console.error('Error updating title:', error)
    } finally {
      setIsSavingTitle(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  // Sort conversations: favorites first, then by date
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      // First, sort by favorite status
      if (a.is_favorite !== b.is_favorite) {
        return a.is_favorite ? -1 : 1
      }
      // Then, sort by updated_at (most recent first)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
  }, [conversations])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <button
          onClick={handleNewConversation}
          disabled={creating}
          className="btn-primary w-full"
        >
          {creating ? (
            <>
              <Spinner size="sm" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Chat</span>
            </>
          )}
        </button>
      </div>

      {/* Batch Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="p-4 border-b border-white/10 glass-strong">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[var(--text-secondary)] text-sm font-medium">
                {selectedIds.size} seleccionadas
              </span>
              <button
                onClick={handleSelectAll}
                className="text-xs text-[var(--accent-primary)] hover:underline"
              >
                Todas
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-xs text-[var(--text-muted)] hover:underline"
              >
                Ninguna
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDeselectAll}
                className="btn-icon"
                title="Cancelar"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={isBatchDeleting}
                className="glass-hover px-3 py-2 rounded-lg flex items-center gap-2 border border-red-500/30 hover:border-red-500/50 transition-colors"
                title="Eliminar seleccionadas"
              >
                {isBatchDeleting ? (
                  <Spinner size="sm" />
                ) : (
                  <Trash2 className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm text-red-400">Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-[var(--text-muted)] text-sm">No conversations yet</p>
            <p className="text-[var(--text-disabled)] text-xs mt-2">
              Click &quot;New Chat&quot; to start
            </p>
          </div>
        ) : (
          sortedConversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId
            const isSelected = selectedIds.has(conversation.id)

            return (
              <div
                key={conversation.id}
                className={`${
                  isActive ? 'conversation-card-active' : 'conversation-card'
                } group relative ${
                  isSelected ? 'ring-2 ring-[var(--accent-primary)] ring-opacity-50' : ''
                }`}
              >
                {/* Checkbox for batch selection */}
                <div className="absolute left-3 top-3 z-10">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation()
                      toggleSelection(conversation.id)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-2 border-white/20 bg-transparent checked:bg-[var(--accent-primary)] checked:border-[var(--accent-primary)] cursor-pointer transition-colors"
                  />
                </div>

                {/* Content - clickable for navigation or editable */}
                <div className="flex-1 min-w-0 pr-16 pl-8">
                  {editingId === conversation.id ? (
                    /* Edit Mode */
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        ref={inputRef}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 px-2 py-1 text-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                        disabled={isSavingTitle}
                      />
                      <button
                        onClick={handleSaveTitle}
                        disabled={isSavingTitle}
                        className="p-1 glass-hover rounded"
                        title="Save (Enter)"
                      >
                        {isSavingTitle ? (
                          <Spinner size="sm" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSavingTitle}
                        className="p-1 glass-hover rounded"
                        title="Cancel (Esc)"
                      >
                        <X className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      </button>
                    </div>
                  ) : (
                    /* View Mode */
                    <div
                      onClick={() => router.push(`/chat/${conversation.id}`)}
                      className="cursor-pointer"
                    >
                      <h3 className="text-[var(--text-primary)] font-medium truncate text-sm">
                        {conversation.title}
                      </h3>
                      <p className="text-[var(--text-muted)] text-xs mt-1">
                        {formatDistanceToNow(new Date(conversation.updated_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons - only show if not editing */}
                {editingId !== conversation.id && (
                  <div className="absolute right-3 top-3 flex items-center gap-1">
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => handleToggleFavorite(conversation, e)}
                      className={`glass-hover p-1.5 w-7 h-7 ${
                        conversation.is_favorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      } transition-opacity`}
                      title={conversation.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          conversation.is_favorite
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-[var(--text-muted)]'
                        }`}
                        strokeWidth={2}
                      />
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={(e) => handleStartEdit(conversation, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity glass-hover p-1.5 w-7 h-7"
                      title="Edit title"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteConversation(conversation.id, e)}
                      disabled={deletingId === conversation.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity glass-hover p-1.5 w-7 h-7"
                      title="Delete conversation"
                    >
                      {deletingId === conversation.id ? (
                        <Spinner size="sm" />
                      ) : (
                        <svg
                          className="w-4 h-4 text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
