import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Heart,
  Bell,
  LogOut,
  ChevronDown,
  PhoneCall,
  CheckCheck,
  Sparkles,
  Smile,
  Users,
  BarChart3,
  BookOpen,
  Calendar,
  MessageCircle,
  MessageSquareHeart,
} from 'lucide-react';

interface NavbarProps {
  onOpenCrisis: () => void;
  onOpenFeedback: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCrisis, onOpenFeedback }) => {
  const { user, logout, switchUserRoleForDemo } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDemoSwitch = async (role: any, email?: string) => {
    setShowDemoMenu(false);
    await switchUserRoleForDemo(role, email);
    if (role === 'STUDENT') navigate('/student');
    else if (role === 'COUNSELOR') navigate('/counselor');
    else if (role === 'ADMIN') navigate('/admin');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 fill-white/20" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-800 tracking-tight flex items-center gap-1">
                  Mind<span className="text-emerald-600">Track</span>
                </span>
                <span className="hidden md:block text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                  Student Wellness System
                </span>
              </div>
            </Link>

            {/* Navigation by Role */}
            {user && (
              <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200">
                {user.role === 'STUDENT' && (
                  <>
                    <Link
                      to="/student"
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        isActive('/student')
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Smile className="w-4 h-4" /> Wellness Hub
                    </Link>
                    <Link
                      to="/student/surveys"
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        isActive('/student/surveys')
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" /> Surveys
                    </Link>
                    <Link
                      to="/student/counselor"
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        isActive('/student/counselor')
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" /> Connect Counselor
                    </Link>
                  </>
                )}

                {user.role === 'COUNSELOR' && (
                  <>
                    <Link
                      to="/counselor"
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        isActive('/counselor')
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Users className="w-4 h-4" /> Student Triage
                    </Link>
                    <Link
                      to="/counselor/appointments"
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        isActive('/counselor/appointments')
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Calendar className="w-4 h-4" /> Check-Ins
                    </Link>
                    <Link
                      to="/counselor/messages"
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        isActive('/counselor/messages')
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" /> Messages
                    </Link>
                  </>
                )}

                {user.role === 'ADMIN' && (
                  <>
                    <Link
                      to="/admin"
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        isActive('/admin')
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" /> Aggregate Analytics
                    </Link>
                    <Link
                      to="/admin/surveys"
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        isActive('/admin/surveys')
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" /> Survey Templates
                    </Link>
                    <Link
                      to="/admin/resources"
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        isActive('/admin/resources')
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" /> Resource Deck
                    </Link>
                    <Link
                      to="/admin/users"
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        isActive('/admin/users')
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Users className="w-4 h-4" /> Staff & Caseloads
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Feedback Button */}
            <button
              onClick={onOpenFeedback}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200 transition-colors"
              title="Share Feedback"
            >
              <MessageSquareHeart className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Feedback</span>
            </button>

            {/* User Profile Badge */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/80 text-xs">
                {user.avatar && (
                  <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
                )}
                <span className="font-bold text-slate-800">{user.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
            )}

            {/* Notifications Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-fadeIn max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span className="font-bold text-xs text-slate-800">Notifications ({unreadCount})</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[10px] text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <CheckCheck className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No notifications yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.linkUrl) navigate(n.linkUrl);
                              setShowNotifs(false);
                            }}
                            className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                              n.isRead ? 'bg-slate-50 hover:bg-slate-100 text-slate-600' : 'bg-emerald-50/70 text-slate-800 font-medium hover:bg-emerald-100/60'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-semibold text-[11px] text-slate-800">{n.title}</span>
                              <span className="text-[9px] text-slate-400">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-2">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Omnipresent Crisis Support Button */}
            <button
              onClick={onOpenCrisis}
              className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/90 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600 fill-rose-100" />
              <span>Crisis Support</span>
            </button>

            {/* Logout / Auth */}
            {user ? (
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to="/auth"
                className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
