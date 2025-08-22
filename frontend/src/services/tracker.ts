// frontend/src/services/tracker.ts

import authService from './authService';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Tracks a page visit.
 * Correctly uses authenticatedFetch.
 */
export const trackPageVisit = async (userId: string, path: string): Promise<void> => {
  try {
    const response = await authService.authenticatedFetch(`${API_BASE}/api/track/page`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, path }),
    });

    if (!response.ok) {
      console.error('Failed to track page visit:', response.statusText);
    }
  } catch (error) {
    console.error('Error in trackPageVisit:', error);
  }
};

/**
 * Tracks a search event.
 * Correctly uses authenticatedFetch.
 */
export const trackSearch = async (userId: string, query: string, filters: any = {}): Promise<void> => {
  try {
    const response = await authService.authenticatedFetch(`${API_BASE}/api/track/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, query, filters }),
    });

    if (!response.ok) {
      console.error('Failed to track search:', response.statusText);
    }
  } catch (error) {
    console.error('Error in trackSearch:', error);
  }
};

/**
 * Tracks a click event.
 * Correctly uses authenticatedFetch.
 */
export const trackClick = async (contentType: string, objectId: number): Promise<void> => {
  try {
    const response = await authService.authenticatedFetch(`${API_BASE}/api/track/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType, objectId }),
    });

    if (!response.ok) {
      console.error('Failed to track click:', response.statusText);
    }
  } catch (error) {
    console.error('Error in trackClick:', error);
  }
};