import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme, avatarColors as allAvatarColors } from '../../context/ThemeContext';
import AccountModal from '../common/AccountModal';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { avatarColors, avatarColor, setAvatarColor, backgroundImage } = useTheme();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const avatarMenuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target)) {
        setIsAvatarMenuOpen(false);
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNavLinks = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { path: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { path: '/admin/users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
          { path: '/admin/classes', label: 'Classes', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
          { path: '/admin/announcements', label: 'Announcements', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
        ];
      case 'teacher':
        return [
          { path: '/teacher', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { path: '/teacher/classes', label: 'My Classes', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
          { path: '/teacher/assignments', label: 'Assignments', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { path: '/teacher/attendance', label: 'Attendance', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
        ];
      case 'student':
        return [
          { path: '/student', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { path: '/student/enrollment', label: 'Enroll in Classes', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
          { path: '/student/assignments', label: 'Assignments', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { path: '/student/grades', label: 'Grades', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
          { path: '/student/schedule', label: 'Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { path: '/student/theme', label: 'Theme', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className={`min-h-screen ${backgroundImage ? 'has-background-image' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      {/* Background Image Layer */}
      {backgroundImage && <div className="app-background" />}

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 sidebar-bg shadow-xl">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-white/20">
            <h1 className="text-xl font-bold logo-text">School MS</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`sidebar-link ${
                  location.pathname === link.path ? 'active' : ''
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                </svg>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200" ref={avatarMenuRef}>
            <div className="relative">
              <button
                onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                className="w-full flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${avatarColors.bg}`}>
                  <span className={`font-medium ${avatarColors.text}`}>
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role}
                  </p>
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isAvatarMenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Avatar Dropdown Menu */}
              {isAvatarMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden z-50">
                  {/* My Account */}
                  <button
                    onClick={() => {
                      setIsAvatarMenuOpen(false);
                      setIsAccountModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm text-gray-700">My Account</span>
                  </button>

                  {/* Change Avatar Color */}
                  <div className="border-t border-gray-100">
                    <button
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        <span className="text-sm text-gray-700">Avatar Color</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full ${avatarColors.bg}`}></div>
                    </button>

                    {/* Color Picker */}
                    {showColorPicker && (
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">Choose a color:</p>
                        <div className="grid grid-cols-6 gap-2">
                          {Object.keys(allAvatarColors).map((colorKey) => {
                            const colors = allAvatarColors[colorKey];
                            const isSelected = avatarColor === colorKey;
                            return (
                              <button
                                key={colorKey}
                                onClick={() => {
                                  setAvatarColor(colorKey);
                                }}
                                className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${colors.bg} ${isSelected ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                                title={colorKey}
                              >
                                {isSelected && (
                                  <svg className={`w-4 h-4 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sign Out */}
                  <button
                    onClick={() => {
                      setIsAvatarMenuOpen(false);
                      setIsSignOutModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left border-t border-gray-100"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm text-red-600">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen main-content-bg">
        <header className="h-16 bg-primary shadow-sm flex items-center px-6">
          <h2 className="text-lg font-semibold text-white">
            {navLinks.find(l => l.path === location.pathname)?.label || 'Dashboard'}
          </h2>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Account Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />

      {/* Sign Out Confirmation Modal */}
      {isSignOutModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setIsSignOutModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-sm border border-white/50 animate-fade-in-up">
              <div className="p-6 text-center">
                {/* Warning Icon */}
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center mb-4 shadow-lg">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Out</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to sign out?</p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsSignOutModalOpen(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setIsSignOutModalOpen(false);
                      logout();
                    }}
                    className="flex-1 btn btn-danger"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardLayout;
