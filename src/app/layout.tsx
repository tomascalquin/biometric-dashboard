import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'BiometricOS · UAI',
  description: 'Plataforma institucional de monitoreo de bienestar estudiantil',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-[#f8fafd] text-[#0a1628] antialiased`}>
        {children}
      </body>
    </html>
  );
}