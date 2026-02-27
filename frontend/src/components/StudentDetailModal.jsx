import React, { useState } from 'react';

const getScoreColor = (score) => {
  if (score >= 80) return { bg: 'bg-emerald-100', text: 'text-emerald-700', bar: 'bg-emerald-500' };
  if (score >= 60) return { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' };
  if (score >= 40) return { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500' };
  return { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' };
};

const TabButton = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
      active
        ? 'bg-brand-purple text-white shadow-md'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {label}
  </button>
);

const StudentDetailModal = ({ student, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  if (!student) return null;

  const analysis = student.analysis || {};
  const structured = student.structuredData || {};
  const score = analysis.atsScore || 0;
  const scoreColor = getScoreColor(score);
  const sectionRatings = analysis.sectionRatings || {};
  const strengths = analysis.strengths || [];
  const improvements = analysis.areasForImprovement || [];
  const feedback = analysis.feedback || {};
  const skills = structured.skills || analysis.skills || [];
  const education = structured.education || [];
  const experience = structured.workExperience || [];
  const certifications = structured.certifications || [];

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'skills', label: 'Skills & Education' },
    { key: 'experience', label: 'Experience' },
    { key: 'feedback', label: 'ATS Feedback' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sidebar-bg to-brand-purple p-8 rounded-t-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="relative flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold text-white backdrop-blur-sm border border-white/20">
              {(student.candidateName || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{student.candidateName || 'Unknown'}</h2>
              <p className="text-white/70 text-sm mt-1">{student.candidateEmail || 'N/A'}</p>
              {structured.phone && <p className="text-white/50 text-xs mt-0.5">{structured.phone} {structured.location ? `• ${structured.location}` : ''}</p>}
            </div>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20">
              <span className="text-white/80 text-sm font-medium">ATS Score</span>
              <span className="text-3xl font-bold text-white">{score}%</span>
            </div>
            <div className="flex-1 bg-white/10 rounded-full h-3 backdrop-blur-sm">
              <div className={`h-full rounded-full ${scoreColor.bar} transition-all duration-700`} style={{ width: `${score}%` }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 pt-6 pb-2 flex gap-2 border-b border-gray-100 overflow-x-auto">
          {tabs.map((t) => (
            <TabButton key={t.key} active={activeTab === t.key} label={t.label} onClick={() => setActiveTab(t.key)} />
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8 space-y-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              {/* AI Summary */}
              {(structured.aiSummary || analysis.comprehensiveSummary) && (
                <div className="p-4 rounded-xl bg-brand-light/50 border border-brand-purple/10">
                  <h3 className="text-sm font-semibold text-brand-purple mb-2">AI Summary</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{structured.aiSummary || analysis.comprehensiveSummary}</p>
                </div>
              )}

              {/* Section Ratings */}
              {Object.keys(sectionRatings).length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-brand-light flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </span>
                    Section Ratings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(sectionRatings).map(([key, value]) => {
                      const numVal = typeof value === 'number' ? value : parseInt(value) || 0;
                      const rColor = getScoreColor(numVal * 20);
                      return (
                        <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-sm text-gray-700 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${rColor.bar}`} style={{ width: `${Math.min(numVal * 20, 100)}%` }} />
                            </div>
                            <span className={`text-sm font-bold ${rColor.text}`}>{value}/5</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Strengths & Improvements side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {strengths.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </span>
                      Strengths
                    </h3>
                    <div className="space-y-2">
                      {strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </span>
                          <span className="text-xs text-gray-700">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {improvements.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </span>
                      Areas for Improvement
                    </h3>
                    <div className="space-y-2">
                      {improvements.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50/50 border border-amber-100">
                          <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-2.5 h-2.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01" /></svg>
                          </span>
                          <span className="text-xs text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* SKILLS & EDUCATION TAB */}
          {activeTab === 'skills' && (
            <>
              {skills.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 text-xs font-medium bg-brand-light text-brand-purple rounded-full border border-brand-purple/10">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {education.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Education</h3>
                  <div className="space-y-3">
                    {education.map((edu, i) => (
                      <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{edu.degree}{edu.field ? ` — ${edu.field}` : ''}</p>
                            <p className="text-gray-600 text-xs mt-0.5">{edu.institution}</p>
                          </div>
                          <span className="text-xs text-gray-400 font-medium">{edu.year}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {certifications.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Certifications</h3>
                  <div className="space-y-2">
                    {certifications.map((cert, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                        <span className="text-xs text-gray-700">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* EXPERIENCE TAB */}
          {activeTab === 'experience' && (
            <>
              {structured.professionalSummary && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Professional Summary</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{structured.professionalSummary}</p>
                </div>
              )}
              {experience.length > 0 ? (
                <div className="space-y-4">
                  {experience.map((exp, i) => (
                    <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{exp.role}</p>
                          <p className="text-gray-600 text-xs">{exp.company}</p>
                        </div>
                        <span className="text-xs text-gray-400 font-medium bg-gray-200 px-2 py-0.5 rounded">{exp.duration}</span>
                      </div>
                      {exp.description && <p className="text-xs text-gray-600 mt-2 leading-relaxed">{exp.description}</p>}
                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {exp.highlights.map((h, j) => (
                            <li key={j} className="text-xs text-gray-600 flex items-start gap-1.5">
                              <span className="text-brand-purple mt-0.5">•</span>{h}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No work experience data available</p>
              )}
            </>
          )}

          {/* FEEDBACK TAB */}
          {activeTab === 'feedback' && (
            <>
              {Object.entries(feedback).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 capitalize flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      category === 'grammar' ? 'bg-blue-50' : category === 'ats' ? 'bg-brand-light' : category === 'content' ? 'bg-emerald-50' : 'bg-amber-50'
                    }`}>
                      <svg className={`w-3.5 h-3.5 ${
                        category === 'grammar' ? 'text-blue-500' : category === 'ats' ? 'text-brand-purple' : category === 'content' ? 'text-emerald-500' : 'text-amber-500'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </span>
                    {category} Feedback
                  </h3>
                  {Array.isArray(items) && items.length > 0 ? (
                    <div className="space-y-2">
                      {items.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="text-brand-purple mt-0.5 flex-shrink-0">→</span>
                          <span className="text-xs text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">No feedback available</p>
                  )}
                </div>
              ))}
              {Object.keys(feedback).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No ATS feedback data available</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;
