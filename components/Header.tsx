import React from 'react';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, onToggleTheme }) => {
  return (
    <header className="sticky top-0 z-50 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="text-primary font-display text-2xl md:text-3xl tracking-wide select-none drop-shadow-sm">
            RozhCoffe
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Admin Link */}
          <button
            onClick={() => {
              // backend URL that is protected with username & password
              window.location.href = 'http://localhost:3000/admin';
            }}
            className="bg-surface-light dark:bg-zinc-800 p-2 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-all flex items-center justify-center"
            title="Admin Panel"
          >
            <span className="material-icons-round text-xl">settings</span>
          </button>

          <div className="hidden sm:block relative group">
            <select className="appearance-none bg-surface-light dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-bold py-2 pl-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-700 dark:text-gray-200 cursor-pointer transition-all uppercase tracking-tighter">
              <option>EN</option>
              <option>TR</option>
              <option>AR</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 group-hover:text-primary transition-colors">
              <span className="material-icons-round text-sm">expand_more</span>
            </div>
          </div>

          <button
            onClick={onToggleTheme}
            className="bg-surface-light dark:bg-zinc-800 p-2 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:scale-105 active:scale-95 transition-all"
            title="Toggle Theme"
          >
            <span className="material-icons-round text-xl dark:hidden">
              dark_mode
            </span>
            <span className="material-icons-round text-xl hidden dark:block">
              light_mode
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
