import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Todo App - Manage Your Tasks',
  description: 'A modern task management application with user authentication and real-time updates',
  keywords: ['todo', 'task management', 'productivity', 'task list', 'to-do list'],
  authors: [{ name: 'Todo App Team' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Todo App - Manage Your Tasks',
    description: 'A modern task management application with user authentication',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
