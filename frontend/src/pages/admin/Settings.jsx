// src/pages/admin/Settings.jsx
// Admin Settings page.
// Features a left-hand navigation tab system (Profile, Notifications, Security, System)
// and mock-saves preferences with a smooth loading state.

import { useState } from 'react';
import { Bell, Lock, Settings as SettingsIcon, User, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const TABS = [
  { id: 'profile', label: 'Admin Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'system', label: 'System Preferences', icon: SettingsIcon },
];

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Mock form state
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Example state for toggles (Notifications)
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [dailyDigest, setDailyDigest] = useState(true);

  async function handleSave(e) {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    
    // Simulate API save delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsSaving(false);
    setSaveMessage('Settings saved successfully.');
    
    // Clear success message after 3 seconds
    setTimeout(() => setSaveMessage(''), 3000);
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
                onClick={() => {
                  setActiveTab(tab.id);
                  setSaveMessage(''); // clear messages on tab switch
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
                      defaultValue={user?.name || 'Campus Admin'}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0a1422] focus:outline-none focus:ring-1 focus:ring-[#0a1422]"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      defaultValue={user?.email || 'admin@smartcampus.edu'}
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
                      defaultValue="Super Administrator"
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
                  
                  <hr className="border-gray-200" />
                  
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">SMS Notifications</h3>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="flex h-5 items-center">
                        <input
                          type="checkbox"
                          checked={smsAlerts}
                          onChange={(e) => setSmsAlerts(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-[#0a1422] focus:ring-[#0a1422]"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">Critical Incident SMS</span>
                        <span className="text-xs text-gray-500">Get a text message for urgent campus safety or infrastructure failures.</span>
                      </div>
                    </label>
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
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0a1422] focus:outline-none focus:ring-1 focus:ring-[#0a1422]"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0a1422] focus:outline-none focus:ring-1 focus:ring-[#0a1422]"
                    />
                    <p className="mt-1.5 text-xs text-gray-500">Must be at least 12 characters and include a number and symbol.</p>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
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
                      defaultValue="Asia/Kolkata"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0a1422] focus:outline-none focus:ring-1 focus:ring-[#0a1422]"
                    >
                      <option value="America/New_York">Eastern Time (US & Canada)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Asia/Kolkata">India Standard Time (IST)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="retention" className="block text-sm font-medium text-gray-700 mb-1.5">Data Retention Policy</label>
                    <select
                      id="retention"
                      defaultValue="3"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0a1422] focus:outline-none focus:ring-1 focus:ring-[#0a1422]"
                    >
                      <option value="1">1 Year</option>
                      <option value="3">3 Years</option>
                      <option value="5">5 Years</option>
                      <option value="never">Keep Forever</option>
                    </select>
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
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center min-w-[140px] rounded-lg bg-[#0a1422] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0a1422] focus:ring-offset-2 disabled:opacity-50 disabled:bg-gray-400 transition-colors"
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
