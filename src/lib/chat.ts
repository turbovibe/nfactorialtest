import { supabase } from './supabase';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

let messageSequence = 0;

export function createMessageId() {
  messageSequence += 1;
  return `message-${Date.now()}-${messageSequence}`;
}

const systemPrompt = `You are a friendly AI employee for a small business.
Answer clearly and concisely. Help visitors understand the business, its products,
and next steps. If you do not know a business-specific fact, say so instead of inventing it.`;

function conversationPrompt(messages: ChatMessage[], organizationName: string) {
  const transcript = messages
    .map((message) => `${message.role === 'user' ? 'Customer' : 'Assistant'}: ${message.text}`)
    .join('\n');
  return `Business: ${organizationName}\n\nConversation so far:\n${transcript}\nAssistant:`;
}

export async function askAssistant(messages: ChatMessage[], organizationName: string) {
  const { data, error } = await supabase.functions.invoke('ai', {
    body: { prompt: conversationPrompt(messages, organizationName), system: systemPrompt },
  });

  if (error) throw new Error('The AI could not respond. Check that the AI function is deployed.');
  if (!data || typeof data.text !== 'string' || !data.text.trim()) {
    throw new Error(typeof data?.error === 'string' ? data.error : 'The AI returned an empty response.');
  }
  return data.text.trim();
}
