import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import MatrixRain from '@/components/MatrixRain';
import Sidebar from '@/components/Sidebar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NexusCode — Neural Agent Control Center',
  description: 'Multi-Agent Software Development System with AI-powered orchestration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={`${inter.className} bg-nexus-bg text-nexus-text min-h-screen overflow-hidden`}>
        <MatrixRain />
        <div className="relative z-10 flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto scrollbar-thin">
            <header className="sticky top-0 z-20 border-b border-nexus-border/50 px-8 py-4" style={{
              background: 'rgba(6, 8, 15, 0.7)',
              backdropFilter: 'blur(20px) saturate(180%)',
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    <span className="neon-text">NexusCode</span>
                    <span className="text-nexus-muted font-normal ml-2">Control Center</span>
                  </h2>
                  <p className="text-xs text-nexus-dim mt-0.5 font-mono">NEURAL AGENT ORCHESTRATION v2.0</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{
                    background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.08), rgba(0, 229, 255, 0.08))',
                    border: '1px solid rgba(0, 255, 136, 0.2)',
                  }}>
                    <span className="status-active-neon"></span>
                    <span className="text-xs font-medium text-nexus-green">11 AGENTS ONLINE</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-full font-mono text-xs" style={{
                    background: 'rgba(0, 229, 255, 0.05)',
                    border: '1px solid rgba(0, 229, 255, 0.1)',
                    color: 'rgba(0, 229, 255, 0.7)',
                  }}>
                    UPTIME 99.95%
                  </div>
                  <div className="w-px h-6 bg-nexus-border/50"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{
                      background: 'linear-gradient(135deg, #0066ff, #00e5ff)',
                    }}>
                      N
                    </div>
                  </div>
                </div>
              </div>
            </header>
            <div className="p-8 relative">
              <div className="cyber-grid absolute inset-0 pointer-events-none"></div>
              <div className="relative z-10">
                {children}
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
