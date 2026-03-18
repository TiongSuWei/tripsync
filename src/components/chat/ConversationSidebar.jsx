import { Plus, MessageSquare, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}) {
  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-sidebar-primary" />
          </div>
          <span className="font-playfair font-semibold text-sidebar-foreground text-lg">TripSync</span>
        </div>
        <Button
          onClick={onNew}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium gap-2"
        >
          <Plus className="w-4 h-4" />
          New Trip Plan
        </Button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-sidebar-foreground/40 text-sm">
            No conversations yet
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={cn(
                "group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200",
                activeId === conv.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/60 text-sidebar-foreground/70 hover:text-sidebar-foreground"
              )}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-60" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {conv.title || 'New Trip'}
                </p>
                {conv.destination && (
                  <p className="text-xs opacity-50 truncate">{conv.destination}</p>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-destructive/20 hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/30 text-center">
          AI-powered travel planning
        </p>
      </div>
    </div>
  );
}