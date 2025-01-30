import React, { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { streamChat } from './lib/gemini';
import {
  Download,
  Trash2,
  Settings,
  History,
  Bookmark,
  Share2,
} from 'lucide-react';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);
  const [favorites, setFavorites] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let assistantMessage = '';
      const stream = streamChat(content, temperature);

      for await (const chunk of stream) {
        assistantMessage += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          if (newMessages[newMessages.length - 1]?.role === 'assistant') {
            newMessages[newMessages.length - 1].content = assistantMessage;
          } else {
            newMessages.push({
              role: 'assistant',
              content: assistantMessage,
              timestamp: Date.now(),
            });
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Прошу прощения, но я столкнулся с ошибкой. Пожалуйста, попробуйте еще раз.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const conversation = {
      messages,
      exportDate: new Date().toISOString(),
      settings: { temperature },
    };

    const blob = new Blob([JSON.stringify(conversation, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена!');
    } catch (err) {
      console.error('Не удалось скопировать:', err);
    }
  };

  const toggleFavorite = (message: Message) => {
    setFavorites((prev) => {
      const exists = prev.some((m) => m.timestamp === message.timestamp);
      if (exists) {
        return prev.filter((m) => m.timestamp !== message.timestamp);
      }
      return [...prev, message];
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      <header className="p-4 bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🔥Fire.music🔥
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              title="настройки"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              title="Share conversation"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              title="Export conversation"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleClear}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {showSettings && (
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <div className="flex items-center gap-4">
              <label className="flex-grow">
                Temperature: {temperature}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow overflow-y-auto">
        <div className="container mx-auto max-w-4xl">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <p className="text-xl mb-2">добро пожаловать в чат с 🔥Fire.music🔥</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                onFavorite={() => toggleFavorite(message)}
                isFavorite={favorites.some(
                  (m) => m.timestamp === message.timestamp
                )}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="container mx-auto max-w-4xl">
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </footer>
    </div>
  );
}

export default App;
