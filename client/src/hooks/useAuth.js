import { useState, useEffect } from 'react';
import { useAuth as useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  return useAuthContext();
};

export const useAuthGuard = (requiredRole = null) => {
  const { isAuthenticated, user, loading } = useAuthContext();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!loading) {
      let access = isAuthenticated;
      
      if (requiredRole && user) {
        access = access && user.role === requiredRole;
      }
      
      setHasAccess(access);
    }
  }, [isAuthenticated, user, loading, requiredRole]);

  return {
    hasAccess,
    isAuthenticated,
    user,
    loading
  };
};

export const usePermission = (permission) => {
  const { user } = useAuthContext();
  
  const hasPermission = () => {
    if (!user) return false;
    
    // Define role-based permissions
    const permissions = {
      admin: [
        'view_dashboard',
        'manage_users',
        'view_transactions',
        'initiate_payments',
        'view_reports',
        'manage_settings',
        'view_system_health'
      ],
      user: [
        'view_dashboard',
        'view_transactions',
        'initiate_payments',
        'view_reports'
      ],
      viewer: [
        'view_dashboard',
        'view_transactions',
        'view_reports'
      ]
    };

    return permissions[user.role]?.includes(permission) || false;
  };

  return {
    hasPermission: hasPermission(),
    user
  };
};