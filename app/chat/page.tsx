export default function ChatHomePage() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 mx-auto flex items-center justify-center glass">
          <svg className="w-10 h-10 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">
            Select a conversation
          </h2>
          <p className="text-[var(--text-secondary)] text-lg">
            Choose from your conversations or start a new chat
          </p>
        </div>

        <div className="divider my-6" />

        <div className="glass p-6 space-y-3 text-left">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
            <p className="text-[var(--text-secondary)] text-sm">
              Your conversations are saved automatically
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
            <p className="text-[var(--text-secondary)] text-sm">
              AI responses stream in real-time
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
            <p className="text-[var(--text-secondary)] text-sm">
              Conversations are private and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
