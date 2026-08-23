import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Appointment } from '../../types';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Video,
  User,
  Check,
} from 'lucide-react';

export const CounselorAppointmentsView: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [scheduledAtTime, setScheduledAtTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('https://meet.mindtrack.edu/room/counselor-session');
  const [counselorNote, setCounselorNote] = useState('');

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.getAppointments();
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  ) => {
    try {
      await api.updateAppointmentStatus(id, {
        status,
        scheduledAt: scheduledAtTime || undefined,
        meetingLink: meetingLink || undefined,
        counselorNotes: counselorNote || undefined,
      });

      setConfirmingId(null);
      loadAppointments();
    } catch (err) {
      console.error('Failed to update appointment:', err);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-200/80">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            Appointments & Slots
          </span>
          <h3 className="text-xl font-bold text-slate-800 mt-1">Student Check-In Sessions</h3>
          <p className="text-xs text-slate-500">
            Review incoming requests from students on your caseload and confirm meeting links.
          </p>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
          <p className="text-xs font-semibold text-slate-600">No appointments scheduled</p>
          <p className="text-[11px] text-slate-400 mt-0.5">When students request a check-in, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(appt => {
            const isRequested = appt.status === 'REQUESTED';
            const isConfirmed = appt.status === 'CONFIRMED';
            const isCompleted = appt.status === 'COMPLETED';

            return (
              <div
                key={appt.id}
                className={`p-5 rounded-2xl border transition-all text-xs ${
                  isRequested
                    ? 'bg-amber-50/40 border-amber-200 shadow-sm'
                    : isConfirmed
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800">
                        {appt.student?.user?.name || 'Student'}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isRequested
                            ? 'bg-amber-200 text-amber-900'
                            : isConfirmed
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>

                    <p className="text-slate-600 font-semibold">
                      Requested Slot: {appt.requestedSlot}
                    </p>

                    {appt.studentNotes && (
                      <p className="text-[11px] text-slate-600 italic">
                        Student Note: "{appt.studentNotes}"
                      </p>
                    )}

                    {isConfirmed && appt.scheduledAt && (
                      <p className="text-emerald-800 font-bold">
                        Confirmed for: {new Date(appt.scheduledAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {isRequested && (
                      <>
                        <button
                          onClick={() => setConfirmingId(appt.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm transition-colors"
                        >
                          Confirm & Assign Slot
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                          className="px-3 py-2 rounded-xl bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {isConfirmed && (
                      <button
                        onClick={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 shadow-sm"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>

                {/* Confirming Slot Form Inline */}
                {confirmingId === appt.id && (
                  <div className="mt-4 pt-4 border-t border-amber-200 bg-white p-4 rounded-xl space-y-3">
                    <h5 className="font-bold text-slate-800">Confirm Appointment Time & Meeting Link</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduledAtTime}
                          onChange={e => setScheduledAtTime(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Meeting Link / Room Location
                        </label>
                        <input
                          type="text"
                          value={meetingLink}
                          onChange={e => setMeetingLink(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(appt.id, 'CONFIRMED')}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm"
                      >
                        Confirm Appointment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
