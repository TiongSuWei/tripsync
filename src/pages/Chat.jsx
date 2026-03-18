import { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Menu, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConversationSidebar from '@/components/chat/ConversationSidebar';
import MessageBubble from '@/components/chat/MessageBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ChatInput from '@/components/chat/ChatInput';
import SuggestionChips from '@/components/chat/SuggestionChips';
import ExportButton from '@/components/chat/ExportButton';

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

Output format when generating a full plan:
## ✈️ Trip Summary
## 🏨 Accommodation Recommendations
## 🍽️ Food & Restaurants
## 🎭 Attractions & Entertainment
## 💰 Budget Breakdown
## 📅 Day-by-Day Itinerary

Keep responses well-structured and easy to read. Use emojis sparingly for section headers.`;

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const isFirstLoad = useRef(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const list = await base44.entities.TripConversation.list('-created_date', 50);
    setConversations(list);
    if (isFirstLoad.current && list.length > 0) {
      isFirstLoad.current = false;
      selectConversation(list[0]);
    }
  };

  const selectConversation = (conv) => {
    setActiveConv(conv);
    setMessages(conv.messages || []);
    setSidebarOpen(false);
  };

  const createNewConversation = async () => {
    const welcome = {
      role: 'assistant',
      content: `Hello! I'm TripSync, your personal AI travel planner. 🌍\n\nTell me about your dream trip — where would you like to go, when, how long, and what's your budget? I'll craft a complete itinerary for you!`,
      timestamp: new Date().toISOString(),
    };
    const conv = await base44.entities.TripConversation.create({
      title: 'New Trip',
      messages: [welcome],
      status: 'active',
    });
    setConversations(prev => [conv, ...prev]);
    setActiveConv(conv);
    setMessages([welcome]);
    setSidebarOpen(false);
  };

  const deleteConversation = async (id) => {
    await base44.entities.TripConversation.delete(id);
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConv?.id === id) {
      setActiveConv(null);
      setMessages([]);
    }
  };

  const sendMessage = useCallback(async (text) => {
    if (!activeConv) return;

    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    // Save user message
    await base44.entities.TripConversation.update(activeConv.id, {
      messages: updatedMessages,
    });

    // Build prompt history for LLM
    const history = updatedMessages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n');

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}\n\nConversation history:\n${history}\n\nAssistant:`,
    });

    const assistantMsg = {
      role: 'assistant',
      content: typeof response === 'string' ? response : JSON.stringify(response),
      timestamp: new Date().toISOString(),
    };

    const finalMessages = [...updatedMessages, assistantMsg];
    setMessages(finalMessages);
    setIsTyping(false);

    // Auto-generate title from first real exchange
    let newTitle = activeConv.title;
    let destination = activeConv.destination;
    if (activeConv.title === 'New Trip' && updatedMessages.filter(m => m.role === 'user').length === 1) {
      newTitle = text.length > 40 ? text.slice(0, 40) + '…' : text;
      // Try to extract destination
      const destMatch = text.match(/(?:to|in|visit|going to|trip to)\s+([A-Z][a-zA-Z\s]+?)(?:\s+for|\s+in|\s+from|,|$)/i);
      if (destMatch) destination = destMatch[1].trim();
    }

    await base44.entities.TripConversation.update(activeConv.id, {
      messages: finalMessages,
      title: newTitle,
      destination,
      status: 'active',
    });

    setActiveConv(prev => ({ ...prev, title: newTitle, destination }));
    setConversations(prev =>
      prev.map(c => c.id === activeConv.id ? { ...c, title: newTitle, destination, messages: finalMessages } : c)
    );
  }, [activeConv, messages]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - desktop */}
      <div className="hidden md:flex w-64 flex-shrink-0 border-r border-border">
        <ConversationSidebar
          conversations={conversations}
          activeId={activeConv?.id}
          onSelect={selectConversation}
          onNew={createNewConversation}
          onDelete={deleteConversation}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72">
            <ConversationSidebar
              conversations={conversations}
              activeId={activeConv?.id}
              onSelect={selectConversation}
              onNew={createNewConversation}
              onDelete={deleteConversation}
            />
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-xl"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="font-playfair font-semibold text-sm leading-tight">
                  {activeConv?.title || 'TripSync'}
                </h1>
                {activeConv?.destination && (
                  <p className="text-xs text-muted-foreground leading-tight">{activeConv.destination}</p>
                )}
              </div>
            </div>
          </div>
          <ExportButton messages={messages} title={activeConv?.title} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full gap-8 text-center px-4">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✈️</span>
                </div>
                <h2 className="font-playfair text-2xl font-semibold text-foreground mb-2">
                  Plan Your Next Adventure
                </h2>
                <p className="text-muted-foreground text-sm max-w-md">
                  Tell me your destination, travel dates, and budget — I'll build a complete personalized itinerary for you.
                </p>
              </div>
              <SuggestionChips onSelect={async (text) => {
                if (!activeConv) {
                  // Create conversation first
                  const welcome = {
                    role: 'assistant',
                    content: `Hello! I'm TripSync, your personal AI travel planner. 🌍\n\nTell me about your dream trip — where would you like to go, when, how long, and what's your budget? I'll craft a complete itinerary for you!`,
                    timestamp: new Date().toISOString(),
                  };
                  const conv = await base44.entities.TripConversation.create({
                    title: 'New Trip',
                    messages: [welcome],
                    status: 'active',
                  });
                  setConversations(prev => [conv, ...prev]);
                  setActiveConv(conv);
                  setMessages([welcome]);
                  // Use sendMessage after state settles
                  setTimeout(() => sendMessage(text), 100);
                } else {
                  sendMessage(text);
                }
              }} />
              <Button onClick={createNewConversation} className="rounded-xl px-6">
                Start Planning
              </Button>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {activeConv && (
          <div className="px-4 pb-4 pt-2 border-t border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
            <ChatInput onSend={sendMessage} disabled={isTyping} />
            <p className="text-center text-xs text-muted-foreground mt-2">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        )}

        {!activeConv && !isEmpty && (
          <div className="px-4 pb-4 pt-2 border-t border-border flex-shrink-0">
            <Button onClick={createNewConversation} className="w-full rounded-xl">
              Start a New Trip Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}