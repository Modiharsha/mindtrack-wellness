import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, CounselorProfile } from '../../types';
import { Users, CheckCircle, XCircle, ShieldCheck, UserCheck, RefreshCw } from 'lucide-react';

export const StaffApprovalManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [counselors, setCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, counselorsRes] = await Promise.all([
        api.getAdminUsers(),
        api.getCounselors(),
      ]);
      setUsers(usersRes.users || []);
      setCounselors(counselorsRes.counselors || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleApproval = async (userId: string, currentStatus: boolean) => {
    try {
      await api.toggleUserApproval(userId, !currentStatus);
      loadData();
    } catch (err) {
      console.error('Failed to toggle approval:', err);
    }
  };

  const staffUsers = users.filter(u => u.role === 'COUNSELOR' || u.role === 'ADMIN');
  const studentUsers = users.filter(u => u.role === 'STUDENT');

  return (
    <div className="space-y-6">
      {/* Staff Approvals Section */}
      <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Access Control
            </span>
            <h3 className="text-xl font-bold text-slate-800 mt-1">Counselor & Staff Approvals</h3>
            <p className="text-xs text-slate-500">
              Staff accounts must be verified and approved by institution administrators before viewing student data.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Staff Name</th>
                <th className="py-2.5 px-3">Role & Title</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Approval Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffUsers.map(staff => (
                <tr key={staff.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-800">
                    <p>{staff.name}</p>
                    <span className="text-[10px] text-slate-400 font-normal">{staff.email}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    <span className="font-bold text-slate-700">{staff.role}</span>
                    <p className="text-[10px] text-slate-400">{staff.counselorProfile?.title || 'Administrator'}</p>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {staff.counselorProfile?.department || 'Administration'}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        staff.isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {staff.isApproved ? 'Approved' : 'Pending Review'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleToggleApproval(staff.id, staff.isApproved)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                        staff.isApproved
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                      }`}
                    >
                      {staff.isApproved ? 'Revoke Access' : 'Approve Staff'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
