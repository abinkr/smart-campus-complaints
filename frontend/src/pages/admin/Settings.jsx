// src/pages/admin/Settings.jsx
// Admin Settings page.
// Features a left-hand navigation tab system (Profile, Notifications, Security, System)
// and persists preferences to the backend API.

import { useState, useEffect } from 'react';
import { Bell, Lock, Settings as SettingsIcon, User, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSystemTimezone } from '../../context/TimezoneContext';
import { getAdminSettings, updateAdminProfile, updateAdminNotifications, updateAdminSystem } from '../../api/adminApi';
import axiosInstance from '../../api/axiosInstance';

const TABS = [
  { id: 'profile', label: 'Admin Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'system', label: 'System Preferences', icon: SettingsIcon },
];

export default function Settings() {
  const { logout } = useAuth();
  const { timezone: systemTimezone, setTimezone: setSystemTimezone } = useSystemTimezone();
  const [activeTab, setActiveTab] = useState('profile');
  
  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Profile Form State
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileRole, setProfileRole] = useState('');

  // Notifications Form State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // System Form State
  const [timezone, setTimezone] = useState(systemTimezone);
  const [retention, setRetention] = useState('3');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Load preferences from API
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setIsLoading(true);
        const data = await getAdminSettings();
        if (active) {
          setProfileName(data.profile?.name || '');
          setProfileEmail(data.profile?.email || '');
          setProfileRole(data.profile?.role || '');
          setIsSuperAdmin(!!data.profile?.isSuperAdmin);
          setEmailAlerts(!!data.notifications?.emailInstantAlerts);
          setDailyDigest(!!data.notifications?.emailDailyDigest);
          const nextTimezone = data.system?.defaultTimezone || systemTimezone;
          setTimezone(nextTimezone);
          setSystemTimezone(nextTimezone);
          setRetention(data.system?.dataRetentionPolicy || '3');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        if (active) {
          setErrorMessage('Failed to load settings from server.');
          setIsLoading(false);
        }
      }
    }
    load();
    return () => { active = false; };
  }, [setSystemTimezone, systemTimezone]);

  async function handleSave(e) {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    setErrorMessage('');
    
    try {
      if (activeTab === 'profile') {
        const result = await updateAdminProfile({ name: profileName });
        setProfileName(result.name);
        setSaveMessage('Profile settings updated successfully.');
      } else if (activeTab === 'notifications') {
        await updateAdminNotifications({
          emailInstantAlerts: emailAlerts,
          emailDailyDigest: dailyDigest
        });
        setSaveMessage('Notification preferences updated successfully.');
      } else if (activeTab === 'security') {
        if (!currentPassword || !newPassword) {
          throw new Error('Please fill in both current and new password fields.');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('New passwords do not match.');
        }
        await axiosInstance.patch('/api/auth/password', {
          currentPassword,
          newPassword,
          confirmPassword
        });
        setSaveMessage('Password changed successfully. Redirecting to login...');
        
        // Clear password form fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        setTimeout(() => {
          logout({ skipRequest: true });
        }, 1500);
      } else if (activeTab === 'system') {
        const result = await updateAdminSystem({
          defaultTimezone: timezone,
          dataRetentionPolicy: retention
        });
        const savedTimezone = result.defaultTimezone || timezone;
        setTimezone(savedTimezone);
        setSystemTimezone(savedTimezone);
        setSaveMessage('System preferences updated successfully.');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to save settings.';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="animate-spin text-[#0a1422]" size={36} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0a1422] tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings, notification preferences, and system configurations.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Navigation */}
        <nav className="flex md:flex-col gap-2 overflow-x-auto md:w-64 shrink-0" aria-label="Settings navigation">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSaveMessage('');
                  setErrorMessage('');
                }}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-[#0a1422] ${
                  isActive 
                    ? 'bg-white text-[#0a1422] shadow-sm border border-[#e5e7eb]' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} className={isActive ? 'text-[#0a1422]' : 'text-gray-400'} aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#e5e7eb]">
              <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                {TABS.find(t => t.id === activeTab)?.label}
              </h2>
            </div>

            {/* Body */}
            <div className="p-6 flex-1 overflow-y-auto">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="max-w-xl space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-999 shadow-sm focus:border-[#0a1422] focus:outline-none focus:ring-1 focus:ring-[#0a1422]"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={profileEmail}
                      disabled
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 shadow-sm cursor-not-allowed"
                    />
                    <p className="mt-1.5 text-xs text-gray-500">Contact IT support to change your institutional email.</p>
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1.5">Access Role</label>
                    <input
                      type="text"
                      id="role"
                      value={profileRole}
                      disabled
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 shadow-sm cursor-not-allowed"
                    />
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="max-w-xl space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="flex h-5 items-center">
                          <input
                            type="checkbox"
                            checked={emailAlerts}
                            onChange={(e) => setEmailAlerts(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-[#0a1422] focus:ring-[#0a1422]"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">Instant Alerts</span>
                          <span className="text-xs text-gray-500">Receive an email immediately when a High Priority complaint is filed.</span>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="flex h-5 items-center">
                          <input
                            type="checkbox"
                            checked={dailyDigest}
                            onChange={(e) => setDailyDigest(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-[#0a1422] focus:ring-[#0a1422]"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">Daily Digest</span>
                          <span className="text-xs text-gray-500">Receive a daily summary of all new and resolved complaints.</span>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="max-w-xl space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0a1422] focus:outline-none focus:ring-1 focus:ring-[#0a1422]"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0a1422] focus:outline-none focus:ring-1 focus:ring-[#0a1422]"
                    />
                    <p className="mt-1.5 text-xs text-gray-500">Must be at least 12 characters and include a number and symbol.</p>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0a1422] focus:outline-none focus:ring-1 focus:ring-[#0a1422]"
                    />
                  </div>
                </div>
              )}

              {/* System Preferences Tab */}
              {activeTab === 'system' && (
                <div className="max-w-xl space-y-6">
                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1.5">Default Timezone</label>
                    <select
                      id="timezone"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0a1422] focus:outline-none focus:ring-1 focus:ring-[#0a1422]"
                    >
                      <option value="America/New_York">Eastern Time (US & Canada)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Asia/Kolkata">India Standard Time (IST)</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="retention" className="block text-sm font-medium text-gray-700">Data Retention Policy</label>
                      {!isSuperAdmin && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Lock size={10} /> Super Admin Only
                        </span>
                      )}
                    </div>
                    <select
                      id="retention"
                      value={retention}
                      onChange={(e) => setRetention(e.target.value)}
                      disabled={!isSuperAdmin}
                      className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0a1422] transition-all ${
                        !isSuperAdmin
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed select-none'
                          : 'border-gray-300 bg-white text-gray-900 focus:border-[#0a1422]'
                      }`}
                    >
                      <option value="1">1 Year</option>
                      <option value="3">3 Years</option>
                      <option value="5">5 Years</option>
                      <option value="never">Keep Forever</option>
                    </select>
                    {!isSuperAdmin && (
                      <p className="mt-1.5 text-xs text-gray-500">
                        Data retention changes affect legal and compliance deletion schedules. Contact a Super Administrator to adjust these parameters.
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Footer / Actions */}
            <div className="shrink-0 px-6 py-4 border-t border-[#e5e7eb] bg-gray-50 flex items-center justify-between">
              <div>
                {saveMessage && (
                  <p className="text-sm font-medium text-green-600 animate-in fade-in duration-300">
                    {saveMessage}
                  </p>
                )}
                {errorMessage && (
                  <p className="text-sm font-medium text-red-600 animate-in fade-in duration-300">
                    {errorMessage}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center min-w-[140px] rounded-lg bg-[#0a1422] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0a1422] focus:ring-offset-2 disabled:opacity-50 disabled:bg-gray-400 transition-colors cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" aria-hidden="true" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
