import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useDropzone } from 'react-dropzone';
import Chatbot from '../components/Chatbot';
import axios from 'axios';
import { Upload, FileText, Clock, CheckCircle, XCircle, Settings as SettingsIcon, Brain } from 'lucide-react';

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

  useEffect(() => {
    loadLectures();
    const interval = setInterval(loadLectures, 5000); // Refresh every 5s
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
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${chatbotOpen ? 'pl-80' : ''} transition-all duration-300`}>
      {/* Chatbot Sidebar */}
      <Chatbot 
        lectureId={selectedLectureId} 
        isOpen={chatbotOpen}
        onToggle={() => setChatbotOpen(!chatbotOpen)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
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
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
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
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12">
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
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                No lectures yet. Upload your first lecture above!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lectures.map((lecture) => (
                <div
                  key={lecture.lecture_id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
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
  );
};

export default Dashboard;
