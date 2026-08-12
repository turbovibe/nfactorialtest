import type { ChatMessage } from '../lib/chat';

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <article className={`chat-bubble ${isUser ? 'user-message' : 'assistant-message'}`}>
      <span className="chat-avatar" aria-hidden="true">{isUser ? 'You' : 'AI'}</span>
      <div>
        <strong>{isUser ? 'You' : 'AI assistant'}</strong>
        <p>{message.text}</p>
      </div>
    </article>
  );
}
