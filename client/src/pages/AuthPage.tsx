import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Lock, Mail, User, AlertCircle, BookOpen, GraduationCap } from 'lucide-react';

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

      if (role === 'ADMIN' || email.toLowerCase().includes('admin')) navigate('/admin');
      else if (role === 'COUNSELOR' || email.toLowerCase().includes('dr.') || email.toLowerCase().includes('counselor')) navigate('/counselor');
      else navigate('/student');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-200/80 space-y-6 animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/25">
            <Heart className="w-7 h-7 fill-white/20" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            MindTrack Student Wellness
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isLogin
              ? 'Sign in with your student email to access your wellness dashboard.'
              : 'Create your student account to track wellness and connect with support.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              isLogin
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Student Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              !isLogin
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            New Student Sign Up
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Email & Password Form */}
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
                    placeholder="e.g. Maya Patel"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Role</label>
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
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={program}
                      onChange={e => setProgram(e.target.value)}
                      placeholder="e.g. B.S. Molecular Biology"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 outline-none font-medium"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      placeholder="e.g. Student Wellness Counseling"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 outline-none font-medium"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {role === 'STUDENT' ? 'Student Email' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your.email@university.edu"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium"
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
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 active:scale-[0.99] transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 text-xs"
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Student Account'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          {isLogin ? (
            <p>
              First time here?{' '}
              <button
                onClick={() => { setIsLogin(false); setError(null); }}
                className="text-emerald-700 font-bold hover:underline"
              >
                Create your student account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => { setIsLogin(true); setError(null); }}
                className="text-emerald-700 font-bold hover:underline"
              >
                Sign in with your email
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
