import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Swords,
  Dna,
  Target,
  MessageSquareCode,
  FolderGit2,
  GitCompare,
  Trophy,
  BarChart3,
  FileText,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/app/overview', label: 'Overview', icon: LayoutDashboard },
  { path: '/app/resume-arena', label: 'Resume Arena', icon: Swords, badge: 'Arena' },
  { path: '/app/career-dna', label: 'Career DNA', icon: Dna },
  { path: '/app/career-quest', label: 'Career Quest', icon: Target },
  { path: '/app/simulator', label: 'Application Simulator', icon: MessageSquareCode },
  { path: '/app/project-proof', label: 'Project Proof', icon: FolderGit2 },
  { path: '/app/version-lab', label: 'Version Lab', icon: GitCompare },
  { path: '/app/battle-league', label: 'Battle League', icon: Trophy, badge: 'PvP' },
  { path: '/app/insights', label: 'Career Insights', icon: BarChart3 },
  { path: '/app/documents', label: 'Documents', icon: FileText },
  { path: '/app/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white-surface border-r border-white-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo / Brand Header */}
        <div className="h-16 px-5 border-b border-white-border flex items-center justify-between">
          <NavLink to="/app/overview" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
              <Swords className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Resume Battle <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-brand-violet/20 text-brand-violet border border-brand-violet/30">2.0</span>
              </div>
              <div className="text-[11px] text-gray-400 font-medium">Career Intelligence Arena</div>
            </div>
          </NavLink>
        </div>

        {/* Navigation destinations */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            Career Command Center
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-violet/20 to-brand-cyan/10 text-white border border-brand-violet/40 shadow-sm'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-white-card'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-brand-cyan' : 'text-gray-400 group-hover:text-gray-200'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-violet/30 text-violet-300 border border-brand-violet/40">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card / Footer */}
        <div className="p-3 border-t border-white-border bg-white-bg/40">
          <div className="p-2.5 rounded-xl bg-white-card/60 border border-white-border/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {user?.full_name ? user.full_name.charAt(0) : 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-gray-200 truncate">{user?.full_name || user?.username}</div>
                <div className="text-[10px] text-gray-400 truncate">{user?.target_role || 'Candidate'}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-2 px-2 flex items-center justify-between text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Private & Verified
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
