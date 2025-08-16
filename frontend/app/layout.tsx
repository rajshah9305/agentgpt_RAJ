import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgentGPT - Autonomous AI Agents',
  description: 'Create and deploy autonomous AI agents powered by Cerebras and Sambanova',
  keywords: ['AI', 'autonomous agents', 'cerebras', 'sambanova', 'agentgpt'],
  authors: [{ name: 'AgentGPT Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
          {children}
        </div>
      </body>
    </html>
  );
}
