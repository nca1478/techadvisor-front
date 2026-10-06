import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TechAdvisor',
  description: 'Tech ecommerce with a RAG-powered shopping advisor.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
