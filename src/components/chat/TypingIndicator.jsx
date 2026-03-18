export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 chat-message-enter">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-sm">✈️</span>
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-5">
          <div className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
        </div>
      </div>
    </div>
  );
}