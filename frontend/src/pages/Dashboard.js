import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useDropzone } from 'react-dropzone';
import Chatbot from '../components/Chatbot';
import axios from 'axios';
import { Upload, FileText, Clock, CheckCircle, XCircle, Settings as SettingsIcon, Brain, TrendingUp, Award, BarChart3 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [selectedLectureId, setSelectedLectureId] = useState(null);
  const [uploadTab, setUploadTab] = useState('file'); // 'file' or 'link'
  const [urlInput, setUrlInput] = useState('');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadLectures();
    loadAnalytics();
    const interval = setInterval(() => {
      loadLectures();
      loadAnalytics();
    }, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const loadLectures = async () => {
    try {
      const response = await axios.get(`${API}/lectures`, {
        withCredentials: true
      });
      setLectures(response.data);
    } catch (error) {
      console.error('Failed to load lectures:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/lectures/analytics/stats`, {
        withCredentials: true
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      await axios.post(`${API}/lectures/upload`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      await loadLectures();
      alert('Lecture uploaded successfully! Processing started.');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload lecture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'audio/*': ['.mp3', '.wav', '.m4a'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleViewNotes = (lectureId) => {
    navigate(`/results/${lectureId}`);
  };

  const handleChatWithLecture = (lectureId) => {
    setSelectedLectureId(lectureId);
    setChatbotOpen(true);
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) return;

    setUploading(true);

    try {
      await axios.post(
        `${API}/lectures/upload-url`,
        { url: urlInput },
        { withCredentials: true }
      );

      setUrlInput('');
      await loadLectures();
      alert('Link submitted successfully! Processing started.');
    } catch (error) {
      console.error('URL upload failed:', error);
      alert('Failed to process link. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`min-h-screen relative ${chatbotOpen ? 'pl-80' : ''} transition-all duration-300`}>
      {/* Clean Modern Gradient Background - No Photos */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
        {/* Subtle Animated Gradient Orbs */}
        <div 
          className="absolute top-0 left-0 w-96 h-96 bg-blue-300/20 dark:bg-blue-600/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob"
        />
        <div 
          className="absolute top-0 right-0 w-96 h-96 bg-purple-300/20 dark:bg-purple-600/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000"
        />
        <div 
          className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300/20 dark:bg-pink-600/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-4000"
        />
        
        {/* Subtle Dot Pattern for Texture */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>
      
      {/* Content Layer */}
      <div className="relative z-10">
        {/* Chatbot Sidebar */}
        <Chatbot 
          lectureId={selectedLectureId} 
          isOpen={chatbotOpen}
          onToggle={() => setChatbotOpen(!chatbotOpen)}
        />

      {/* Header */}
      <header className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('dashboard')}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome, {user?.name}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center space-x-2 px-4 py-2 bg-white/70 dark:bg-gray-700/70 backdrop-blur-md rounded-xl hover:bg-white/90 dark:hover:bg-gray-600/90 transition-all shadow-lg border border-white/40 hover:shadow-xl hover:scale-105"
              data-testid="settings-btn"
            >
              <SettingsIcon className="w-5 h-5" />
              <span>{t('settings')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Section */}
        {analytics && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
              Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Total Lectures */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{analytics.total_lectures}</span>
                </div>
                <p className="text-blue-100 font-medium">Total Lectures</p>
              </div>

              {/* Completed */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{analytics.completed}</span>
                </div>
                <p className="text-green-100 font-medium">Completed</p>
              </div>

              {/* Processing */}
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{analytics.processing}</span>
                </div>
                <p className="text-yellow-100 font-medium">Processing</p>
              </div>

              {/* Success Rate */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">
                    {analytics.total_lectures > 0 
                      ? Math.round((analytics.completed / analytics.total_lectures) * 100) 
                      : 0}%
                  </span>
                </div>
                <p className="text-purple-100 font-medium">Success Rate</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('uploadLecture')}
          </h2>

          {/* Tabs */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setUploadTab('file')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                uploadTab === 'file'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              data-testid="file-upload-tab"
            >
              📁 Upload File
            </button>
            <button
              onClick={() => setUploadTab('link')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                uploadTab === 'link'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              data-testid="link-upload-tab"
            >
              🔗 Paste Link
            </button>
          </div>

          {/* File Upload */}
          {uploadTab === 'file' && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all backdrop-blur-md bg-white/40 dark:bg-gray-800/40 shadow-xl ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/30 scale-105 shadow-blue-500/30'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-2xl hover:bg-white/60 dark:hover:bg-gray-800/60'
              } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              data-testid="upload-dropzone"
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                {uploading ? 'Uploading...' : t('dragDropFiles')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('supportedFormats')}
              </p>
            </div>
          )}

          {/* Link Upload */}
          {uploadTab === 'link' && (
            <div className="border-2 border-dashed border-teal-500/50 dark:border-teal-600/60 rounded-2xl p-12 backdrop-blur-md bg-teal-900/40 dark:bg-teal-950/60 shadow-2xl shadow-emerald-500/20">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🎥</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Paste a Link
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    YouTube, Vimeo, or any video/audio link
                  </p>
                </div>

                <div className="flex space-x-3">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:text-white"
                    disabled={uploading}
                    data-testid="url-input"
                  />
                  <button
                    onClick={handleUrlUpload}
                    disabled={!urlInput.trim() || uploading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    data-testid="url-submit-btn"
                  >
                    {uploading ? 'Processing...' : 'Process'}
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-xs text-green-600 dark:text-green-400">
                    ✅ Working: Direct MP4/MP3 URLs, Vimeo, educational sites
                  </div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400">
                    ⚠️ YouTube: May fail due to anti-bot protection. Recommend uploading files directly.
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    💡 Tip: For YouTube, download video first then upload the file for 100% success
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lectures List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('myLectures')}
          </h2>

          {lectures.length === 0 ? (
            <div className="text-center py-12 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
              <FileText className="w-16 h-16 mx-auto mb-4 text-blue-500" />
              <p className="text-gray-600 dark:text-gray-400">
                No lectures yet. Upload your first lecture above!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lectures.map((lecture) => (
                <div
                  key={lecture.lecture_id}
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border border-gray-200/50 dark:border-gray-700/50 hover:scale-105 duration-300 hover:bg-white/70 dark:hover:bg-gray-800/70 hover:border-blue-400/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                    {getStatusIcon(lecture.status)}
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">
                    {lecture.title}
                  </h3>

                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lecture.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : lecture.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {t(lecture.status)}
                    </span>
                  </div>

                  {lecture.status === 'completed' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleViewNotes(lecture.lecture_id)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        data-testid={`view-notes-${lecture.lecture_id}`}
                      >
                        {t('viewNotes')}
                      </button>
                      <button
                        onClick={() => handleChatWithLecture(lecture.lecture_id)}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        data-testid={`chat-${lecture.lecture_id}`}
                      >
                        {t('chatbot')}
                      </button>
                    </div>
                  )}

                  {lecture.status === 'failed' && lecture.error_message && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      {lecture.error_message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  );
};

export default Dashboard;



