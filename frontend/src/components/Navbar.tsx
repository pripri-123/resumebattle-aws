import React, { useState } from 'react';
import { Menu, Bell, Cloud, Zap, Shield, Sparkles, ExternalLink, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';

interface NavbarProps {
  onMenuClick: () => void;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick, title }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Evaluation Completed', text: 'Full Stack Engineer analysis score: 81.4/100', time: '10m ago', unread: true },
    { id: 2, title: 'Battle League Challenger', text: 'NeonGladiator matched your target role', time: '3h ago', unread: false }
  ];

  return (
    <header className="h-16 bg-white-surface/80 backdrop-blur-md border-b border-dark-border sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-400 hover:text-white rounded-lg lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            {title || 'Career Intelligence Arena'}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Target Role indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white-card border border-dark-border text-xs text-gray-300">
          <Zap className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Target:</span>
          <span className="font-semibold text-white">{user?.target_role || 'Full Stack Engineer'}</span>
        </div>


        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white-card transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="p-3.5 border-b border-dark-border flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] text-brand-cyan font-medium">3 Total</span>
              </div>
              <div className="divide-y divide-dark-border/50 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-white-hover/50 transition-colors">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-semibold ${n.unread ? 'text-white' : 'text-gray-300'}`}>{n.title}</span>
                      <span className="text-[10px] text-gray-500">{n.time}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">{n.text}</div>
                  </div>
                ))}
              </div>
              <div className="p-2.5 border-t border-dark-border text-center bg-white-bg/40">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-brand-cyan hover:underline font-medium"
                >
                  Close notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Chip */}
        <NavLink
          to="/app/settings"
          className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-white-card hover:bg-white-hover border border-dark-border transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center text-[10px] font-bold text-white">
            {user?.full_name ? user.full_name.charAt(0) : 'U'}
          </div>
          <span className="text-xs font-medium text-gray-200 hidden sm:inline">{user?.username}</span>
        </NavLink>
      </div>
    </header>
  );
};
