import { useEffect, useRef, useState } from 'react';
import { Redirect } from 'wouter';
import { AppShell } from '../components/AppShell';
import { ChatBubble } from '../components/ChatBubble';
import { ChatComposer } from '../components/ChatComposer';
import { askAssistant, createMessageId, type ChatMessage } from '../lib/chat';
import { loadOrganization, type Organization } from '../lib/organizations';

const greeting: ChatMessage = {
  id: 'welcome', role: 'assistant',
  text: 'Hi! I’m your AI assistant. Ask me a question to test how I respond to customers.',
};

export function ConversationsPage() {
  const [organization, setOrganization] = useState<Organization | null>();
  const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messageList = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadOrganization().then(setOrganization).catch((caught: Error) => setError(caught.message));
  }, []);
  useEffect(() => {
    const container = messageList.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, isSending]);

  async function sendMessage(text: string) {
    if (!organization) return;
    const userMessage: ChatMessage = { id: createMessageId(), role: 'user', text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setError('');
    setIsSending(true);
    try {
      const reply = await askAssistant(nextMessages, organization.name);
      setMessages((current) => [...current, { id: createMessageId(), role: 'assistant', text: reply }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSending(false);
    }
  }

  if (organization === undefined) return <main className="centered-page">Loading chat...</main>;
  if (organization === null) return <Redirect to="/onboarding" />;

  return (
    <AppShell organizationName={organization.name}>
      <header className="dashboard-header chat-header">
        <div><p className="eyebrow">Conversations</p><h1>Test your AI assistant</h1><p>Chat with it exactly as a customer would.</p></div>
        <span className="online-status"><i /> Online</span>
      </header>
      <section className="chat-panel">
        <div className="chat-messages" ref={messageList} aria-live="polite">
          {messages.map((message) => <ChatBubble key={message.id} message={message} />)}
          {isSending && <div className="typing-indicator" aria-label="AI is thinking"><i /><i /><i /></div>}
        </div>
        {error && <div className="chat-error" role="alert">{error}</div>}
        <ChatComposer disabled={isSending} onSend={(message) => void sendMessage(message)} />
      </section>
    </AppShell>
  );
}
