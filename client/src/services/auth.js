import { authAPI } from './api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  async login(credentials) {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      
      this.setAuth(token, user);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  }

  async register(userData) {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      
      this.setAuth(token, user);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  }

  async getProfile() {
    try {
      const response = await authAPI.getProfile();
      return { success: true, user: response.data.user };
    } catch (error) {
      this.logout();
      return { success: false, message: 'Failed to get profile' };
    }
  }

  async changePassword(data) {
    try {
      await authAPI.changePassword(data);
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password change failed'
      };
    }
  }

  setAuth(token, user) {
    this.token = token;
    this.user = user;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout() {
    this.token = null;
    this.user = null;
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!this.token;
  }

  hasRole(role) {
    return this.user?.role === role;
  }

  hasAnyRole(roles) {
    return roles.includes(this.user?.role);
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }
}

export default new AuthService();