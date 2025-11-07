export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-white/40 text-sm py-2">
      <div className="typing-indicator">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
      <span>AI is thinking...</span>
    </div>
  )
}
