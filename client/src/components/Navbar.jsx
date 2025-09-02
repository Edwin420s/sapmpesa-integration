import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <img src="/assets/images/logo.png" alt="Logo" className="navbar-logo" />
          <span>SAP M-Pesa Integration</span>
        </div>
        
        <div className="navbar-menu">
          <div className="navbar-user">
            <span>Welcome, {user?.name}</span>
            <button onClick={logout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;