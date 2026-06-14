'use client';

import { usePathname } from 'next/navigation';

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/agents',
    label: 'Agents',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: '/workflow',
    label: 'Workflow',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    href: '/audit',
    label: 'Audit Trail',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    href: '/memory',
    label: 'Memory',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-screen flex flex-col border-r border-nexus-border/50 relative" style={{
      background: 'rgba(12, 16, 32, 0.8)',
      backdropFilter: 'blur(20px) saturate(180%)',
    }}>
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at top left, rgba(0, 229, 255, 0.05), transparent 50%), radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.05), transparent 50%)',
      }}></div>

      <div className="p-5 border-b border-nexus-border/50 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{
              background: 'linear-gradient(135deg, #0066ff, #00e5ff)',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)',
            }}>
              N
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-nexus-green border-2 border-nexus-surface" style={{
              boxShadow: '0 0 6px rgba(0, 255, 136, 0.6)',
            }}></div>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">NexusCode</h1>
            <p className="text-[10px] font-mono text-nexus-dim tracking-widest">AGENT DASHBOARD</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 relative z-10">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative ${
                isActive
                  ? 'text-white'
                  : 'text-nexus-muted hover:text-white'
              }`}
              style={isActive ? {
                background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(168, 85, 247, 0.05))',
                boxShadow: 'inset 0 0 20px rgba(0, 229, 255, 0.05)',
              } : {}}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{
                  background: 'linear-gradient(180deg, #00e5ff, #a855f7)',
                  boxShadow: '0 0 8px rgba(0, 229, 255, 0.5)',
                }}></div>
              )}
              <span className={`transition-colors duration-300 ${isActive ? 'text-nexus-cyan' : 'text-nexus-dim group-hover:text-nexus-cyan'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-nexus-cyan" style={{
                  boxShadow: '0 0 6px rgba(0, 229, 255, 0.8)',
                }}></div>
              )}
            </a>
          );
        })}
      </nav>

      <div className="p-4 border-t border-nexus-border/50 relative z-10">
        <div className="p-3 rounded-xl" style={{
          background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05), rgba(0, 229, 255, 0.05))',
          border: '1px solid rgba(0, 255, 136, 0.1)',
        }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="status-active-neon"></span>
            <span className="text-xs font-medium text-nexus-green">System Operational</span>
          </div>
          <p className="text-[10px] text-nexus-dim font-mono">ALL NODES HEALTHY • 0 ERRORS</p>
        </div>
      </div>
    </aside>
  );
}
