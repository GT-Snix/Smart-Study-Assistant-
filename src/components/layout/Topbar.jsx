import React, { useState } from 'react';
import { Settings, Menu, X, Bell } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import { NAV, ROLE_CONFIG } from '../../constants/nav';

const Topbar = ({ onSettings }) => {
  const { role } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const rc = ROLE_CONFIG[role];
  const nav = NAV[role] || [];

  return (
    <>
      <header className="h-14 bg-surface/80 backdrop-blur border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
        {/* Mobile: logo + burger */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-surface2 text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center gap-2 lg:hidden">
            <span className="text-lg">🧠</span>
            <span className="text-sm font-bold text-white font-display">Smart Study+</span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface2 rounded-xl border border-border">
            <span className="text-sm">{rc?.emoji}</span>
            <span className="text-xs font-medium text-gray-300">{rc?.label}</span>
          </div>
          <button
            onClick={onSettings}
            className="p-2 rounded-lg hover:bg-surface2 text-gray-400 hover:text-accent transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <nav className="absolute left-0 top-0 h-full w-64 bg-surface border-r border-border flex flex-col p-4 gap-1">
            <div className="flex items-center gap-2 px-2 py-4 mb-2">
              <span className="text-xl">🧠</span>
              <span className="font-bold font-display text-white">Smart Study Assistant+</span>
            </div>
            {nav.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'bg-accent/10 text-accent' : 'text-gray-400 hover:text-white hover:bg-surface2'
                  }`
                }
              >
                <Icon size={16} /> {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </>
  );
};

export default Topbar;
