import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Settings, ChevronRight, Copy, LogOut } from 'lucide-react';
import { NAV, ROLE_CONFIG } from '../../constants/nav';
import useAppStore from '../../store/useAppStore';
import toast from 'react-hot-toast';

const Sidebar = ({ onSettings }) => {
  const { currentUser, logout } = useAppStore();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const role = currentUser.role;
  // Students see student + buddy nav
  const nav = role === 'student' ? [...(NAV.student || []), ...(NAV.buddy || [])] : (NAV[role] || []);
  const rc = ROLE_CONFIG[role] || ROLE_CONFIG.student;

  const copyId = () => {
    if (currentUser?.uniqueId) {
      navigator.clipboard.writeText(currentUser.uniqueId);
      toast.success('ID copied to clipboard!');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-surface border-r border-border fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 ring-1 ring-accent/30 flex items-center justify-center text-lg">
            🧠
          </div>
          <div>
            <p className="text-sm font-bold text-white font-display leading-tight">MINXY</p>
            <p className="text-[10px] text-accent font-semibold tracking-widest uppercase">Study Assistant+</p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-accent/10 ring-1 ring-accent/30 flex items-center justify-center text-xs font-bold text-accent">
            {currentUser.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] px-1.5 py-0.5 bg-accent/10 text-accent rounded font-medium capitalize">{role}</span>
              <button onClick={copyId} className="flex items-center gap-0.5 text-[9px] text-gray-500 hover:text-accent transition-colors font-mono">
                {currentUser.uniqueId} <Copy size={7} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {role === 'student' && nav.length > 0 && (
          <>
            <p className="px-3 text-[9px] uppercase tracking-widest text-gray-600 font-semibold mb-2">Study</p>
            {NAV.student.map(({ path, label, icon: Icon }) => (
              <NavLink key={path} to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive ? 'bg-accent/10 text-accent' : 'text-gray-400 hover:text-white hover:bg-surface2'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} className={isActive ? 'text-accent' : 'text-gray-500 group-hover:text-white transition-colors'} />
                    <span className="flex-1">{label}</span>
                    {isActive && <ChevronRight size={13} className="text-accent" />}
                  </>
                )}
              </NavLink>
            ))}

            <p className="px-3 pt-4 text-[9px] uppercase tracking-widest text-gray-600 font-semibold mb-2">Buddy</p>
            {NAV.buddy.map(({ path, label, icon: Icon }) => (
              <NavLink key={path} to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive ? 'bg-teal/10 text-teal' : 'text-gray-400 hover:text-white hover:bg-surface2'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} className={isActive ? 'text-teal' : 'text-gray-500 group-hover:text-white transition-colors'} />
                    <span className="flex-1">{label}</span>
                    {isActive && <ChevronRight size={13} className="text-teal" />}
                  </>
                )}
              </NavLink>
            ))}
          </>
        )}

        {role !== 'student' &&
          nav.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive ? 'bg-accent/10 text-accent' : 'text-gray-400 hover:text-white hover:bg-surface2'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-accent' : 'text-gray-500 group-hover:text-white transition-colors'} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={13} className="text-accent" />}
                </>
              )}
            </NavLink>
          ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-4 py-4 border-t border-border space-y-1">
        <button onClick={onSettings}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-surface2 text-sm font-medium transition-all">
          <Settings size={16} /> Settings
        </button>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-danger hover:bg-danger/5 text-sm font-medium transition-all">
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
