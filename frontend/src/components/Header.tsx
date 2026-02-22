import React from 'react';
import { LogOut, User, Sun, Moon, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarCollapsed: boolean;
  user: {
    first_name: string;
    last_name: string;
  } | null;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isSidebarCollapsed, user }) => {
  const { logoutUser } = useUser();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center space-x-3">
        {/* Sidebar toggle (visible on all screen sizes) */}
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed
            ? <PanelLeftOpen className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            : <PanelLeftClose className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          }
        </button>

        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">SkillBridge</h1>
        <div className="w-2 h-2 bg-green-400 rounded-full" />
        <span className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">AI Learning Assistant</span>
      </div>

      <div className="flex items-center space-x-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Toggle dark mode"
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
            {user ? `${user.first_name} ${user.last_name}` : 'Guest'}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:block text-sm">Logout</span>
        </button>
      </div>
    </header>
  );
};