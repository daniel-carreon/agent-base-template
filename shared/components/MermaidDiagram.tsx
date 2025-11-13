'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

interface MermaidDiagramProps {
  chart: string
  className?: string
}

// Initialize mermaid with theme configuration
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#6366f1',
    primaryTextColor: '#fff',
    primaryBorderColor: '#4f46e5',
    lineColor: '#818cf8',
    secondaryColor: '#8b5cf6',
    tertiaryColor: '#a78bfa',
    background: '#1e293b',
    mainBkg: '#1e293b',
    secondBkg: '#334155',
    tertiaryBkg: '#475569',
    textColor: '#e2e8f0',
    border1: '#475569',
    border2: '#64748b',
    fontFamily: 'ui-monospace, monospace',
  },
})

export function MermaidDiagram({ chart, className = '' }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current || !chart) return

      setIsLoading(true)
      setError(null)

      try {
        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substring(7)}`

        // Render the diagram
        const { svg } = await mermaid.render(id, chart)

        // Insert SVG into container
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
        setIsLoading(false)
      }
    }

    renderDiagram()
  }, [chart])

  if (error) {
    return (
      <div className={`my-4 p-4 glass rounded-lg border border-red-500/20 ${className}`}>
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-400">Mermaid Diagram Error</p>
            <p className="text-xs text-red-300/70 mt-1">{error}</p>
            <details className="mt-2">
              <summary className="text-xs text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-secondary)]">
                Show diagram code
              </summary>
              <pre className="mt-2 text-xs text-[var(--text-muted)] whitespace-pre-wrap font-mono">
                {chart}
              </pre>
            </details>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`my-4 p-4 glass rounded-lg overflow-x-auto ${className}`}>
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--text-secondary)]" />
        </div>
      )}
      <div
        ref={containerRef}
        className={`mermaid-diagram ${isLoading ? 'hidden' : ''}`}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    </div>
  )
}
