import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const AppContext = createContext();

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
    
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id
            ? { ...notification, ...action.payload.updates }
            : notification
        )
      };
    
    case 'SET_DASHBOARD_STATS':
      return { ...state, dashboardStats: action.payload };
    
    case 'SET_RECENT_TRANSACTIONS':
      return { ...state, recentTransactions: action.payload };
    
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        recentTransactions: state.recentTransactions.map(transaction =>
          transaction.id === action.payload.id
            ? { ...transaction, ...action.payload.updates }
            : transaction
        )
      };
    
    case 'SET_SYSTEM_HEALTH':
      return { ...state, systemHealth: action.payload };
    
    default:
      return state;
  }
};

const initialState = {
  loading: false,
  error: null,
  notifications: [],
  dashboardStats: null,
  recentTransactions: [],
  systemHealth: null
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    } else {
      // Reset state when logged out
      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
      dispatch({ type: 'SET_DASHBOARD_STATS', payload: null });
      dispatch({ type: 'SET_RECENT_TRANSACTIONS', payload: [] });
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [statsResponse, transactionsResponse, notificationsResponse] = await Promise.allSettled([
        api.dashboard.getDashboardStats(),
        api.dashboard.getRecentTransactions(),
        api.notifications.getNotifications('?limit=10')
      ]);

      if (statsResponse.status === 'fulfilled') {
        dispatch({
          type: 'SET_DASHBOARD_STATS',
          payload: statsResponse.value.data
        });
      }

      if (transactionsResponse.status === 'fulfilled') {
        dispatch({
          type: 'SET_RECENT_TRANSACTIONS',
          payload: transactionsResponse.value.data.transactions || []
        });
      }

      if (notificationsResponse.status === 'fulfilled') {
        dispatch({
          type: 'SET_NOTIFICATIONS',
          payload: notificationsResponse.value.data.notifications || []
        });
      }

    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to load initial data'
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const addNotification = (notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const updateNotification = (id, updates) => {
    dispatch({
      type: 'UPDATE_NOTIFICATION',
      payload: { id, updates }
    });
  };

  const updateTransaction = (id, updates) => {
    dispatch({
      type: 'UPDATE_TRANSACTION',
      payload: { id, updates }
    });
  };

  const refreshDashboard = async () => {
    try {
      const [statsResponse, transactionsResponse] = await Promise.all([
        api.dashboard.getDashboardStats(),
        api.dashboard.getRecentTransactions()
      ]);

      dispatch({
        type: 'SET_DASHBOARD_STATS',
        payload: statsResponse.data
      });

      dispatch({
        type: 'SET_RECENT_TRANSACTIONS',
        payload: transactionsResponse.data.transactions || []
      });

    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to refresh dashboard'
      });
    }
  };

  const loadSystemHealth = async () => {
    try {
      const response = await api.health.getDetailedHealth();
      dispatch({
        type: 'SET_SYSTEM_HEALTH',
        payload: response.data
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to load system health'
      });
    }
  };

  const value = {
    ...state,
    setLoading,
    setError,
    clearError,
    addNotification,
    updateNotification,
    updateTransaction,
    refreshDashboard,
    loadSystemHealth,
    loadInitialData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;