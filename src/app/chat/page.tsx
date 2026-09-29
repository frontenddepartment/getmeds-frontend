import type { Metadata } from 'next';
import ChatClient from './ChatClient';
import { QueuedInquiryNotice } from '@/lib/QueuedInquiryNotice';
import './chat.css';

// chat.html + src/entries/chat-entry.tsx.
export const metadata: Metadata = {
  title: { absolute: 'Chat with Getmeds | Getmeds' },
  description: 'Chat with Getmeds about a medicine or a request. Our assistant answers right away and a pharmacist follows up.',
  // The page is a frame around the chat widget, with nothing of its own for
  // search engines to index.
  robots: { index: false, follow: false },
};

export default function ChatPage() {
  return (
    <div className="gm-page-chat" data-page="chat">
      <ChatClient />
      <QueuedInquiryNotice />
    </div>
  );
}
