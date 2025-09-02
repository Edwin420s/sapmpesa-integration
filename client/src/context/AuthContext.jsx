import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/auth';
import socketService from '../services/socket';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload.error
      };
    
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload.updates }
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: authService.isAuthenticated(),
  user: authService.getUser(),
  token: authService.getToken(),
  loading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Initialize socket connection when authenticated
    if (state.isAuthenticated) {
      socketService.connect();
      
      // Listen for real-time updates
      socketService.on('transaction_updated', (data) => {
        // Handle real-time transaction updates
        console.log('Transaction updated:', data);
      });
      
      socketService.on('notification', (data) => {
        // Handle real-time notifications
        console.log('New notification:', data);
      });
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [state.isAuthenticated]);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: result.user,
            token: authService.getToken()
          }
        });
        return { success: true };
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: { error: result.message }
        });
        return { success: false, error: result.message };
      }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: { error: 'Login failed. Please try again.' }
      });
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: result.user,
            token: authService.getToken()
          }
        });
        return { success: true };
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: { error: result.message }
        });
        return { success: false, error: result.message };
      }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: { error: 'Registration failed. Please try again.' }
      });
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = (updates) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: { updates }
    });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const hasRole = (role) => {
    return state.user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;