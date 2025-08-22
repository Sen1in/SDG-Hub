// src/services/tests/tracker.test.ts

import { trackPageVisit, trackSearch, trackClick } from '../tracker';
import authService from '../authService';

// Create mock functionsCreate mock functions
const mockAuthenticatedFetch = jest.fn();

// Replace the authenticatedFetch method of the default exported objectReplace the authenticatedFetch method of the default exported object
jest.mock('../authService', () => ({
  __esModule: true,
  default: {
    authenticatedFetch: jest.fn(),
  },
}));

describe('Tracker Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('trackPageVisit sends correct payload', async () => {
    const mockResponse = { ok: true, statusText: 'OK' };
    (authService.authenticatedFetch as jest.Mock).mockResolvedValue(mockResponse);

    await trackPageVisit('1', '/home');

    expect(authService.authenticatedFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/track/page'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ userId: '1', path: '/home' }),
      })
    );
  });

  it('trackSearch sends correct payload with query only', async () => {
    const mockResponse = { ok: true, statusText: 'OK' };
    (authService.authenticatedFetch as jest.Mock).mockResolvedValue(mockResponse);

    await trackSearch('2', 'climate');

    expect(authService.authenticatedFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/track/search'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ userId: '2', query: 'climate', filters: {} }),
      })
    );
  });

  it('trackSearch sends correct payload with filters', async () => {
    const mockResponse = { ok: true, statusText: 'OK' };
    (authService.authenticatedFetch as jest.Mock).mockResolvedValue(mockResponse);

    const filters = { sdgs: [1, 3] };
    await trackSearch('2', 'education', filters);

    expect(authService.authenticatedFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/track/search'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ userId: '2', query: 'education', filters }),
      })
    );
  });

  it('trackClick sends correct payload', async () => {
    const mockResponse = { ok: true, statusText: 'OK' };
    (authService.authenticatedFetch as jest.Mock).mockResolvedValue(mockResponse);

    await trackClick('education', 42);

    expect(authService.authenticatedFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/track/click'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ contentType: 'education', objectId: 42 }),
      })
    );
  });
});