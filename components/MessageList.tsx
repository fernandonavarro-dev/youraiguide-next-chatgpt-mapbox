// MessageList.tsx
import React from 'react';
import { MessageObject } from './ChatGPTAssistant';

type MessageListProps = {
  messages: MessageObject[];
};

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="h-64 overflow-y-auto mb-4 p-1">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`mb-2 ${message.sender === 'user' ? 'text-right' : ''}`}
        >
          <span
            className={
              message.sender === 'user' ? 'text-blue-400' : 'text-green-400'
            }
          >
            {message.sender === 'user' ? 'You: ' : 'Assistant: '}
          </span>
          {message.message}
        </div>
      ))}
    </div>
  );
};
