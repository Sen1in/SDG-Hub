// frontend/src/services/analyticsService.ts

import authService from './authService';
import { ApiResponse } from '../types/user';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface ActiveUserStats {
  total_users: number;
  today_active_users: number;
  this_month_active_users: number;
}

// Define an interface for the chart data
export interface TrendData {
  date: string;
  count: number;
}

// Define an interface for word cloud data
export interface WordCloudData {
  text: string;
  value: number;
}

// Define an interface for the page active time data
export interface PageActiveTimeData {
  page_name: string;
  page_type: string;
  is_parent: boolean;
  active_time: number; 
  visit_count: number; 
  children?: PageActiveTimeData[]; 
  path?: string; 
  parent_key?: string; 
}

class AnalyticsService {
  async getActiveUserStats(): Promise<ApiResponse<ActiveUserStats>> {
    try {
      const response = await authService.authenticatedFetch(`${API_BASE}/api/analytics/stats/active-users/`);
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json();
        return { success: false, errors: errorData };
      }
    } catch (error) {
      console.error('Get active user stats error:', error);
      return { success: false, errors: { general: 'Network error' } };
    }
  }

  // ===================================================================
  //  The newly added function is used to obtain chart data.
  // ===================================================================
  async getActiveTrendChartData(): Promise<ApiResponse<TrendData[]>> {
    try {
      // Use the same authenticatedFetch method to send the authentication request
      const response = await authService.authenticatedFetch(`${API_BASE}/api/analytics/active-trend-chart/`);

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json();
        // Package the error details into a uniform format
        return { success: false, errors: { detail: errorData.detail || 'Failed to fetch chart data' } };
      }
    } catch (error) {
      console.error('Get active trend chart data error:', error);
      return { success: false, errors: { general: 'Network error' } };
    }
  }

  // ===================================================================
  //  Obtain the word cloud data
  // ===================================================================
  async getWordCloudData(): Promise<ApiResponse<WordCloudData[]>> {
    try {
      const response = await authService.authenticatedFetch(`${API_BASE}/api/analytics/word-cloud/search-terms/`);

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json();
        return { success: false, errors: { detail: errorData.detail || 'Failed to fetch word cloud data' } };
      }
    } catch (error) {
      console.error('Get word cloud data error:', error);
      return { success: false, errors: { general: 'Network error' } };
    }
  }

  // ===================================================================
  //  Obtain data on the page's active time
  // ===================================================================
  async getPageActiveTimeData(): Promise<ApiResponse<PageActiveTimeData[]>> {
    try {
      const response = await authService.authenticatedFetch(`${API_BASE}/api/analytics/page-active-time`);

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json();
        return { success: false, errors: { detail: errorData.detail || 'Failed to fetch page active time data' } };
      }
    } catch (error) {
      console.error('AnalyticsService: Get page active time data error:', error);
      return { success: false, errors: { general: 'Network error' } };
    }
  }
}

export default new AnalyticsService();