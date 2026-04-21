import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, ChevronRight } from 'lucide-react';
import { NAV, ROLE_CONFIG } from '../../constants/nav';
import useAppStore from '../../store/useAppStore';

const ROLES = ['student', 'teacher', 'buddy', 'parent'];

const Sidebar = ({ onSettings }) => {
  const { role, setRole } = useAppStore();
  const navigate = useNavigate();
  const nav = NAV[role] || [];
  const rc = ROLE_CONFIG[role];

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    navigate(NAV[newRole][0].path);
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
            <p className="text-sm font-bold text-white font-display leading-tight">Smart Study</p>
            <p className="text-[10px] text-accent font-semibold tracking-widest uppercase">Assistant+</p>
          </div>
        </div>
      </div>

      {/* Role switcher */}
      <div className="px-4 py-4 border-b border-border">
        <p className="label px-2 mb-2">Role</p>
        <div className="grid grid-cols-2 gap-1.5">
          {ROLES.map((r) => {
            const cfg = ROLE_CONFIG[r];
            return (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  role === r
                    ? `bg-accent/10 text-accent ring-1 ring-accent/30`
                    : 'text-gray-400 hover:text-white hover:bg-surface2'
                }`}
              >
                <span>{cfg.emoji}</span> {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-gray-400 hover:text-white hover:bg-surface2'
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

      {/* Settings button */}
      <div className="px-4 py-4 border-t border-border">
        <button
          onClick={onSettings}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-surface2 text-sm font-medium transition-all"
        >
          <Settings size={16} />
          Settings
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
