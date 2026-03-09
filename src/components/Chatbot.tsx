import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, User } from 'lucide-react';

// Define the shape of our messages based on the FastAPI backend
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  studentProfile?: any;
}

export default function Chatbot({ isOpen, onClose, studentProfile }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi there! I am the Danny\'s Connect AI Assistant. How can I help you with study abroad programs, scholarships, or flights today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when a new message is added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- UPGRADED: Custom Markdown Formatter for AI Responses ---
  const formatMessage = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      // 1. Skip completely empty lines but preserve spacing
      if (!line.trim()) return <div key={lineIndex} className="h-2"></div>;

      // 2. Handle Headings (e.g., "### Entry Requirements")
      const headingMatch = line.match(/^(#+)\s(.*)/);
      if (headingMatch) {
        return (
          <div key={lineIndex} className="font-bold text-blue-900 mt-3 mb-1 text-base">
            {headingMatch[2].replace(/\*\*/g, '')} {/* Remove any stray bold stars inside titles */}
          </div>
        );
      }

      // 3. Handle Bullet points and numbered lists (e.g., "* ", "- ", "1. ")
      const isBullet = /^(\*|-|\d+\.)\s/.test(line.trim());
      // Strip the bullet symbol from the text so we can use a proper HTML <li>
      const cleanLine = isBullet ? line.replace(/^(\*|-|\d+\.)\s/, '') : line;

      // 4. Handle Bold Text (e.g., "**Bold Text**") AND Links (e.g., "[Text](url)")
      const parts = cleanLine.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
      
      const formattedParts = parts.map((part, partIndex) => {
        // Handle Bold Text
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIndex} className="font-bold text-blue-950">
              {part.slice(2, -2)}
            </strong>
          );
        }
        
        // Handle Links & Buttons
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          const linkText = linkMatch[1];
          const linkUrl = linkMatch[2];
          
          // If it's the WhatsApp link, style it as a big green button!
          if (linkUrl.includes('wa.me') || linkText.toLowerCase().includes('whatsapp')) {
            return (
              <a 
                key={partIndex} 
                href={linkUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-3 mb-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-md transition-colors flex items-center justify-center gap-2 text-center"
              >
                {linkText}
              </a>
            );
          }
          
          // For regular links (like university websites)
          return (
            <a key={partIndex} href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline font-semibold break-all">
              {linkText}
            </a>
          );
        }
        
        return part; // Return normal text as-is
      });

      // Render as a list item if it was a bullet point
      if (isBullet) {
        return (
          <li key={lineIndex} className="ml-5 mt-1 list-disc marker:text-orange-500">
            {formattedParts}
          </li>
        );
      }

      // Render as a standard paragraph/div
      return (
        <div key={lineIndex} className="mt-1 leading-relaxed">
          {formattedParts}
        </div>
      );
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          student_profile: studentProfile
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I am having trouble connecting to the server right now. Please make sure the AI backend is running!' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-orange-200 z-50 animate-in slide-in-from-bottom-5">
      
      {/* Header */}
      <div className="bg-blue-900 text-white p-4 flex justify-between items-center border-b-4 border-yellow-400">
        <div className="flex items-center gap-2">
          <Bot className="text-yellow-400" />
          <span className="font-bold">Danny's Connect AI</span>
        </div>
        <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-blue-50 flex flex-col gap-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-blue-900 text-yellow-400'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-orange-500 text-white rounded-tr-none whitespace-pre-wrap' 
                  : 'bg-white text-blue-900 border border-blue-100 rounded-tl-none'
              }`}>
                {/* Render raw text for the user, but apply the formatter for the AI */}
                {msg.role === 'user' ? msg.content : formatMessage(msg.content)}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[85%] flex-row">
               <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-900 text-yellow-400">
                <Bot size={16} />
              </div>
              <div className="p-3 rounded-2xl bg-white border border-blue-100 rounded-tl-none flex items-center gap-2 text-blue-500 text-sm">
                <Loader2 size={16} className="animate-spin" /> Thinking...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-blue-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about universities, flights..."
          className="flex-1 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isLoading}
          className="bg-blue-900 hover:bg-blue-800 disabled:bg-blue-300 text-yellow-400 p-2 rounded-full transition-colors flex items-center justify-center w-10 h-10 shadow-md"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}