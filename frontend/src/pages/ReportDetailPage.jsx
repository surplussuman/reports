import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchReportDetail } from '../services/api';
import Loader from '../components/Loader';
import { HiOutlineArrowLeft, HiOutlineClock } from 'react-icons/hi';

const getScoreColor = (score) => {
  if (score >= 80) return { bg: 'bg-emerald-100', text: 'text-emerald-700', bar: 'bg-emerald-500' };
  if (score >= 60) return { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' };
  if (score >= 40) return { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500' };
  return { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' };
};

const ScoreRing = ({ score, label, size = 80 }) => {
  const color = getScoreColor(score);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444'}
            strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${color.text}`}>{score}%</span>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-500 text-center">{label}</span>
    </div>
  );
};

const ReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('scores');

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const res = await fetchReportDetail(id);
      setReport(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
      <h3 className="text-lg font-semibold text-red-800">Error loading report</h3>
      <p className="text-red-600 mt-2 text-sm">{error}</p>
      <button onClick={() => navigate('/reports')} className="mt-4 px-6 py-2.5 rounded-xl bg-brand-purple text-white text-sm font-medium hover:bg-brand-violet transition-colors">Back to Reports</button>
    </div>
  );
  if (!report) return null;

  const interviewData = report.interview_data || [];
  const realQuestions = interviewData.filter((q) => q.isRealQuestion);

  const sections = [
    { key: 'scores', label: 'Score Overview' },
    { key: 'transcript', label: `Interview Q&A (${realQuestions.length})` },
    { key: 'details', label: 'Session Details' },
  ];

  // Calculate average feedback scores from interview data
  const avgFeedbackScores = {};
  const scoreFields = ['confidenceScore', 'ideasScore', 'organizationScore', 'accuracyScore', 'voiceScore', 'grammarScore', 'stopWordsScore', 'bodyLanguageScore', 'physicalAppearanceScore'];
  if (realQuestions.length > 0) {
    scoreFields.forEach((field) => {
      const vals = realQuestions.map((q) => q.feedback?.[field] || 0).filter((v) => v > 0);
      avgFeedbackScores[field] = vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) : 0;
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <button onClick={() => navigate('/reports')} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-purple transition-colors">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back to Leaderboard
      </button>

      {/* Header Card */}
      <div className="bg-gradient-to-r from-sidebar-bg to-brand-purple rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-32 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-center gap-5 flex-1">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold text-white backdrop-blur-sm border border-white/20">
              {(report.name || '?')[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{report.name || 'Unknown'}</h1>
              <p className="text-white/60 text-sm mt-0.5">{report.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs bg-white/10 text-white/80 px-3 py-1 rounded-full">{report.role || 'N/A'}</span>
                <span className={`text-xs px-3 py-1 rounded-full ${report.status === 'shortlisted' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'}`}>
                  {report.status || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-white/60 text-xs mb-1">Overall Score</p>
              <p className="text-4xl font-bold text-white">{report.overall_score || 0}%</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-white/70">
                <HiOutlineClock className="w-4 h-4" />
                <span className="text-sm">{report.duration || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <span className="text-sm">{realQuestions.length} Questions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sections.map((s) => (
          <button key={s.key} onClick={() => setActiveSection(s.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeSection === s.key
                ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/25'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-purple/30 hover:text-brand-purple'
            }`}>{s.label}</button>
        ))}
      </div>

      {/* SCORES SECTION */}
      {activeSection === 'scores' && (
        <div className="space-y-6">
          {/* Main Scores */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-6">Performance Scores</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
              <ScoreRing score={report.overall_score || 0} label="Overall" size={90} />
              <ScoreRing score={report.communication || 0} label="Communication" size={90} />
            </div>
          </div>

          {/* Detailed Feedback Scores */}
          {Object.keys(avgFeedbackScores).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Detailed Assessment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(avgFeedbackScores).map(([key, val]) => {
                  const color = getScoreColor(val);
                  const label = key.replace('Score', '').replace(/([A-Z])/g, ' $1').trim();
                  return (
                    <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <span className="text-sm text-gray-700 font-medium capitalize">{label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${color.bar}`} style={{ width: `${val}%` }} />
                        </div>
                        <span className={`text-xs font-bold ${color.text} w-8 text-right`}>{val}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TRANSCRIPT SECTION */}
      {activeSection === 'transcript' && (
        <div className="space-y-4">
          {realQuestions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <p className="text-gray-500">No interview Q&A data available</p>
            </div>
          ) : (
            realQuestions.map((qa, idx) => {
              const fb = qa.feedback || {};
              return (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Question header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-brand-purple text-white text-xs font-bold flex-shrink-0 mt-0.5">
                          Q{idx + 1}
                        </span>
                        <p className="text-sm font-medium text-gray-900">{qa.question}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs bg-brand-light text-brand-purple px-2 py-1 rounded-md capitalize">{qa.category || qa.templateCategory || 'general'}</span>
                        {fb.overallScore > 0 && (
                          <span className={`text-xs px-2 py-1 rounded-md font-bold ${getScoreColor(fb.overallScore * 10).bg} ${getScoreColor(fb.overallScore * 10).text}`}>
                            {fb.overallScore}/10
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Answer */}
                  <div className="px-6 py-4">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-4">
                      <p className="text-xs font-medium text-blue-600 mb-1">Answer </p>
                      <p className="text-sm text-gray-700 leading-relaxed">{qa.answer || 'No answer provided'}</p>
                    </div>

                    {/* Feedback details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {fb.contentFeedback && (
                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 mb-1">Content</p>
                          <p className="text-xs text-gray-600">{fb.contentFeedback}</p>
                        </div>
                      )}
                      {fb.toneFeedback && (
                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 mb-1">Tone</p>
                          <p className="text-xs text-gray-600">{fb.toneFeedback}</p>
                        </div>
                      )}
                      {fb.clarityFeedback && (
                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 mb-1">Clarity</p>
                          <p className="text-xs text-gray-600">{fb.clarityFeedback}</p>
                        </div>
                      )}
                      {fb.visualFeedback && (
                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 mb-1">Visual / Body Language</p>
                          <p className="text-xs text-gray-600">{fb.visualFeedback}</p>
                        </div>
                      )}
                    </div>

                    {/* Score pills */}
                    {fb.overallScore > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {[
                          { k: 'confidenceScore', l: 'Confidence' }, { k: 'ideasScore', l: 'Ideas' },
                          { k: 'organizationScore', l: 'Organization' }, { k: 'accuracyScore', l: 'Accuracy' },
                          { k: 'voiceScore', l: 'Voice' }, { k: 'grammarScore', l: 'Grammar' },
                        ].map(({ k, l }) => fb[k] > 0 && (
                          <span key={k} className={`text-xs px-2 py-1 rounded-md font-medium ${getScoreColor(fb[k] * 10).bg} ${getScoreColor(fb[k] * 10).text}`}>
                            {l}: {fb[k]}/10
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* DETAILS SECTION */}
      {activeSection === 'details' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Session Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Interview ID', value: report.interview_id },
              { label: 'Candidate ID', value: report.candidate_id },
              { label: 'Exam Type', value: report.exam_name },
              { label: 'Role', value: report.role },
              { label: 'Subcategory', value: report.subcategory_name },
              { label: 'Questions Count', value: realQuestions.length },
              { label: 'Duration', value: report.duration },
              { label: 'Status', value: report.status },
              { label: 'Started At', value: report.started_at ? new Date(report.started_at).toLocaleString() : 'N/A' },
              { label: 'Completed At', value: report.completed_at ? new Date(report.completed_at).toLocaleString() : 'N/A' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.value || 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetailPage;
