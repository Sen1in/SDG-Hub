import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageVisit } from '../../services/tracker';
import { useAuth } from '../../contexts/AuthContext';

const PageTracker = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      trackPageVisit(user.id.toString(), location.pathname);
    }
  }, [location.pathname]);

  return null;
};

export default PageTracker;