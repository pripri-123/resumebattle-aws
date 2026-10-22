import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

const routeTitles: Record<string, string> = {
  '/app/overview': 'Overview & Readiness Command',
  '/app/resume-arena': 'Resume Arena — Rubric & Evaluation',
  '/app/career-dna': 'Career DNA & Evidence Provenance',
  '/app/career-quest': 'Career Quest — Learning Missions',
  '/app/simulator': 'Application Simulator & Mock Interview',
  '/app/project-proof': 'Project Proof & Portfolio Evidence',
  '/app/version-lab': 'Version Lab & Iteration Comparison',
  '/app/battle-league': 'Battle League — Community Arena',
  '/app/insights': 'Career Insights & Telemetry Analytics',
  '/app/documents': 'Document Management & Secure Storage',
  '/app/settings': 'Settings, Privacy & Account Governance',
};

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentTitle = routeTitles[location.pathname] || 'Career Intelligence Arena';

  return (
    <div className="min-h-screen bg-white-bg text-gray-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={currentTitle} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
