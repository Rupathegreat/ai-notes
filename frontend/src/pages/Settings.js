import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { languageOptions } from '../utils/translations';
import axios from 'axios';
import { ArrowLeft, Globe, Sun, Moon, LogOut, User, Brain } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Settings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const [saving, setSaving] = useState(false);

  const handleLanguageChange = async (lng) => {
    changeLanguage(lng);
    try {
      await axios.put(
        `${API}/user/preferences`,
        { language: lng },
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  const handleThemeChange = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    toggleTheme();
    try {
      await axios.put(
        `${API}/user/preferences`,
        { theme: newTheme },
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('dashboard')}
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('settings')}
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-4 mb-6">
              <User className="w-8 h-8 text-gray-400" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Profile
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your account information
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <p className="mt-1 text-gray-900 dark:text-white">{user?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <p className="mt-1 text-gray-900 dark:text-white">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Language Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-4 mb-6">
              <Globe className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('language')}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose your preferred language
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {languageOptions.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    language === lang.code
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 text-gray-700 dark:text-gray-300'
                  }`}
                  data-testid={`language-${lang.code}`}
                >
                  <span className="font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {theme === 'light' ? (
                  <Sun className="w-8 h-8 text-yellow-500" />
                ) : (
                  <Moon className="w-8 h-8 text-purple-500" />
                )}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('theme')}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current: {theme === 'light' ? t('light') : t('dark')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleThemeChange}
                className="relative inline-flex h-12 w-24 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
                data-testid="theme-toggle"
              >
                <span
                  className={`inline-block h-10 w-10 transform rounded-full bg-white dark:bg-gray-900 shadow-lg transition-transform ${
                    theme === 'dark' ? 'translate-x-12' : 'translate-x-1'
                  }`}
                >
                  {theme === 'light' ? (
                    <Sun className="w-6 h-6 m-2 text-yellow-500" />
                  ) : (
                    <Moon className="w-6 h-6 m-2 text-purple-500" />
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Logout Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <LogOut className="w-8 h-8 text-red-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('logout')}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sign out of your account
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                data-testid="logout-btn"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;