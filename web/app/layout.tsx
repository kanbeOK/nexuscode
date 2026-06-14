import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NexusCode Dashboard',
  description: 'Multi-Agent Software Development System Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-nexus-bg text-nexus-text min-h-screen`}>
        <div className="flex min-h-screen">
          <aside className="w-64 bg-nexus-surface border-r border-nexus-border flex flex-col">
            <div className="p-6 border-b border-nexus-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-nexus-accent to-nexus-green flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">NexusCode</h1>
                  <p className="text-xs text-nexus-muted">Agent Dashboard</p>
                </div>
              </div>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <a
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-nexus-card transition-colors text-nexus-text"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </a>
              <a
                href="/agents"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-nexus-card transition-colors text-nexus-text"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Agents
              </a>
              <a
                href="/workflow"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-nexus-card transition-colors text-nexus-text"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Workflow
              </a>
              <a
                href="/audit"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-nexus-card transition-colors text-nexus-text"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Audit Trail
              </a>
              <a
                href="/memory"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-nexus-card transition-colors text-nexus-text"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Memory Search
              </a>
            </nav>
            <div className="p-4 border-t border-nexus-border">
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-nexus-green animate-pulse"></div>
                <span className="text-sm text-nexus-muted">System Operational</span>
              </div>
            </div>
          </aside>
          <main className="flex-1 overflow-auto">
            <header className="sticky top-0 z-10 bg-nexus-surface/80 backdrop-blur-sm border-b border-nexus-border px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">NexusCode Control Center</h2>
                  <p className="text-sm text-nexus-muted">Multi-Agent Software Development System</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-nexus-card border border-nexus-border">
                    <div className="w-2 h-2 rounded-full bg-nexus-green animate-pulse"></div>
                    <span className="text-xs text-nexus-green font-medium">11 Agents Online</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-nexus-card border border-nexus-border">
                    <span className="text-xs text-nexus-muted">Uptime: 99.95%</span>
                  </div>
                </div>
              </div>
            </header>
            <div className="p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
