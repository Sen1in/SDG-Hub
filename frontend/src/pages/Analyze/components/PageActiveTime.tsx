// frontend/src/pages/Analyze/components/PageActiveTime.tsx

import React, { useState, useEffect } from 'react';
import analyticsService, { PageActiveTimeData } from '../../../services/analyticsService';
import { useAuth } from '../../../contexts/AuthContext';

const PageActiveTime: React.FC = () => {
  const { isAdmin } = useAuth();
  const [data, setData] = useState<PageActiveTimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'active_time' | 'visit_count'>('active_time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!isAdmin) {
          setError('You need admin privileges to view this data.');
          setLoading(false);
          return;
        }
        
        const result = await analyticsService.getPageActiveTimeData();
        
        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError(result.errors?.detail || 'Failed to load page active time data.');
        }
      } catch (e) {
        console.error('PageActiveTime: Exception:', e);
        setError('An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const handleSort = (field: 'active_time' | 'visit_count') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const toggleExpanded = (pageType: string) => {
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(pageType)) {
      newExpanded.delete(pageType);
    } else {
      newExpanded.add(pageType);
    }
    setExpandedPages(newExpanded);
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortOrder === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getPageIcon = (pageType: string) => {
    const iconMap: { [key: string]: string } = {
      home: '🏠',
      actions: '⚡',
      education: '📚',
      keywords: '🔑',
      search: '🔍',
      team: '👥',
      profile: '👤',
      analyze: '📊',
      form: '📝',
      liked: '❤️',
      login: '🔐',
      register: '📝',
      terms: '📄'
    };
    return iconMap[pageType] || '📄';
  };

  const getPageColor = (pageType: string) => {
    const colorMap: { [key: string]: string } = {
      home: 'bg-blue-50 border-blue-200 text-blue-700',
      actions: 'bg-green-50 border-green-200 text-green-700',
      education: 'bg-purple-50 border-purple-200 text-purple-700',
      keywords: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      search: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      team: 'bg-pink-50 border-pink-200 text-pink-700',
      profile: 'bg-gray-50 border-gray-200 text-gray-700',
      analyze: 'bg-red-50 border-red-200 text-red-700',
      form: 'bg-teal-50 border-teal-200 text-teal-700',
      liked: 'bg-rose-50 border-rose-200 text-rose-700'
    };
    return colorMap[pageType] || 'bg-gray-50 border-gray-200 text-gray-700';
  };

  const renderChildRow = (child: PageActiveTimeData, index: number) => (
    <div key={`child-${index}`} className="ml-8 mb-3">
      <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300 hover:bg-gray-100 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">{child.page_name}</span>
            <span className="text-xs text-gray-500">({child.path})</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">{formatTime(child.active_time)}</div>
              <div className="text-xs text-gray-500">Active Time</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">{child.visit_count.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Visits</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-sdg-primary border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading page analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-soft p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Page Analytics Dashboard</h2>
            <p className="text-gray-300">
              Track user engagement across different pages and sub-pages
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Live Data</span>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Pages</p>
                <p className="text-2xl font-bold">{sortedData.length}</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Active Time</p>
                <p className="text-2xl font-bold">{formatTime(sortedData.reduce((sum, item) => sum + item.active_time, 0))}</p>
              </div>
              <div className="text-3xl">⏱️</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Visits</p>
                <p className="text-2xl font-bold">{sortedData.reduce((sum, item) => sum + item.visit_count, 0).toLocaleString()}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Page Performance</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <button
              onClick={() => handleSort('active_time')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                sortBy === 'active_time'
                  ? 'bg-sdg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active Time
              {sortBy === 'active_time' && (
                <svg className="inline-block w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {sortOrder === 'asc' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  )}
                </svg>
              )}
            </button>
            <button
              onClick={() => handleSort('visit_count')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                sortBy === 'visit_count'
                  ? 'bg-sdg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Visit Count
              {sortBy === 'visit_count' && (
                <svg className="inline-block w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {sortOrder === 'asc' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  )}
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Page List */}
      <div className="space-y-4">
        {sortedData.map((item, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            {/* Parent Page */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${getPageColor(item.page_type)}`}>
                    {getPageIcon(item.page_type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-semibold text-gray-900">{item.page_name}</h4>
                      {item.children && item.children.length > 0 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {item.children.length} sub-pages
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 capitalize">{item.page_type} page</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{formatTime(item.active_time)}</div>
                    <div className="text-sm text-gray-500">Active Time</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{item.visit_count.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Visits</div>
                  </div>
                  {item.children && item.children.length > 0 && (
                    <button
                      onClick={() => toggleExpanded(item.page_type)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg 
                        className={`w-5 h-5 text-gray-600 transition-transform ${expandedPages.has(item.page_type) ? 'rotate-90' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Child Pages */}
            {item.children && item.children.length > 0 && expandedPages.has(item.page_type) && (
              <div className="border-t border-gray-100 bg-gray-50 p-4">
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Sub-pages:</h5>
                </div>
                <div className="space-y-2">
                  {item.children.map((child, childIndex) => renderChildRow(child, childIndex))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {sortedData.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500">No page analytics data has been collected yet.</p>
        </div>
      )}
    </div>
  );
};

export default PageActiveTime; 