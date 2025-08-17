import React from 'react';
import { Basketball } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mobile-first */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container-mobile py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-basketball-orange rounded-lg">
              <Basketball className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">BIGMATCH</h1>
              <p className="text-xs text-gray-500">Basketball Match App</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pb-20">
        {children}
      </main>
    </div>
  );
};

export default Layout;