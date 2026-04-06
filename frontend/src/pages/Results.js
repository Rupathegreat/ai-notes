import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import mermaid from 'mermaid';
import { ArrowLeft, BookOpen, Lightbulb, FileText, HelpCircle, BrainCircuit, GitBranch } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Results = () => {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [notes, setNotes] = useState(null);
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    loadData();
  }, [lectureId]);

  useEffect(() => {
    if (notes?.flowchart && activeTab === 'flowchart') {
      // Initialize mermaid with better config for flowcharts
      mermaid.initialize({ 
        startOnLoad: false, 
        theme: 'base',
        themeVariables: {
          primaryColor: '#3b82f6',
          primaryTextColor: '#1f2937',
          primaryBorderColor: '#2563eb',
          lineColor: '#6b7280',
          secondaryColor: '#8b5cf6',
          tertiaryColor: '#ec4899'
        },
        securityLevel: 'loose',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis',
          padding: 20
        }
      });
      
      // Render the flowchart with a small delay to ensure DOM is ready
      setTimeout(() => {
        try {
          const flowchartElement = document.querySelector('.mermaid');
          if (flowchartElement) {
            flowchartElement.removeAttribute('data-processed');
            flowchartElement.innerHTML = notes.flowchart;
            mermaid.run({
              querySelector: '.mermaid'
            });
          }
        } catch (error) {
          console.error('Flowchart rendering error:', error);
        }
      }, 100);
    }
  }, [notes, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notesRes, lectureRes] = await Promise.all([
        axios.get(`${API}/notes/${lectureId}`, { withCredentials: true }),
        axios.get(`${API}/lectures/${lectureId}`, { withCredentials: true })
      ]);
      setNotes(notesRes.data);
      setLecture(lectureRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!notes) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">Notes not found</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-600 hover:underline">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'summary', label: t('summary'), icon: BookOpen },
    { id: 'concepts', label: t('keyConcepts'), icon: Lightbulb },
    { id: 'definitions', label: t('definitions'), icon: FileText },
    { id: 'faq', label: t('faq'), icon: HelpCircle },
    { id: 'quiz', label: t('quiz'), icon: BrainCircuit },
    { id: 'flowchart', label: t('flowchart'), icon: GitBranch }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('dashboard')}
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {notes.title}
          </h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
          {activeTab === 'summary' && (
            <div data-testid="summary-content">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('summary')}</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {notes.summary}
              </p>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('importantPoints')}</h3>
                <ul className="space-y-2">
                  {notes.important_points.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'concepts' && (
            <div data-testid="concepts-content">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('keyConcepts')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.key_concepts.map((concept, index) => (
                  <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-gray-900 dark:text-white font-medium">{concept}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'definitions' && (
            <div data-testid="definitions-content">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('definitions')}</h2>
              <div className="space-y-4">
                {notes.definitions.map((def, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">{def.term}</h3>
                    <p className="text-gray-700 dark:text-gray-300">{def.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div data-testid="faq-content">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('faq')}</h2>
              <div className="space-y-4">
                {notes.faq.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Q: {item.question}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      A: {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'quiz' && (
            <div data-testid="quiz-content">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('quiz')}</h2>
              <div className="space-y-6">
                {notes.quiz.map((q, index) => (
                  <div key={index} className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      {index + 1}. {q.question}
                    </h3>
                    <div className="space-y-2">
                      {q.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg border ${
                            optIndex === q.correctAnswerIndex
                              ? 'bg-green-100 dark:bg-green-900/30 border-green-500'
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span> {option}
                          {optIndex === q.correctAnswerIndex && (
                            <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">✓ Correct</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'flowchart' && (
            <div data-testid="flowchart-content">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('flowchart')}</h2>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto">
                <div className="flex justify-center items-center min-h-[400px]">
                  <div 
                    className="mermaid w-full" 
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      fontSize: '16px'
                    }}
                  >
                    {notes.flowchart}
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  💡 <strong>Tip:</strong> This flowchart visualizes the main process or flow of concepts from the lecture. Follow the arrows to understand the sequence!
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Results;