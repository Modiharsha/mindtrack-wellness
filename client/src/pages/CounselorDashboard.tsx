import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AssignedStudentRosterItem } from '../types';
import { StudentTriageTable } from '../components/counselor/StudentTriageTable';
import { StudentDetailModal } from '../components/counselor/StudentDetailModal';
import { CounselorAppointmentsView } from '../components/counselor/CounselorAppointmentsView';
import { CounselorInboxView } from '../components/counselor/CounselorInboxView';
import {
  Users,
  AlertTriangle,
  Calendar,
  MessageCircle,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

export const CounselorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<AssignedStudentRosterItem[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<AssignedStudentRosterItem | null>(null);
  const [activeTab, setActiveTab] = useState<'roster' | 'appointments' | 'messages'>('roster');
  const [loading, setLoading] = useState(true);

  const loadCounselorData = async () => {
    try {
      setLoading(true);
      const res = await api.getAssignedStudents();
      setStudents(res.students || []);
    } catch (err) {
      console.error('Failed to load counselor students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCounselorData();
  }, []);

  const totalCaseload = students.length;
  const needsAttentionCount = students.filter(s => s.riskLevel === 'NEEDS_ATTENTION').length;
  const moderateCount = students.filter(s => s.riskLevel === 'MODERATE').length;
  const pendingApptsCount = students.filter(s => s.pendingAppointment).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full text-emerald-100">
              Clinical Counselor Portal
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">
              Welcome, {user?.name || 'Dr. Sarah Chen'}
            </h1>
            <p className="text-emerald-100 text-xs md:text-sm mt-1 max-w-xl">
              Proactively identify and support students facing academic, sleep, or emotional strain.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Caseload */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Active Caseload</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{totalCaseload} Students</h3>
          </div>
        </div>

        {/* Needs Attention Alert */}
        <div className="bg-rose-50/70 p-5 rounded-3xl border border-rose-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-rose-600 font-semibold uppercase">Needs Attention</span>
            <h3 className="text-2xl font-extrabold text-rose-950">{needsAttentionCount} Flagged</h3>
          </div>
        </div>

        {/* Moderate Check-In */}
        <div className="bg-amber-50/70 p-5 rounded-3xl border border-amber-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-amber-700 font-semibold uppercase">Moderate Watch</span>
            <h3 className="text-2xl font-extrabold text-amber-950">{moderateCount} Students</h3>
          </div>
        </div>

        {/* Pending Appts */}
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Pending Check-Ins</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{pendingApptsCount} Requests</h3>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'roster'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> Student Triage Roster
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'appointments'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" /> Appointments & Slots
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'messages'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageCircle className="w-4 h-4" /> Message Inbox
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'roster' && (
        <StudentTriageTable
          students={students}
          onSelectStudent={student => setSelectedStudent(student)}
        />
      )}

      {activeTab === 'appointments' && <CounselorAppointmentsView />}

      {activeTab === 'messages' && <CounselorInboxView />}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          studentProfileId={selectedStudent.studentProfileId}
          onClose={() => setSelectedStudent(null)}
          onRefreshList={loadCounselorData}
        />
      )}
    </div>
  );
};
