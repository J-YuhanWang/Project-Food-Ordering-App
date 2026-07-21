import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import {AuthProvider} from "@/lib/auth-context";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CampusEats - Admin Console',
  description: 'Admin management dashboard for CampusEats',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
            {children}
            <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
