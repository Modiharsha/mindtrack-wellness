import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Lock, Mail, User, Shield, Sparkles, AlertCircle } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup({
          name,
          email,
          password,
          role,
          program: role === 'STUDENT' ? program : undefined,
          department: role !== 'STUDENT' ? department : undefined,
        });
      }

      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'COUNSELOR') navigate('/counselor');
      else navigate('/student');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole: 'STUDENT' | 'COUNSELOR' | 'ADMIN', demoEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, 'Password@123');
      if (demoRole === 'ADMIN') navigate('/admin');
      else if (demoRole === 'COUNSELOR') navigate('/counselor');
      else navigate('/student');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-xl border border-slate-200/80 space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/20">
            <Heart className="w-6 h-6 fill-white/20" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isLogin ? 'Sign in to MindTrack' : 'Create your account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isLogin
              ? 'Enter your institutional email to access your wellness hub.'
              : 'Join the campus wellness monitoring & support community.'}
          </p>
        </div>

        {/* 1-Click Quick Demo Switchers */}
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5 text-xs">
          <p className="font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Instant Demo Logins:
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('STUDENT', 'alex.rivera@mindtrack.edu')}
              className="p-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-[11px] font-semibold text-center transition-colors"
            >
              Alex (Student)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('COUNSELOR', 'dr.sarah@mindtrack.edu')}
              className="p-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-[11px] font-semibold text-center transition-colors"
            >
              Dr. Sarah (Staff)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN', 'admin@mindtrack.edu')}
              className="p-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-[11px] font-semibold text-center transition-colors"
            >
              Eleanor (Admin)
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {!isLogin && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jordan Lee"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
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
                  <option value="COUNSELOR">Counselor / Mental Health Mentor</option>
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
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
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
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Institutional Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@mindtrack.edu"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
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
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 text-xs"
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle sign in / sign up */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setIsLogin(false)}
                className="text-emerald-700 font-bold hover:underline"
              >
                Sign up here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setIsLogin(true)}
                className="text-emerald-700 font-bold hover:underline"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
