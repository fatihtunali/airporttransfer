'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FaComments,
  FaSearch,
  FaPaperPlane,
  FaUser,
  FaCar,
  FaHeadset,
  FaPaperclip,
  FaMapMarkerAlt,
} from 'react-icons/fa';

interface Conversation {
  id: number;
  bookingId: number;
  bookingCode: string;
  customerName: string;
  driverName: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: string;
}

interface Message {
  id: number;
  senderType: 'CUSTOMER' | 'DRIVER' | 'DISPATCHER' | 'SYSTEM';
  senderName: string;
  message: string;
  messageType: 'TEXT' | 'IMAGE' | 'LOCATION' | 'SYSTEM';
  attachmentUrl: string | null;
  locationLat: number | null;
  locationLng: number | null;
  isRead: boolean;
  createdAt: string;
}

const senderColors: Record<string, string> = {
  CUSTOMER: 'bg-blue-600',
  DRIVER: 'bg-green-600',
  DISPATCHER: 'bg-cyan-600',
  SYSTEM: 'bg-gray-600',
};

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/dispatch/messages');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (bookingId: number) => {
    try {
      const res = await fetch(`/api/dispatch/messages/${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.bookingId);
      const interval = setInterval(() => fetchMessages(selectedConversation.bookingId), 10000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const res = await fetch(`/api/dispatch/messages/${selectedConversation.bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });

      if (res.ok) {
        setNewMessage('');
        fetchMessages(selectedConversation.bookingId);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        conv.bookingCode.toLowerCase().includes(query) ||
        conv.customerName.toLowerCase().includes(query) ||
        conv.driverName?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Conversations List */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-lg font-bold text-white mb-4">Messages</h1>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <FaComments className="w-8 h-8 mx-auto mb-2" />
              No conversations
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b border-gray-700 cursor-pointer transition-colors ${
                  selectedConversation?.id === conv.id
                    ? 'bg-cyan-900/30 border-l-2 border-cyan-500'
                    : 'hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 text-sm">{conv.bookingCode}</span>
                      {conv.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="text-white text-sm mt-1">{conv.customerName}</div>
                    {conv.driverName && (
                      <div className="text-gray-400 text-xs">Driver: {conv.driverName}</div>
                    )}
                    <p className="text-gray-500 text-sm mt-1 truncate">{conv.lastMessage}</p>
                  </div>
                  <div className="text-xs text-gray-400">{formatTime(conv.lastMessageTime)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-cyan-400">{selectedConversation.bookingCode}</span>
                  <div className="flex items-center gap-4 mt-1 text-sm">
                    <span className="flex items-center gap-1 text-gray-300">
                      <FaUser className="w-3 h-3 text-blue-400" />
                      {selectedConversation.customerName}
                    </span>
                    {selectedConversation.driverName && (
                      <span className="flex items-center gap-1 text-gray-300">
                        <FaCar className="w-3 h-3 text-green-400" />
                        {selectedConversation.driverName}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    selectedConversation.status === 'COMPLETED'
                      ? 'bg-gray-500'
                      : 'bg-green-500'
                  } text-white`}
                >
                  {selectedConversation.status}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderType === 'DISPATCHER' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.senderType === 'DISPATCHER'
                        ? 'bg-cyan-600 text-white'
                        : msg.senderType === 'SYSTEM'
                        ? 'bg-gray-700 text-gray-300 text-center w-full max-w-full'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    {msg.senderType !== 'DISPATCHER' && msg.senderType !== 'SYSTEM' && (
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full ${senderColors[msg.senderType]}`}
                        ></span>
                        <span className="text-xs text-gray-400">{msg.senderName}</span>
                      </div>
                    )}

                    {msg.messageType === 'LOCATION' && msg.locationLat && msg.locationLng ? (
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-red-400" />
                        <span>Shared location</span>
                      </div>
                    ) : msg.messageType === 'IMAGE' && msg.attachmentUrl ? (
                      <img
                        src={msg.attachmentUrl}
                        alt="Attachment"
                        className="rounded max-w-full"
                      />
                    ) : (
                      <p>{msg.message}</p>
                    )}

                    <div
                      className={`text-xs mt-1 ${
                        msg.senderType === 'DISPATCHER' ? 'text-cyan-200' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <FaPaperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPaperPlane className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <FaComments className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg">Select a conversation</p>
              <p className="text-sm mt-2">Choose a booking to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
