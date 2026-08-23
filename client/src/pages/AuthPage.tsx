import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Lock, Mail, User, Sparkles, AlertCircle, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'COUNSELOR' | 'ADMIN'>('STUDENT');
  const [program, setProgram] = useState('B.S. Computer Science');
  const [department, setDepartment] = useState('Student Counseling Center');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleStudentDirectSignIn = async (studentEmail: string = 'alex.rivera@mindtrack.edu') => {
    setError(null);
    setLoading(true);
    try {
      await login(studentEmail, 'Password@123');
      navigate('/student');
    } catch (err: any) {
      setError(err.message || 'Student login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // If password is empty, use default password for seamless access
        await login(email.trim(), password.trim() || 'Password@123');
      } else {
        await signup({
          name: name.trim() || email.split('@')[0],
          email: email.trim(),
          password: password.trim() || 'Password@123',
          role,
          program: role === 'STUDENT' ? program : undefined,
          department: role !== 'STUDENT' ? department : undefined,
        });
      }

      if (role === 'ADMIN' || email.includes('admin')) navigate('/admin');
      else if (role === 'COUNSELOR' || email.includes('dr.') || email.includes('counselor')) navigate('/counselor');
      else navigate('/student');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffDemo = async (demoRole: 'COUNSELOR' | 'ADMIN', demoEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, 'Password@123');
      if (demoRole === 'ADMIN') navigate('/admin');
      else navigate('/counselor');
    } catch (err: any) {
      setError(err.message || 'Staff login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-8">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-200/80 space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/25">
            <Heart className="w-7 h-7 fill-white/20" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            MindTrack Student Wellness
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Campus Mental Health & Academic Support Hub
          </p>
        </div>

        {/* 1-Click Primary Student Access Button */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-2xl text-white shadow-md shadow-emerald-500/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-100" />
              <span className="font-bold text-sm tracking-wide">Student Direct Access</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">1-Click</span>
          </div>
          <p className="text-xs text-emerald-50 leading-relaxed">
            Students can enter immediately without needing complex passwords.
          </p>
          <button
            type="button"
            onClick={() => handleStudentDirectSignIn('alex.rivera@mindtrack.edu')}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white text-emerald-800 rounded-xl font-black text-xs hover:bg-emerald-50 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Sign In as Student (Instant Access)</span>
            <ArrowRight className="w-4 h-4 text-emerald-600 ml-auto" />
          </button>
        </div>

        {/* Student Profile Quick Switcher */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Or select a student account:
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleStudentDirectSignIn('alex.rivera@mindtrack.edu')}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50 text-left transition-all group"
            >
              <p className="font-bold text-[11px] text-slate-800 group-hover:text-emerald-800">Alex R.</p>
              <p className="text-[10px] text-slate-500">CS Junior</p>
            </button>
            <button
              type="button"
              onClick={() => handleStudentDirectSignIn('maya.patel@mindtrack.edu')}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50 text-left transition-all group"
            >
              <p className="font-bold text-[11px] text-slate-800 group-hover:text-emerald-800">Maya P.</p>
              <p className="text-[10px] text-slate-500">Bio Soph.</p>
            </button>
            <button
              type="button"
              onClick={() => handleStudentDirectSignIn('jordan.lee@mindtrack.edu')}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50 text-left transition-all group"
            >
              <p className="font-bold text-[11px] text-slate-800 group-hover:text-emerald-800">Jordan L.</p>
              <p className="text-[10px] text-slate-500">Psych Senior</p>
            </button>
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-medium">Or enter your email</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Custom Email / Name Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {!isLogin && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Sam Taylor"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white font-semibold"
                >
                  <option value="STUDENT">Student</option>
                  <option value="COUNSELOR">Counselor / Staff</option>
                  <option value="ADMIN">Institutional Administrator</option>
                </select>
              </div>

              {role === 'STUDENT' ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Program / Major</label>
                  <input
                    type="text"
                    value={program}
                    onChange={e => setProgram(e.target.value)}
                    placeholder="e.g. B.S. Computer Science"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none font-medium"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="e.g. Student Wellness Center"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none font-medium"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isLogin ? 'Student Email / ID' : 'Institutional Email'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@mindtrack.edu"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Password <span className="text-slate-400 font-normal">(Optional for demo)</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition-colors shadow-sm disabled:opacity-50 text-xs"
          >
            {loading ? 'Entering...' : isLogin ? 'Sign In with Email' : 'Create My Student Account'}
          </button>
        </form>

        {/* Staff Demo Links */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Staff Logins:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleStaffDemo('COUNSELOR', 'dr.sarah@mindtrack.edu')}
              className="text-emerald-700 font-semibold hover:underline"
            >
              Dr. Sarah (Counselor)
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleStaffDemo('ADMIN', 'admin@mindtrack.edu')}
              className="text-emerald-700 font-semibold hover:underline"
            >
              Dean Vance (Admin)
            </button>
          </div>
        </div>

        {/* Toggle sign in / sign up */}
        <div className="text-center text-xs text-slate-500">
          {isLogin ? (
            <p>
              New student?{' '}
              <button
                onClick={() => setIsLogin(false)}
                className="text-emerald-700 font-bold hover:underline"
              >
                Create your custom profile
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setIsLogin(true)}
                className="text-emerald-700 font-bold hover:underline"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
