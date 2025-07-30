
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import AppContent from '@/components/app-content';

// This metadata is still useful for SEO and mobile browser tabs.
export const metadata: Metadata = {
  title: 'RetailLab',
  description: 'AI-powered retail insights and management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppContent>
          {children}
        </AppContent>
        <Toaster />
      </body>
    </html>
  );
}
