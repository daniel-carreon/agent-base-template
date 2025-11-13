/**
 * Parse content and extract Mermaid diagram blocks
 *
 * Detects ```mermaid code blocks and separates them from regular text.
 *
 * @param content - The message content to parse
 * @returns Array of content blocks with type and content
 */
export interface ContentBlock {
  type: 'text' | 'mermaid'
  content: string
}

export function parseMermaidBlocks(content: string): ContentBlock[] {
  if (!content || typeof content !== 'string') {
    return [{ type: 'text', content: '' }]
  }

  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g
  const blocks: ContentBlock[] = []

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = mermaidRegex.exec(content)) !== null) {
    // Add text before the mermaid block
    if (match.index > lastIndex) {
      const textContent = content.slice(lastIndex, match.index).trim()
      if (textContent) {
        blocks.push({ type: 'text', content: textContent })
      }
    }

    // Add mermaid block
    const mermaidContent = match[1].trim()
    if (mermaidContent) {
      blocks.push({ type: 'mermaid', content: mermaidContent })
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text after last mermaid block
  if (lastIndex < content.length) {
    const textContent = content.slice(lastIndex).trim()
    if (textContent) {
      blocks.push({ type: 'text', content: textContent })
    }
  }

  // If no blocks were created, return the original content as text
  return blocks.length > 0 ? blocks : [{ type: 'text', content }]
}

/**
 * Check if content contains any Mermaid diagrams
 *
 * @param content - The message content to check
 * @returns True if content contains mermaid blocks
 */
export function hasMermaidDiagram(content: string): boolean {
  if (!content || typeof content !== 'string') return false
  return /```mermaid\n[\s\S]*?```/.test(content)
}
