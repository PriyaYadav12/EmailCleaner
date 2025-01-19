import './globals.css';
import Link from 'next/link';
import ClientWrapper from './ClientWrapper'; // Adjust the path as necessary


export const metadata = {
  title: 'Digital Declutterer',
  description: 'Manage your emails with ease',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 h-screen flex flex-col">
        <header className="p-4 bg-blue-500">
          <nav className="flex space-x-4 w-full max-w-3xl ml-auto">
              <h1 className="text-2xl text-white font-bold">Digital Declutterer</h1>
          </nav>
        </header>
        <main className="p-4 h-full overflow-auto"><ClientWrapper>{children}</ClientWrapper></main>
        <footer className="p-4 bg-blue-500 text-white text-center">
          <p>© 2025 Digital Declutterer. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
