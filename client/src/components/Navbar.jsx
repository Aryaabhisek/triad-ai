import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const { dark, toggle }        = useTheme();
  const navigate                = useNavigate();
  const location                = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors duration-200 ${
        location.pathname === to
          ? 'text-primary'
          : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white">
          <span className="text-2xl">🔺</span>
          <span>Triad <span className="text-primary">AI</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {token && (
            <>
              {navLink('/', 'Ask')}
              {navLink('/history', 'History')}
            </>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">

          {/* Theme Toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle theme"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {token ? (
            <div className="flex items-center gap-3">
              {/* User Badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name?.split(' ')[0]}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-300 hover:text-red-500 dark:hover:border-red-700 dark:hover:text-red-400 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"
                className="text-sm font-medium px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link to="/register"
                className="text-sm font-medium px-4 py-2 rounded-xl bg-primary hover:bg-primaryDark text-white transition-colors">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
