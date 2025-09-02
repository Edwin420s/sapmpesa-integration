import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile, updateSettings } from '../services/api';
import Loader from '../components/Loader';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileData = await getProfile();
      setProfile(profileData.user);
      // In a real app, you'd fetch settings from an API
      setSettings({
        notifications: true,
        emailAlerts: true,
        smsAlerts: false,
        language: 'en',
        timezone: 'Africa/Nairobi'
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const formData = new FormData(e.target);
      const updates = Object.fromEntries(formData);
      
      await updateProfile(updates);
      setMessage('Profile updated successfully!');
      
      // Refresh profile data
      const profileData = await getProfile();
      setProfile(profileData.user);
    } catch (error) {
      setMessage('Error updating profile');
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const formData = new FormData(e.target);
      const updates = Object.fromEntries(formData);
      
      await updateSettings(updates);
      setMessage('Settings updated successfully!');
      setSettings(prev => ({ ...prev, ...updates }));
    } catch (error) {
      setMessage('Error updating settings');
      console.error('Settings update error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader message="Loading settings..." />;
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-content">
        <div className="settings-tabs">
          <button 
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={activeTab === 'preferences' ? 'active' : ''}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
          <button 
            className={activeTab === 'security' ? 'active' : ''}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>

        <div className="settings-panel">
          {message && (
            <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          {activeTab === 'profile' && profile && (
            <form onSubmit={handleProfileUpdate} className="settings-form">
              <h2>Profile Information</h2>
              
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={profile.name}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={profile.email}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  defaultValue={profile.username}
                  required
                />
              </div>

              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          )}

          {activeTab === 'preferences' && (
            <form onSubmit={handleSettingsUpdate} className="settings-form">
              <h2>Notification Preferences</h2>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="notifications"
                    defaultChecked={settings.notifications}
                  />
                  Enable Notifications
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="emailAlerts"
                    defaultChecked={settings.emailAlerts}
                  />
                  Email Alerts
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="smsAlerts"
                    defaultChecked={settings.smsAlerts}
                  />
                  SMS Alerts
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="language">Language</label>
                <select id="language" name="language" defaultValue={settings.language}>
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="timezone">Timezone</label>
                <select id="timezone" name="timezone" defaultValue={settings.timezone}>
                  <option value="Africa/Nairobi">East Africa Time (EAT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            <form className="settings-form">
              <h2>Security Settings</h2>
              
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  required
                  minLength="8"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Change Password
              </button>

              <div className="security-section">
                <h3>Two-Factor Authentication</h3>
                <p>Add an extra layer of security to your account</p>
                <button type="button" className="btn btn-secondary">
                  Enable 2FA
                </button>
              </div>

              <div className="security-section">
                <h3>Active Sessions</h3>
                <p>Manage your active login sessions</p>
                <button type="button" className="btn btn-secondary">
                  View Sessions
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;