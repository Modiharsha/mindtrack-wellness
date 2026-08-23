import React, { useState } from 'react';
import { AssignedStudentRosterItem, RiskLevel } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import {
  Search,
  Filter,
  Flame,
  Calendar,
  Eye,
  AlertTriangle,
  Smile,
  ShieldCheck,
  Clock,
} from 'lucide-react';

interface StudentTriageTableProps {
  students: AssignedStudentRosterItem[];
  onSelectStudent: (student: AssignedStudentRosterItem) => void;
}

export const StudentTriageTable: React.FC<StudentTriageTableProps> = ({ students, onSelectStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  const filtered = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = riskFilter === 'ALL' || s.riskLevel === riskFilter;

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-200/80">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            Caseload Management
          </span>
          <h3 className="text-xl font-bold text-slate-800 mt-1">Student Wellness Triage Roster</h3>
          <p className="text-xs text-slate-500">
            Students on your caseload dynamically triaged by survey cutoffs and multi-day mood patterns.
          </p>
        </div>

        {/* Search & Risk Filter */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search student or program..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-slate-50/50"
            />
          </div>

          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-semibold outline-none"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="NEEDS_ATTENTION">Needs Attention (High)</option>
            <option value="MODERATE">Moderate</option>
            <option value="LOW">Low / Thriving</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-3">Student Name</th>
              <th className="py-3 px-3">Program / Year</th>
              <th className="py-3 px-3">Triage Level</th>
              <th className="py-3 px-3">7-Day Mood Avg</th>
              <th className="py-3 px-3">Low Streak</th>
              <th className="py-3 px-3">Latest Check-In</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  No students found matching current filters.
                </td>
              </tr>
            ) : (
              filtered.map(student => {
                const isUrgent = student.riskLevel === 'NEEDS_ATTENTION';
                return (
                  <tr
                    key={student.studentProfileId}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isUrgent ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        {student.name}
                        {student.pendingAppointment && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> Appt Requested
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">{student.email}</span>
                    </td>

                    <td className="py-3 px-3 text-slate-600 font-medium">
                      <p>{student.program}</p>
                      <span className="text-[10px] text-slate-400">Class of {student.graduationYear}</span>
                    </td>

                    <td className="py-3 px-3">
                      <RiskBadge level={student.riskLevel} size="sm" />
                    </td>

                    <td className="py-3 px-3 font-semibold">
                      {student.avg7DayMood !== null ? (
                        <span
                          className={`px-2 py-0.5 rounded-lg text-xs ${
                            student.avg7DayMood <= 2.2
                              ? 'bg-rose-100 text-rose-800'
                              : student.avg7DayMood <= 3.2
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {student.avg7DayMood} / 5.0
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {student.activeLowStreak >= 3 ? (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md font-bold text-[11px]">
                          <Flame className="w-3 h-3 text-rose-600 fill-rose-500" />
                          {student.activeLowStreak} Days Low
                        </span>
                      ) : student.activeLowStreak > 0 ? (
                        <span className="text-amber-700 font-medium">{student.activeLowStreak} Days</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {student.latestSurvey ? (
                        <div>
                          <p className="font-semibold text-slate-800 line-clamp-1">{student.latestSurvey.title}</p>
                          <span className="text-[10px] text-slate-400">
                            Score: {student.latestSurvey.score} pts ({new Date(student.latestSurvey.submittedAt).toLocaleDateString()})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No survey taken</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectStudent(student)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-bold transition-all shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Profile
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
