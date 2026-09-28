import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RailTrack | Live Train Running Status & Interactive GPS Tracking',
  description: 'Real-time Indian Railways live train tracking, live station boards, PNR status check, and seat availability radar.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
