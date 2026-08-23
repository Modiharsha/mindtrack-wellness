import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Appointment, Message, CounselorProfile } from '../../types';
import {
  Calendar,
  MessageCircle,
  Clock,
  Send,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Video,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const CounselorConnect: React.FC = () => {
  const { user } = useAuth();
  const [counselor, setCounselor] = useState<CounselorProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Appointment Request Form State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestedSlot, setRequestedSlot] = useState('');
  const [studentNotes, setStudentNotes] = useState('');
  const [requestingAppt, setRequestingAppt] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadData = async () => {
    try {
      // 1. Fetch counselor list to identify assigned counselor
      const counselorRes = await api.getCounselors();
      const assignedId = user?.studentProfile?.assignedCounselorId;
      const found = counselorRes.counselors.find((c: any) => c.id === assignedId) || counselorRes.counselors[0];
      setCounselor(found || null);

      // 2. Fetch student appointments
      const apptRes = await api.getAppointments();
      setAppointments(apptRes.appointments || []);

      // 3. Fetch chat messages with counselor
      if (found?.user?.id) {
        const msgRes = await api.getMessageThread(found.user.id);
        setMessages(msgRes.messages || []);
      }
    } catch (err) {
      console.error('Error loading counselor data:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(async () => {
      if (counselor?.user?.id) {
        const msgRes = await api.getMessageThread(counselor.user.id);
        setMessages(msgRes.messages || []);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [counselor?.user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !counselor?.user?.id) return;

    setSendingMsg(true);
    try {
      const res = await api.sendMessage(counselor.user.id, newMessage.trim());
      setMessages(prev => [...prev, res.message]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleRequestAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedSlot.trim()) return;

    setRequestingAppt(true);
    try {
      await api.requestAppointment({
        counselorId: counselor?.id,
        requestedSlot: requestedSlot.trim(),
        studentNotes: studentNotes.trim() || undefined,
      });

      setRequestSuccess(true);
      setTimeout(() => {
        setShowRequestModal(false);
        setRequestSuccess(false);
        setRequestedSlot('');
        setStudentNotes('');
      }, 2000);
      loadData();
    } catch (err) {
      console.error('Appointment request failed:', err);
    } finally {
      setRequestingAppt(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Counselor Card */}
      <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-200/80">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={
                counselor?.user?.avatar ||
                'https://images.unsplash.com/photo-1594824813633-4f934273297a?w=150&auto=format&fit=crop&q=80'
              }
              alt={counselor?.user?.name || 'Counselor'}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-100 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Your Assigned Counselor
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mt-1">
                {counselor?.user?.name || 'Dr. Sarah Chen, Ph.D.'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">{counselor?.title || 'Licensed Mental Health Counselor'}</p>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Office Hours: {counselor?.officeHours || 'Mon-Thu, 9:00 AM - 4:30 PM'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowRequestModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" /> Request Check-In Slot
          </button>
        </div>
      </div>

      {/* Grid: Appointments & Direct Secure Messaging */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scheduled Appointments (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" /> Your Check-Ins & Requests
              </h4>
              <span className="text-xs font-semibold text-slate-400">{appointments.length} Total</span>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50 text-slate-300" />
                <p>No check-in requests currently.</p>
                <p className="text-[11px] text-slate-400 mt-1">Need to talk? Click "Request Check-In Slot" above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map(appt => {
                  const isConfirmed = appt.status === 'CONFIRMED';
                  const isRequested = appt.status === 'REQUESTED';
                  return (
                    <div
                      key={appt.id}
                      className={`p-4 rounded-2xl border transition-all text-xs ${
                        isConfirmed
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                          : isRequested
                          ? 'bg-amber-50/40 border-amber-200 text-amber-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isConfirmed
                              ? 'bg-emerald-200/80 text-emerald-800'
                              : isRequested
                              ? 'bg-amber-200/80 text-amber-900'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {appt.status}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(appt.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="font-bold text-slate-800">
                        {isConfirmed && appt.scheduledAt
                          ? `Scheduled: ${new Date(appt.scheduledAt).toLocaleString()}`
                          : `Requested: ${appt.requestedSlot}`}
                      </p>

                      {appt.studentNotes && (
                        <p className="text-[11px] text-slate-600 mt-1 italic">
                          " {appt.studentNotes} "
                        </p>
                      )}

                      {appt.meetingLink && isConfirmed && (
                        <a
                          href={appt.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:underline"
                        >
                          <Video className="w-3.5 h-3.5" /> Join Virtual Meeting Room
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl text-[11px] text-slate-500 mt-4">
            <span className="font-semibold text-slate-700">Need immediate help?</span> Check-in requests are reviewed during normal office hours. For urgent crisis intervention, use the red Crisis Support button at the top.
          </div>
        </div>

        {/* Right Column: Direct Messaging Thread (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col h-[520px]">
          {/* Thread Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h4 className="font-bold text-sm text-slate-800">Private Counselor Channel</h4>
                <p className="text-[10px] text-slate-400">Encrypted 1-on-1 communication with {counselor?.user?.name || 'Dr. Chen'}</p>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-3 p-2">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs py-8">
                <MessageCircle className="w-8 h-8 text-slate-300 mb-2" />
                <p className="font-semibold text-slate-600">No messages yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                  Say hello or share any academic or personal challenges you'd like guidance on.
                </p>
              </div>
            ) : (
              messages.map(m => {
                const isMe = m.senderId === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[82%] ${
                      isMe ? 'ml-auto' : 'mr-auto'
                    }`}
                  >
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                          : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60'
                      }`}
                    >
                      <p>{m.content}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">
                      {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder={`Send a private message to ${counselor?.user?.name || 'counselor'}...`}
              className="flex-1 text-xs p-3 rounded-2xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sendingMsg}
              className={`p-3 rounded-2xl text-white transition-all shadow-sm ${
                newMessage.trim() && !sendingMsg
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Appointment Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100">
            <h3 className="text-lg font-bold text-slate-800">Request a Wellness Check-In</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select a preferred day/time to meet with {counselor?.user?.name || 'your counselor'}.
            </p>

            {requestSuccess ? (
              <div className="py-8 text-center text-emerald-700">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-600" />
                <p className="font-bold text-sm">Request Sent Successfully!</p>
                <p className="text-xs text-slate-500 mt-1">Your counselor will confirm your slot shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleRequestAppointment} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Day & Time Window *
                  </label>
                  <input
                    type="text"
                    required
                    value={requestedSlot}
                    onChange={e => setRequestedSlot(e.target.value)}
                    placeholder="e.g. Thursday afternoon between 2pm - 4pm"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    What would you like to discuss? (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={studentNotes}
                    onChange={e => setStudentNotes(e.target.value)}
                    placeholder="e.g. Study burnout, sleep troubles, or just need a sounding board..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestingAppt}
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm"
                  >
                    {requestingAppt ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
