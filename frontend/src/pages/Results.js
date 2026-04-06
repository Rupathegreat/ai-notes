import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import mermaid from 'mermaid';
import { ArrowLeft, BookOpen, Lightbulb, FileText, HelpCircle, BrainCircuit, GitBranch, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

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
  const [quizAnswers, setQuizAnswers] = useState({}); // Track user's answers

  useEffect(() => {
    loadData();
  }, [lectureId]);

  useEffect(() => {
    if (notes?.flowchart && activeTab === 'flowchart') {
      const renderFlowchart = async () => {
        try {
          // Simple and stable mermaid rendering
          const element = document.getElementById('flowchart-container');
          if (element && notes.flowchart) {
            // Clear previous content
            element.innerHTML = notes.flowchart;
            
            // Initialize mermaid
            mermaid.initialize({
              startOnLoad: false,
              theme: 'default',
              securityLevel: 'loose'
            });
            
            // Render
            await mermaid.init(undefined, element);
          }
        } catch (error) {
          console.error('Flowchart error:', error);
          // Show fallback
          const element = document.getElementById('flowchart-container');
          if (element) {
            element.innerHTML = '<p class="text-gray-600 dark:text-gray-400">Flowchart generation in progress...</p>';
          }
        }
      };
      
      renderFlowchart();
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
      // Initialize quiz answers state
      if (notesRes.data?.quiz) {
        const initialAnswers = {};
        notesRes.data.quiz.forEach((_, index) => {
          initialAnswers[index] = null;
        });
        setQuizAnswers(initialAnswers);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (questionIndex, optionIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.text(notes.title || 'Lecture Notes', margin, yPosition);
    yPosition += 15;

    // Summary
    doc.setFontSize(16);
    doc.text('Summary', margin, yPosition);
    yPosition += 8;
    doc.setFontSize(11);
    const summaryLines = doc.splitTextToSize(notes.summary || '', pageWidth - 2 * margin);
    doc.text(summaryLines, margin, yPosition);
    yPosition += summaryLines.length * 5 + 10;

    // Important Points
    if (notes.important_points && notes.important_points.length > 0) {
      doc.setFontSize(14);
      doc.text('Important Points', margin, yPosition);
      yPosition += 8;
      doc.setFontSize(11);
      notes.important_points.forEach((point, idx) => {
        const pointText = `${idx + 1}. ${point}`;
        const pointLines = doc.splitTextToSize(pointText, pageWidth - 2 * margin);
        if (yPosition + pointLines.length * 5 > 280) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(pointLines, margin, yPosition);
        yPosition += pointLines.length * 5 + 3;
      });
      yPosition += 5;
    }

    // Key Concepts
    if (notes.key_concepts && notes.key_concepts.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(14);
      doc.text('Key Concepts', margin, yPosition);
      yPosition += 8;
      doc.setFontSize(11);
      notes.key_concepts.forEach((concept, idx) => {
        const conceptText = `• ${concept}`;
        const conceptLines = doc.splitTextToSize(conceptText, pageWidth - 2 * margin);
        if (yPosition + conceptLines.length * 5 > 280) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(conceptLines, margin, yPosition);
        yPosition += conceptLines.length * 5 + 3;
      });
      yPosition += 5;
    }

    // Definitions
    if (notes.definitions && notes.definitions.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(14);
      doc.text('Definitions', margin, yPosition);
      yPosition += 8;
      doc.setFontSize(11);
      notes.definitions.forEach((def) => {
        const defText = `${def.term}: ${def.definition}`;
        const defLines = doc.splitTextToSize(defText, pageWidth - 2 * margin);
        if (yPosition + defLines.length * 5 > 280) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(defLines, margin, yPosition);
        yPosition += defLines.length * 5 + 5;
      });
    }

    // FAQs
    if (notes.faqs && notes.faqs.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(14);
      doc.text('FAQs', margin, yPosition);
      yPosition += 8;
      doc.setFontSize(11);
      notes.faqs.forEach((faq, idx) => {
        const qText = `Q${idx + 1}: ${faq.question}`;
        const qLines = doc.splitTextToSize(qText, pageWidth - 2 * margin);
        if (yPosition + qLines.length * 5 + 10 > 280) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(qLines, margin, yPosition);
        yPosition += qLines.length * 5 + 3;
        
        const aText = `A: ${faq.answer}`;
        const aLines = doc.splitTextToSize(aText, pageWidth - 2 * margin);
        doc.text(aLines, margin, yPosition);
        yPosition += aLines.length * 5 + 5;
      });
    }

    doc.save(`${notes.title || 'lecture-notes'}.pdf`);
  };

  const exportToDocx = async () => {
    const children = [];

    // Title
    children.push(
      new Paragraph({
        text: notes.title || 'Lecture Notes',
        heading: HeadingLevel.HEADING_1,
      })
    );

    // Summary
    children.push(
      new Paragraph({
        text: 'Summary',
        heading: HeadingLevel.HEADING_2,
      })
    );
    children.push(
      new Paragraph({
        text: notes.summary || '',
      })
    );

    // Important Points
    if (notes.important_points && notes.important_points.length > 0) {
      children.push(
        new Paragraph({
          text: 'Important Points',
          heading: HeadingLevel.HEADING_2,
        })
      );
      notes.important_points.forEach((point) => {
        children.push(
          new Paragraph({
            text: `• ${point}`,
          })
        );
      });
    }

    // Key Concepts
    if (notes.key_concepts && notes.key_concepts.length > 0) {
      children.push(
        new Paragraph({
          text: 'Key Concepts',
          heading: HeadingLevel.HEADING_2,
        })
      );
      notes.key_concepts.forEach((concept) => {
        children.push(
          new Paragraph({
            text: `• ${concept}`,
          })
        );
      });
    }

    // Definitions
    if (notes.definitions && notes.definitions.length > 0) {
      children.push(
        new Paragraph({
          text: 'Definitions',
          heading: HeadingLevel.HEADING_2,
        })
      );
      notes.definitions.forEach((def) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${def.term}: `, bold: true }),
              new TextRun({ text: def.definition }),
            ],
          })
        );
      });
    }

    // FAQs
    if (notes.faqs && notes.faqs.length > 0) {
      children.push(
        new Paragraph({
          text: 'FAQs',
          heading: HeadingLevel.HEADING_2,
        })
      );
      notes.faqs.forEach((faq, idx) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Q${idx + 1}: `, bold: true }),
              new TextRun({ text: faq.question }),
            ],
          })
        );
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'A: ', bold: true }),
              new TextRun({ text: faq.answer }),
            ],
          })
        );
      });
    }

    const doc = new Document({
      sections: [
        {
          children: children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${notes.title || 'lecture-notes'}.docx`);
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
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('dashboard')}
            </button>
            
            {/* Export Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={exportToPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
                title="Export as PDF"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                onClick={exportToDocx}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                title="Export as DOCX"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">DOCX</span>
              </button>
            </div>
          </div>
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
                {notes.quiz.map((q, index) => {
                  const userAnswer = quizAnswers[index];
                  const hasAnswered = userAnswer !== null;
                  const isCorrect = hasAnswered && userAnswer === q.correctAnswerIndex;

                  return (
                    <div key={index} className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-gray-200 dark:border-gray-600">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
                        {index + 1}. {q.question}
                      </h3>
                      <div className="space-y-3">
                        {q.options.map((option, optIndex) => {
                          const isThisCorrect = optIndex === q.correctAnswerIndex;
                          const isSelected = userAnswer === optIndex;
                          
                          let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all ";
                          
                          if (!hasAnswered) {
                            // Not answered yet - clickable
                            buttonClass += "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer";
                          } else {
                            // Has answered - show results
                            if (isThisCorrect) {
                              buttonClass += "bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-400";
                            } else if (isSelected && !isCorrect) {
                              buttonClass += "bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-400";
                            } else {
                              buttonClass += "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-60";
                            }
                          }

                          return (
                            <button
                              key={optIndex}
                              onClick={() => !hasAnswered && handleQuizAnswer(index, optIndex)}
                              disabled={hasAnswered}
                              className={buttonClass}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                </span>
                                {hasAnswered && isThisCorrect && (
                                  <span className="text-green-600 dark:text-green-400 font-bold text-xl">✓</span>
                                )}
                                {hasAnswered && isSelected && !isCorrect && (
                                  <span className="text-red-600 dark:text-red-400 font-bold text-xl">✗</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Show explanation after answering */}
                      {hasAnswered && (
                        <div className={`mt-4 p-4 rounded-lg ${
                          isCorrect 
                            ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700' 
                            : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700'
                        }`}>
                          <div className="flex items-start space-x-2">
                            <span className="text-2xl">
                              {isCorrect ? '🎉' : '📚'}
                            </span>
                            <div>
                              <p className={`font-semibold mb-2 ${
                                isCorrect 
                                  ? 'text-green-800 dark:text-green-300' 
                                  : 'text-red-800 dark:text-red-300'
                              }`}>
                                {isCorrect ? 'Correct!' : 'Incorrect'}
                              </p>
                              <p className="text-gray-700 dark:text-gray-300">
                                <strong>Explanation:</strong> {q.explanation || `The correct answer is ${String.fromCharCode(65 + q.correctAnswerIndex)}. ${q.options[q.correctAnswerIndex]}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Prompt to answer */}
                      {!hasAnswered && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                          <p className="text-sm text-blue-800 dark:text-blue-300">
                            💡 Click on an option to submit your answer
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quiz Summary */}
              {Object.keys(quizAnswers).length > 0 && Object.values(quizAnswers).every(a => a !== null) && (
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 border-blue-300 dark:border-blue-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Quiz Complete! 🎊
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    You got <strong className="text-blue-600 dark:text-blue-400">
                      {Object.entries(quizAnswers).filter(([idx, ans]) => ans === notes.quiz[idx].correctAnswerIndex).length}
                    </strong> out of <strong className="text-purple-600 dark:text-purple-400">{notes.quiz.length}</strong> correct!
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'flowchart' && (
            <div data-testid="flowchart-content">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('flowchart')}</h2>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto">
                <div className="flex justify-center items-center min-h-[400px]">
                  <pre id="flowchart-container" className="mermaid w-full text-center"></pre>
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