import { API_BASE } from '../pages/Education/utils/constants';
import { EducationResource } from '../pages/Education/types';
import { ActionsResource } from '../pages/Actions/types';

// Obtain the local JWT Token
const getToken = () => localStorage.getItem('accessToken');

// Public: Returns an empty array when there is no token
const checkTokenOrEmpty = (): string | null => {
  const token = getToken();
  if (!token) {
    console.warn('An unlogged-in user called the collection interface, and the default value was returned.');
    return null;
  }
  return token;
};

// Obtain the complete list of collection resources (return EducationResource[])
export const fetchLikedEducationResources = async (): Promise<EducationResource[]> => {
  const token = checkTokenOrEmpty();
  if (!token) return []; // Return an empty array directly without logging in.

  const response = await fetch(`${API_BASE}/api/education/liked/detail/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Unable to obtain the collected educational resources');
  }
  return response.json();
};

// Collect a certain resource (POST)
export const likeEducation = async (educationId: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('Unregistered users are unable to make a collection.');

  const response = await fetch(`${API_BASE}/api/education/like/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ education_id: educationId }),
  });

  if (!response.ok) {
    throw new Error('Collection failed');
  }
};

// Unmark as a favorite for a certain resource (DELETE)
export const unlikeEducation = async (educationId: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('Unregistered users cannot remove their favorites.');

  const response = await fetch(`${API_BASE}/api/education/like/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ education_id: educationId }),
  });

  if (!response.ok) {
    throw new Error('Failed to remove from favorites');
  }
};

// Obtain the list of education IDs that the current user has collected
export const getLikedEducationIds = async (): Promise<number[]> => {
  const token = checkTokenOrEmpty();
  if (!token) return []; // Return an empty array directly without logging in.

  const response = await fetch(`${API_BASE}/api/education/liked/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Unable to obtain the ID of the saved resource');
  }

  const data = await response.json();
  return data.liked_ids;
};

//Get the list of actions for collection (including complete details)
export const fetchLikedActionResources = async (): Promise<ActionsResource[]> => {
  const token = checkTokenOrEmpty();
  if (!token) return []; // Return an empty array directly without logging in.

  const response = await fetch(`${API_BASE}/api/actions/liked/detail/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Unable to obtain the collected action resources');
  }
  return response.json();
};

// save an Action (POST)
export const likeAction = async (actionId: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('Unlogged-in users cannot add to their favorites.');

  const response = await fetch(`${API_BASE}/api/actions/like/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ action_id: actionId }),
  });

  if (!response.ok) {
    throw new Error('Collection Action Failed');
  }
};

// Remove from favorites Action (DELETE)
export const unlikeAction = async (actionId: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('Unlogged-in users cannot delete to their favorites.');

  const response = await fetch(`${API_BASE}/api/actions/like/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ action_id: actionId }),
  });

  if (!response.ok) {
    throw new Error('Canceling the bookmarking action failed ');
  }
};

// Obtain the list of Action IDs that the current user has collected
export const getLikedActionIds = async (): Promise<number[]> => {
  const token = checkTokenOrEmpty();
  if (!token) return []; // Return an empty array directly without logging in.

  const response = await fetch(`${API_BASE}/api/actions/liked/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Unable to obtain the saved Action ID');
  }

  const data = await response.json();
  return data.liked_ids;
};