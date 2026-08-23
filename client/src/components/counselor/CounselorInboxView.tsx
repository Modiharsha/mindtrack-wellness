import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { Message } from '../../types';
import { MessageCircle, Send, User, Search, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CounselorInboxView: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await api.getConversations();
      setConversations(res.conversations || []);

      if (res.conversations?.length > 0 && !activePartnerId) {
        setActivePartnerId(res.conversations[0].partner.id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (partnerId: string) => {
    try {
      const res = await api.getMessageThread(partnerId);
      setMessages(res.messages || []);
    } catch (err) {
      console.error('Failed to load thread:', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activePartnerId) {
      loadMessages(activePartnerId);
      const interval = setInterval(() => loadMessages(activePartnerId), 6000);
      return () => clearInterval(interval);
    }
  }, [activePartnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !activePartnerId) return;

    setSending(true);
    try {
      const res = await api.sendMessage(activePartnerId, newMsg.trim());
      setMessages(prev => [...prev, res.message]);
      setNewMsg('');
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  const activePartner = conversations.find(c => c.partner.id === activePartnerId)?.partner;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[600px]">
      {/* Sidebar: Conversation List (4 cols) */}
      <div className="md:col-span-4 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-100">
          <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-600" /> Student Messages
          </h4>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <p>No active conversations yet.</p>
            </div>
          ) : (
            conversations.map(c => {
              const isSelected = c.partner.id === activePartnerId;
              return (
                <button
                  key={c.partner.id}
                  onClick={() => setActivePartnerId(c.partner.id)}
                  className={`w-full text-left p-3.5 transition-all flex items-start justify-between ${
                    isSelected ? 'bg-white shadow-sm border-l-4 border-emerald-600' : 'hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                      {c.partner.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-800">{c.partner.name}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{c.lastMessage?.content || 'No messages'}</p>
                    </div>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area (8 cols) */}
      <div className="md:col-span-8 flex flex-col bg-white h-full">
        {activePartner ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-800">{activePartner.name}</h4>
                <p className="text-[10px] text-slate-400">{activePartner.email}</p>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(m => {
                const isMe = m.senderId === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%] ${
                      isMe ? 'ml-auto' : 'mr-auto'
                    }`}
                  >
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                          : 'bg-slate-100 text-slate-800 rounded-bl-none'
                      }`}
                    >
                      <p>{m.content}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">
                      {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder={`Type a supportive reply to ${activePartner.name}...`}
                className="flex-1 text-xs p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
              <button
                type="submit"
                disabled={!newMsg.trim() || sending}
                className="p-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-slate-400 text-xs p-6">
            <p>Select a student conversation to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};
