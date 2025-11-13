'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Star, Trash2, X, Edit2, Check, MoreVertical } from 'lucide-react'
import { Spinner } from '@/shared/components/Spinner'
import { ThemeToggle } from '@/features/theme/components/ThemeToggle'
import { UserMenu } from '@/features/auth/components/UserMenu'
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
  userEmail: string
}

export function ConversationList({ activeConversationId, userEmail }: ConversationListProps) {
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [showConversations, setShowConversations] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const CONVERSATION_LIMIT = 12

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
      <div className="p-6 border-b border-white/10 space-y-3">
        {/* New Conversation Button */}
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

        {/* Toggle Conversations Button */}
        <button
          onClick={() => setShowConversations(!showConversations)}
          className="w-full flex items-center justify-between p-3 text-left text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)] rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
            <span className="font-medium">
              {showConversations ? 'Hide conversations' : 'View conversations'}
            </span>
          </div>

          {/* Arrow Indicator */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-4 h-4 transition-transform ${showConversations ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* Batch Actions Bar - Responsive Layout */}
      {selectedIds.size > 0 && (
        <div className="px-4 py-3 border-b border-white/10 glass-strong space-y-2">
          {/* Row 1: Count + Quick Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-[var(--text-secondary)] text-sm font-medium whitespace-nowrap">
                {selectedIds.size} sel.
              </span>
              <button
                onClick={handleSelectAll}
                className="text-xs text-[var(--accent-primary)] hover:underline"
              >
                Todas
              </button>
              <span className="text-[var(--text-disabled)]">•</span>
              <button
                onClick={handleDeselectAll}
                className="text-xs text-[var(--text-muted)] hover:underline"
              >
                Ninguna
              </button>
            </div>

            {/* Cancel Button - Always visible */}
            <button
              onClick={handleDeselectAll}
              className="btn-icon flex-shrink-0"
              title="Cancelar selección"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Row 2: Delete Button - Full width */}
          <button
            onClick={handleBatchDelete}
            disabled={isBatchDeleting}
            className="w-full glass-hover px-3 py-2 rounded-lg flex items-center justify-center gap-2 border border-red-500/30 hover:border-red-500/50 transition-colors"
            title="Eliminar conversaciones seleccionadas"
          >
            {isBatchDeleting ? (
              <>
                <Spinner size="sm" />
                <span className="text-sm text-red-400">Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Eliminar ({selectedIds.size})</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Conversations List - Spacer always present to push controls to bottom */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {showConversations && (
          loading ? (
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
            <>
              {sortedConversations.slice(0, CONVERSATION_LIMIT).map((conversation) => {
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

                {/* Kebab Menu - only show if not editing */}
                {editingId !== conversation.id && (
                  <div className="absolute right-3 top-3">
                    {/* Favorite indicator - always visible if favorited */}
                    {conversation.is_favorite && (
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 absolute -left-6 top-1" />
                    )}

                    {/* Kebab Menu Button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuId(openMenuId === conversation.id ? null : conversation.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity glass-hover p-1.5 w-7 h-7"
                        title="More options"
                      >
                        <MoreVertical className="w-4 h-4 text-[var(--text-muted)]" />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === conversation.id && (
                        <>
                          {/* Backdrop to close menu */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMenuId(null)
                            }}
                          />

                          {/* Menu Items */}
                          <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-lg shadow-xl z-20 overflow-hidden">
                            {/* Favorite */}
                            <button
                              onClick={(e) => {
                                handleToggleFavorite(conversation, e)
                                setOpenMenuId(null)
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-white/5 transition-colors flex items-center gap-3 text-sm"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  conversation.is_favorite
                                    ? 'fill-yellow-500 text-yellow-500'
                                    : 'text-[var(--text-muted)]'
                                }`}
                              />
                              <span className="text-[var(--text-primary)]">
                                {conversation.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                              </span>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={(e) => {
                                handleStartEdit(conversation, e)
                                setOpenMenuId(null)
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-white/5 transition-colors flex items-center gap-3 text-sm"
                            >
                              <Edit2 className="w-4 h-4 text-[var(--text-muted)]" />
                              <span className="text-[var(--text-primary)]">Edit title</span>
                            </button>

                            {/* Delete */}
                            <button
                              onClick={(e) => {
                                handleDeleteConversation(conversation.id, e)
                                setOpenMenuId(null)
                              }}
                              disabled={deletingId === conversation.id}
                              className="w-full px-4 py-2.5 text-left hover:bg-red-500/10 transition-colors flex items-center gap-3 text-sm border-t border-white/5"
                            >
                              {deletingId === conversation.id ? (
                                <>
                                  <Spinner size="sm" />
                                  <span className="text-red-400">Deleting...</span>
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                  <span className="text-red-400">Delete conversation</span>
                                </>
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
              })}

              {/* Show "View all" button if there are more conversations */}
              {sortedConversations.length > CONVERSATION_LIMIT && (
                <button
                  onClick={() => router.push('/chat/history')}
                  className="w-full text-center p-3 text-sm text-[var(--accent-primary)] hover:bg-white/5 rounded-lg transition-colors border border-white/10"
                >
                  View all conversations ({conversations.length})
                </button>
              )}
            </>
          )
        )}
      </div>

      {/* Bottom Controls: User Menu (left) & Theme Toggle (right)
          🎯 SPACING: flex items-center justify-between + gap-3
          Previene que botones se corten en viewports medianos
          Ref: arbrain/LeftSidebarMenu.tsx:420-423 */}
      <div className="border-t border-white/10 px-5 py-4 flex items-center justify-between flex-shrink-0 gap-3">
        {/* User Menu - Bottom Left */}
        <UserMenu userEmail={userEmail} />

        {/* Theme Toggle - Bottom Right */}
        <ThemeToggle />
      </div>
    </div>
  )
}
