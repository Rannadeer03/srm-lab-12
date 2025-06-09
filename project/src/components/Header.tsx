import {
  BarChart2,
  Bell,
  BookOpen,
  ChevronDown,
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Settings,
  User,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuthStore();

  const isLoginPage = location.pathname === '/login';
  const isAuthenticated = ['/student-dashboard', '/teacher-dashboard'].includes(
    location.pathname
  );
  const isTeacher = location.pathname === '/teacher-dashboard';

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu || showNotifications || showHelpMenu) {
        const target = event.target as HTMLElement;
        if (
          !target.closest('.profile-menu') &&
          !target.closest('.notifications-menu') &&
          !target.closest('.help-menu')
        ) {
          setShowProfileMenu(false);
          setShowNotifications(false);
          setShowHelpMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu, showNotifications, showHelpMenu]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (isTeacher) {
      return [
        {
          to: '/teacher-dashboard',
          icon: <LayoutDashboard className="h-5 w-5" />,
          text: 'Dashboard',
          active: location.pathname === '/teacher-dashboard',
        },
        {
          to: '/create-test',
          icon: <Plus className="h-5 w-5" />,
          text: 'Create Test',
          active: location.pathname === '/create-test',
        },
        {
          to: '/manage-tests',
          icon: <ClipboardList className="h-5 w-5" />,
          text: 'Manage Tests',
          active: location.pathname === '/manage-tests',
        },
        {
          to: '/results',
          icon: <BarChart2 className="h-5 w-5" />,
          text: 'Results',
          active: location.pathname === '/results',
        },
      ];
    }
    return [
      {
        to: '/student-dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
        text: 'Dashboard',
        active: location.pathname === '/student-dashboard',
      },
      {
        to: '/student-tests',
        icon: <ClipboardList className="h-5 w-5" />,
        text: 'Tests',
        active: location.pathname === '/student-tests',
        onClick: () => {
          navigate('/student-tests');
        },
      },
      {
        to: '/results',
        icon: <BarChart2 className="h-5 w-5" />,
        text: 'Results',
        active: location.pathname === '/results',
      },
    ];
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Brand */}
          <Link
            to={
              isAuthenticated
                ? isTeacher
                  ? '/teacher-dashboard'
                  : '/student-dashboard'
                : '/'
            }
            className="flex items-center space-x-2 hover:opacity-75 transition-opacity"
          >
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">SRM Lab</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {isAuthenticated && (
              <>
                {getNavLinks().map((link) =>
                  link.onClick ? (
                    <button
                      key={link.to + link.text}
                      onClick={link.onClick}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${
                          link.active
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      {link.icon}
                      <span>{link.text}</span>
                    </button>
                  ) : (
                    <Link
                      key={link.to + link.text}
                      to={link.to}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${
                          link.active
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      {link.icon}
                      <span>{link.text}</span>
                    </Link>
                  )
                )}

                {/* Notifications */}
                <div className="relative notifications-menu">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`p-2 rounded-full transition-colors ${
                      showNotifications
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <Bell className="h-5 w-5" />
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-900">
                          Notifications
                        </h3>
                        {notifications.length === 0 ? (
                          <p className="mt-2 text-sm text-gray-500">
                            No new notifications
                          </p>
                        ) : (
                          <div className="mt-2 space-y-2">
                            {/* Add notifications here */}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Menu */}
                <div className="relative profile-menu">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                      showProfileMenu
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        showProfileMenu ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate('/profile');
                            setShowProfileMenu(false);
                          }}
                          className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                          Your Profile
                        </button>
                        <button
                          onClick={() => {
                            navigate('/settings');
                            setShowProfileMenu(false);
                          }}
                          className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                          Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="group flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4 mr-3 text-red-400 group-hover:text-red-500" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Help Menu */}
                <div className="relative help-menu ml-2">
                  <button
                    onClick={() => setShowHelpMenu(!showHelpMenu)}
                    className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                      showHelpMenu
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <HelpCircle className="h-5 w-5" />
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        showHelpMenu ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>

                  {showHelpMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <Link
                          to="/faq"
                          className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <HelpCircle className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                          FAQ
                        </Link>
                        <Link
                          to="/tutorials"
                          className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <BookOpen className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                          Tutorials
                        </Link>
                        <Link
                          to="/support"
                          className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <MessageCircle className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                          Contact Support
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {!isAuthenticated && !isLoginPage && (
              <>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Contact
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Login
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                {getNavLinks().map((link) =>
                  link.onClick ? (
                    <button
                      key={link.to + link.text}
                      onClick={() => {
                        link.onClick?.();
                        setIsMenuOpen(false);
                      }}
                      className={`flex w-full items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                        link.active
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {link.icon}
                      <span>{link.text}</span>
                    </button>
                  ) : (
                    <Link
                      key={link.to + link.text}
                      to={link.to}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                        link.active
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.icon}
                      <span>{link.text}</span>
                    </Link>
                  )
                )}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/about"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
