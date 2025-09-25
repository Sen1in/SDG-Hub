// src/components/Navigation/Navigation.tsx

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBadge from './NotificationBadge';
import { useUnreadNotifications } from '../../pages/Notifications/hooks/useUnreadNotifications';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin } = useAuth(); 

  const { unreadCount } = useUnreadNotifications();

  const navigationItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'SDG Actions', path: '/actions', icon: '🎯' },
    { name: 'SDG Education', path: '/education', icon: '📚' },
    { name: 'Keywords', path: '/keywords', icon: '🔑' },
    { name: 'About Us', path: '/about-us', icon: 'ℹ️' },
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

  const handleNotifications = () => {
    navigate('/notifications');
    setShowUserMenu(false);
  };

  const handleLiked = () => {
    navigate('/liked');
    setShowUserMenu(false);
  };

  const handleAnalyze = () => {
    navigate('/analyze');
    setShowUserMenu(false);
  };

  const handleDataManagement = () => {
    navigate('/data-management');
    setShowUserMenu(false);
  };

  return (
    <>
      <nav className="bg-white shadow-soft border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-14 h-14 bg-sdg-gradient rounded-lg flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-200">
                  <img src="/SDG_logo.png" alt="SDG Logo" className="w-12 h-12 object-contain" />
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
              {/* Analytics feature - Available only to administrators */}
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

                      {/* Notifications*/}
                      <NotificationBadge count={unreadCount}>
                        <button
                          onClick={handleNotifications}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          <span>Notifications</span>
                        </button>
                      </NotificationBadge>

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

                      {/* Admin-only Data Management */}
                      {isAdmin && (
                        <button
                          onClick={handleDataManagement}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                          </svg>
                          <span>Data Management</span>
                        </button>
                      )}
                      
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

      {/* Mobile sliding navigation */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-50 md:hidden ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Mobile menu header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-sdg-gradient rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/SDG_logo.png" alt="SDG Logo" className="w-6 h-6 object-contain" />
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

        {/* User Information Area */}
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

        {/* Mobile user actions */}
        {isAuthenticated && user && (
          <div className="px-4 py-2 space-y-2 border-b border-gray-200">
            <NotificationBadge count={unreadCount}>
              <button
                onClick={() => {
                  handleNotifications();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-4 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 w-full"
              >
                <span className="text-xl">🔔</span>
                <span>Notifications</span>
              </button>
            </NotificationBadge>
            
            <button
              onClick={() => {
                handleTeam();
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-4 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 w-full"
            >
              <span className="text-xl">👥</span>
              <span>Team</span>
            </button>
            
            <button
              onClick={() => {
                handleLiked();
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-4 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 w-full"
            >
              <span className="text-xl">❤️</span>
              <span>Liked</span>
            </button>

            {/* Mobile Data Management - Admin only */}
            {isAdmin && (
              <button
                onClick={() => {
                  handleDataManagement();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-4 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 w-full"
              >
                <span className="text-xl">🗄️</span>
                <span>Data Management</span>
              </button>
            )}
          </div>
        )}
        
        {/* Navigation menu items */}
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
          
          {/* Mobile Analytics - Admin only */}
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

        {/* Bottom action area */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4 bg-white">
          {isAuthenticated && user ? (
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