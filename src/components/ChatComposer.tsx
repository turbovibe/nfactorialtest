import { useState, type FormEvent, type KeyboardEvent } from 'react';

type ChatComposerProps = { disabled: boolean; onSend: (message: string) => void };

export function ChatComposer({ disabled, onSend }: ChatComposerProps) {
  const [message, setMessage] = useState('');

  function sendMessage() {
    const cleanMessage = message.trim();
    if (!cleanMessage || disabled) return;
    onSend(cleanMessage);
    setMessage('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    sendMessage();
  }

  return (
    <form className="chat-composer" onSubmit={submit}>
      <label htmlFor="chat-message">Message the assistant</label>
      <div>
        <textarea
          id="chat-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about products, pricing, or next steps..."
          rows={2}
          maxLength={2000}
          disabled={disabled}
        />
        <button className="primary-button" type="submit" disabled={disabled || !message.trim()}>
          {disabled ? 'Thinking...' : 'Send'}
        </button>
      </div>
      <small>Press Enter to send · Shift + Enter for a new line</small>
    </form>
  );
}
