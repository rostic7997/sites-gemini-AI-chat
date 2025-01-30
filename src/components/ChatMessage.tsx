import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bot, User, Star } from 'lucide-react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onFavorite: () => void;
  isFavorite: boolean;
}

export function ChatMessage({ message, onFavorite, isFavorite }: ChatMessageProps) {
  return (
    <div className={`flex gap-4 p-4 ${message.role === 'assistant' ? 'bg-gray-900' : ''}`}>
      <div className="flex-shrink-0">
        {message.role === 'assistant' ? (
          <Bot className="w-6 h-6 text-blue-400" />
        ) : (
          <User className="w-6 h-6 text-green-400" />
        )}
      </div>
      <div className="flex-grow prose prose-invert max-w-none">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
      <button
        onClick={onFavorite}
        className={`p-2 rounded-lg hover:bg-gray-800 transition-colors ${
          isFavorite ? 'text-yellow-400' : 'text-gray-400'
        }`}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star className="w-5 h-5" />
      </button>
    </div>
  );
}