import { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/layout/AppShell';
import useCurrentUser from '@/hooks/useCurrentUser';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MessageBubble from '@/components/chat/MessageBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ChatInput from '@/components/chat/ChatInput';
import SuggestionChips from '@/components/chat/SuggestionChips';
import ExportButton from '@/components/chat/ExportButton';
import { cn } from '@/lib/utils';

const SYSTEM_PROMPT = `You are TripSync, an intelligent AI travel assistant and professional tour guide. Help users plan complete trips efficiently.

When a user provides travel details, generate a complete, structured travel plan.

Rules:
1. Understand destination, travel dates, budget, and preferences.
2. If key information is missing (destination, dates, budget), ask friendly follow-up questions before generating the plan.
3. Provide recommendations for: Flights (estimated options), Accommodation (hotel/Airbnb), Food & restaurants, Attractions & entertainment.
4. Generate a day-by-day itinerary.
5. Provide a clear budget breakdown (flight, hotel, food, activities, transport).
6. Keep recommendations realistic and aligned with user's budget.
7. Be concise, structured, and friendly like a helpful tour guide.
8. Use markdown formatting with headers (##), bullet points, and bold text for clarity.
9. CRITICAL: Always recommend REAL, well-known hotels that actually exist. Include a direct booking/info hyperlink for each using markdown: [Hotel Name](https://www.booking.com/...).
10. CRITICAL: For every attraction, restaurant, and activity, include a real hyperlink. Format as [Place Name](https://...).
11. Every day in the itinerary must have clickable links for every place mentioned.

Output format when generating a full plan:
## ✈️ Trip Summary
## 🏨 Accommodation Recommendations
## 🍽️ Food & Restaurants
## 🎭 Attractions & Entertainment
## 💰 Budget Breakdown
## 📅 Day-by-Day Itinerary

Keep responses well-structured and easy to read.`;

export default function Chat() {
  const { user } = useCurrentUser();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const isFirstLoad = useRef(true);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  useEffect(() => { loadConversations(); }, []);

  const loadConversations = async () => {
    const list = await base44.entities.TripConversation.list('-created_date', 50);
    setConversations(list);
    if (isFirstLoad.current && list.length > 0) {
      isFirstLoad.current = false;
      selectConversation(list[0]);
    }
  };

  const selectConversation = (conv) => { setActiveConv(conv); setMessages(conv.messages || []); setSidebarOpen(false); };

  const createNewConversation = async () => {
    const welcome = { role: 'assistant', content: `Hello! I'm TripSync AI, your personal travel planner. 🌍\n\nTell me your destination, dates, and budget — I'll craft a complete itinerary with real hotel and restaurant recommendations!`, timestamp: new Date().toISOString() };
    const conv = await base44.entities.TripConversation.create({ title: 'New Trip', messages: [welcome], status: 'active' });
    setConversations(prev => [conv, ...prev]);
    setActiveConv(conv);
    setMessages([welcome]);
    setSidebarOpen(false);
  };

  const deleteConversation = async (id) => {
    await base44.entities.TripConversation.delete(id);
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConv?.id === id) { setActiveConv(null); setMessages([]); }
  };

  const sendMessage = useCallback(async (text) => {
    if (!activeConv) return;
    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);
    await base44.entities.TripConversation.update(activeConv.id, { messages: updatedMessages });
    const history = updatedMessages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n');
    const response = await base44.integrations.Core.InvokeLLM({ prompt: `${SYSTEM_PROMPT}\n\nConversation history:\n${history}\n\nAssistant:` });
    const assistantMsg = { role: 'assistant', content: typeof response === 'string' ? response : JSON.stringify(response), timestamp: new Date().toISOString() };
    const finalMessages = [...updatedMessages, assistantMsg];
    setMessages(finalMessages);
    setIsTyping(false);
    let newTitle = activeConv.title;
    let destination = activeConv.destination;
    if (activeConv.title === 'New Trip' && updatedMessages.filter(m => m.role === 'user').length === 1) {
      newTitle = text.length > 40 ? text.slice(0, 40) + '…' : text;
      const destMatch = text.match(/(?:to|in|visit|going to|trip to)\s+([A-Z][a-zA-Z\s]+?)(?:\s+for|\s+in|\s+from|,|$)/i);
      if (destMatch) destination = destMatch[1].trim();
    }
    await base44.entities.TripConversation.update(activeConv.id, { messages: finalMessages, title: newTitle, destination, status: 'active' });
    setActiveConv(prev => ({ ...prev, title: newTitle, destination }));
    setConversations(prev => prev.map(c => c.id === activeConv.id ? { ...c, title: newTitle, destination, messages: finalMessages } : c));
  }, [activeConv, messages]);

  const isEmpty = messages.length === 0;

  const chatContent = (
    <div className="flex h-full overflow-hidden">
      {/* Chat history panel */}
      <div className={cn(
        "flex-shrink-0 border-r border-border bg-sidebar flex-col transition-all duration-200",
        "hidden md:flex md:w-56"
      )}>
        <div className="p-3 border-b border-sidebar-border">
          <Button onClick={createNewConversation} className="w-full rounded-xl text-xs gap-2" size="sm">
            <Plus className="w-3.5 h-3.5" />New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {conversations.length === 0 ? (
            <p className="text-xs text-sidebar-foreground/40 text-center py-4">No chats yet</p>
          ) : conversations.map(conv => (
            <div key={conv.id} onClick={() => selectConversation(conv)}
              className={cn('group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all text-xs', activeConv?.id === conv.id ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground')}>
              <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
              <span className="flex-1 truncate">{conv.title || 'New Trip'}</span>
              <button onClick={e => { e.stopPropagation(); deleteConversation(conv.id); }} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-destructive">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <p className="font-medium text-sm truncate">{activeConv?.title || 'AI Assistant'}</p>
          <ExportButton messages={messages} title={activeConv?.title} />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full gap-8 text-center px-4">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4 text-2xl">✈️</div>
                <h2 className="font-playfair text-2xl font-semibold mb-2">Plan Your Next Adventure</h2>
                <p className="text-muted-foreground text-sm max-w-md">Tell me your destination, dates, and budget — I'll build a complete itinerary with real links.</p>
              </div>
              <SuggestionChips onSelect={async (text) => {
                if (!activeConv) {
                  const welcome = { role: 'assistant', content: `Hello! I'm TripSync AI. 🌍 Tell me your destination, dates, and budget!`, timestamp: new Date().toISOString() };
                  const conv = await base44.entities.TripConversation.create({ title: 'New Trip', messages: [welcome], status: 'active' });
                  setConversations(prev => [conv, ...prev]);
                  setActiveConv(conv);
                  setMessages([welcome]);
                  setTimeout(() => sendMessage(text), 100);
                } else { sendMessage(text); }
              }} />
              <Button onClick={createNewConversation} className="rounded-xl px-6">Start Planning</Button>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
              {isTyping && <TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {activeConv && (
          <div className="px-4 pb-4 pt-2 border-t border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
            <ChatInput onSend={sendMessage} disabled={isTyping} />
            <p className="text-center text-xs text-muted-foreground mt-2">Enter to send · Shift+Enter for new line</p>
          </div>
        )}
        {!activeConv && !isEmpty && (
          <div className="px-4 pb-4 pt-2 border-t border-border flex-shrink-0">
            <Button onClick={createNewConversation} className="w-full rounded-xl">Start a New Chat</Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AppShell user={user}>
      <div className="h-full">{chatContent}</div>
    </AppShell>
  );
}