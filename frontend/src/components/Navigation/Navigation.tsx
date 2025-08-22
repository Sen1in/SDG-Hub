import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin } = useAuth(); 

  const navigationItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'SDG Actions', path: '/actions', icon: '🎯' },
    { name: 'SDG Education', path: '/education', icon: '📚' },
    { name: 'Keywords', path: '/keywords', icon: '🔍' },
  ];

  
  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/profile');
    setShowUserMenu(false);
  };

  const handleTeam = () => {
    navigate('/team');
    setShowUserMenu(false);
  };

  const handleLiked = () => {
    navigate('/liked');
    setShowUserMenu(false);
  };

  // Added Analytics processing function
  const handleAnalyze = () => {
    navigate('/analyze');
    setShowUserMenu(false);
  };

  return (
    <>
      <nav className="bg-white shadow-soft border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-sdg-gradient rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <span className="text-white font-bold text-lg">SDG</span>
                </div>
                <div className="hidden md:block">
                  <h1 className="text-xl font-bold text-gray-900">Knowledge System</h1>
                  <p className="text-xs text-gray-500">Sustainable Development Goals</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActivePath(item.path)
                      ? 'bg-sdg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              {/* New Analytics feature - Available only to administrators */}
              {isAdmin && (
                <Link
                  to="/analyze"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActivePath('/analyze')
                      ? 'bg-sdg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-base">📊</span>
                  <span>Analytics</span>
                </Link>
              )}
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated && user ? (
                /* Logged in User Menu */
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full overflow-hidden flex items-center justify-center">
                      {user.userprofile?.avatar || user.userprofile?.profile_picture ? (
                        <img 
                          src={user.userprofile.avatar || user.userprofile.profile_picture} 
                          alt={`${user.username}'s avatar`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span 
                        className="text-white text-sm font-bold w-full h-full flex items-center justify-center"
                        style={{ 
                          display: (user.userprofile?.avatar || user.userprofile?.profile_picture) ? 'none' : 'flex' 
                        }}
                      >
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="max-w-24 truncate">{user.username}</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User drop-down menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        {user.userprofile?.organization && (
                          <p className="text-xs text-gray-500">{user.userprofile.organization}</p>
                        )}
                      </div>
                      
                      <button
                        onClick={handleProfile}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Your Profile</span>
                      </button>
                      
                      {/* Team */}
                      <button
                        onClick={handleTeam}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Team</span>
                      </button>

                      {/* Liked */}
                      <button
                        onClick={handleLiked}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Liked</span>
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Not logged in user button */
                <button
                  onClick={handleSignIn}
                  className="btn-outline text-sm"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              >
                <svg
                  className={`w-6 h-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-45' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Desktop user menu overlay */}
          {showUserMenu && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowUserMenu(false)}
            />
          )}
        </div>
      </nav>

      {/* Restore the original version of the mobile sliding navigation completely */}
      {/* Background mask */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-50 md:hidden ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Slide menu */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top Menu */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-sdg-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SDG</span>
            </div>
            <span className="font-semibold text-gray-900">Menu</span>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Information Area - Displayed when logged in */}
        {isAuthenticated && user && (
          <button
            onClick={() => {
              handleProfile();
              setIsMenuOpen(false);
            }}
            className="w-full p-4 bg-gradient-to-r from-blue-50 to-green-50 border-b border-gray-200 hover:from-blue-100 hover:to-green-100 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full overflow-hidden flex items-center justify-center">
                {user.userprofile?.avatar || user.userprofile?.profile_picture ? (
                  <img 
                    src={user.userprofile.avatar || user.userprofile.profile_picture} 
                    alt={`${user.username}'s avatar`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span 
                  className="text-white font-bold w-full h-full flex items-center justify-center"
                  style={{ 
                    display: (user.userprofile?.avatar || user.userprofile?.profile_picture) ? 'none' : 'flex' 
                  }}
                >
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium text-gray-900 truncate">{user.username}</p>
                <p className="text-sm text-gray-600 truncate">{user.email}</p>
                {user.userprofile?.organization && (
                  <p className="text-xs text-gray-500 truncate">{user.userprofile.organization}</p>
                )}
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        )}

        {/* Navigation menu item */}
        <div className="px-4 py-4 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center space-x-4 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                isActivePath(item.path)
                  ? 'bg-sdg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
          
          {/* Newly added "Analytics" menu item - Only visible to administrators */}
          {isAdmin && (
            <Link
              to="/analyze"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center space-x-4 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                isActivePath('/analyze')
                  ? 'bg-sdg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">📊</span>
              <span>Analytics</span>
            </Link>
          )}
        </div>

        {/* Bottom operation area - Absolute positioning ensures visibility */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4 bg-white">
          {isAuthenticated && user ? (
            /* Logged-in user: Display Sign Out */
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 border border-red-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Log Out</span>
            </button>
          ) : (
            /* Unlogged user: Display "Login" */
            <button 
              onClick={() => {
                handleSignIn();
                setIsMenuOpen(false);
              }}
              className="w-full btn-outline text-base py-3"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Navigation;