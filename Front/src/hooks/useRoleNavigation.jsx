import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const useRoleBasedNavigation = () => {
  const { isAuthenticated, getHomeRouteByRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const homeRoute = getHomeRouteByRole();
      navigate(homeRoute);
    }
  }, [isAuthenticated, navigate, getHomeRouteByRole]);
};

export const AutoRedirect = () => {
  useRoleBasedNavigation();
  return null;
};

export default AutoRedirect;
