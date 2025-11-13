'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from '@/config/models'
import type { ModelInfo } from '@/shared/types/models'

interface ModelSelectorProps {
  /** Callback when model is changed */
  onModelChange?: (modelId: string) => void
  /** Optional CSS classes */
  className?: string
}

export function ModelSelector({ onModelChange, className = '' }: ModelSelectorProps) {
  const [selectedModel, setSelectedModel] = useState<ModelInfo>(
    AVAILABLE_MODELS.find((m) => m.id === DEFAULT_MODEL_ID) || AVAILABLE_MODELS[0]
  )
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Load selected model from localStorage
  useEffect(() => {
    const savedModelId = localStorage.getItem('selectedModelId')
    if (savedModelId) {
      const model = AVAILABLE_MODELS.find((m) => m.id === savedModelId)
      if (model) {
        setSelectedModel(model)
      }
    }
  }, [])

  const handleSelectModel = (model: ModelInfo) => {
    setSelectedModel(model)
    setIsOpen(false)

    // Save to localStorage
    localStorage.setItem('selectedModelId', model.id)

    // Trigger callback
    onModelChange?.(model.id)
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-hover px-4 py-2.5 flex items-center gap-3 min-w-[200px]"
        aria-label="Select AI Model"
        aria-expanded={isOpen}
      >
        {/* Status Indicator Dot */}
        <div
          className={`w-2 h-2 rounded-full ${
            selectedModel.statusIndicator === 'enabled'
              ? 'bg-[var(--success)]'
              : 'bg-[var(--text-disabled)]'
          }`}
        />

        {/* Model Name */}
        <span className="font-medium text-[var(--text-primary)] flex-1 text-left text-sm truncate">
          {selectedModel.name}
        </span>

        {/* Premium Badge */}
        {selectedModel.isPremium && (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-gradient-to-r from-[var(--accent-primary)]/20 to-purple-600/20 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)]">
            PRO
          </span>
        )}

        {/* Chevron Icon */}
        <ChevronDown
          className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Mobile: Full Screen Modal */}
          {isMobile ? (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-end"
              onClick={() => setIsOpen(false)}
            >
              <div
                className="glass-strong w-full max-h-[70vh] overflow-y-auto rounded-t-3xl animate-slide-up"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-12 h-1 rounded-full bg-[var(--glass-border)]" />
                </div>

                {/* Header */}
                <div className="px-6 py-4 border-b border-[var(--glass-border)]">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">Seleccionar Modelo</h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Elige el modelo AI para tu conversación
                  </p>
                </div>

                {/* Model List */}
                <div className="p-4 space-y-2">
                  {AVAILABLE_MODELS.map((model) => (
                    <ModelOption
                      key={model.id}
                      model={model}
                      isSelected={model.id === selectedModel.id}
                      onSelect={() => handleSelectModel(model)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Desktop: Popover - Opens upward to prevent overflow */
            <div className="absolute bottom-full mb-2 left-0 w-[320px] glass-strong rounded-xl overflow-hidden z-[9999] shadow-2xl animate-fade-in">
              <div className="p-2 max-h-[400px] overflow-y-auto space-y-1">
                {AVAILABLE_MODELS.map((model) => (
                  <ModelOption
                    key={model.id}
                    model={model}
                    isSelected={model.id === selectedModel.id}
                    onSelect={() => handleSelectModel(model)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/**
 * Individual Model Option Component
 */
interface ModelOptionProps {
  model: ModelInfo
  isSelected: boolean
  onSelect: () => void
}

function ModelOption({ model, isSelected, onSelect }: ModelOptionProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
        isSelected
          ? 'bg-[var(--accent-primary-dim)] border border-[var(--accent-primary-border)]'
          : 'hover:bg-[var(--glass-bg-hover)] border border-transparent'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Model Name + Premium Badge */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`font-medium text-sm ${
                isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'
              }`}
            >
              {model.name}
            </span>
            {model.isPremium && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-gradient-to-r from-[var(--accent-primary)]/20 to-purple-600/20 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)]">
                PRO
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-[var(--text-muted)] mb-2 line-clamp-1">
            {model.description}
          </p>

          {/* Pricing + Context */}
          <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
            <span>
              ${model.costPerMillionInput}/${model.costPerMillionOutput} por 1M tokens
            </span>
            <span>•</span>
            <span>{(model.contextWindow / 1000).toFixed(0)}k context</span>
          </div>
        </div>

        {/* Check Icon for Selected */}
        {isSelected && (
          <div className="flex-shrink-0">
            <div className="w-5 h-5 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
          </div>
        )}
      </div>
    </button>
  )
}
