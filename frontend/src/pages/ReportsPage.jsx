import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSRMReports, fetchSRMReportStats } from '../services/api';
import Loader from '../components/Loader';
import {
  HiOutlineSearch,
  HiOutlineAdjustments,
  HiOutlineTrendingUp,
  HiOutlineUsers,
  HiOutlineChatAlt2,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineCalendar,
  HiOutlineQuestionMarkCircle,
} from 'react-icons/hi';

const getScoreColor = (score) => {
  if (score >= 80) return { bg: 'bg-emerald-100', text: 'text-emerald-700', bar: 'bg-emerald-500', ring: 'ring-emerald-500' };
  if (score >= 60) return { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500', ring: 'ring-blue-500' };
  if (score >= 40) return { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500', ring: 'ring-amber-500' };
  return { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500', ring: 'ring-red-500' };
};

const getStatusBadge = (status) => {
  if (status === 'shortlisted') return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Shortlisted' };
  if (status === 'completed') return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed' };
  if (status === 'pending') return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' };
  return { bg: 'bg-gray-100', text: 'text-gray-700', label: status || 'Unknown' };
};

const ReportsPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('overall_score');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsRes, statsRes] = await Promise.all([
        fetchSRMReports(),
        fetchSRMReportStats(),
      ]);
      setReports(reportsRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get unique roles
  const roles = useMemo(() => {
    const r = new Set(reports.map((rep) => rep.role).filter(Boolean));
    return Array.from(r).sort();
  }, [reports]);

  // Filter & sort
  const filtered = useMemo(() => {
    let result = [...reports];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) => (r.name || '').toLowerCase().includes(term) || (r.email || '').toLowerCase().includes(term)
      );
    }

    if (minScore > 0) {
      result = result.filter((r) => (r.overall_score || 0) >= minScore);
    }

    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      result = result.filter((r) => r.role === roleFilter);
    }

    // Date filter
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter((r) => r.completed_at && new Date(r.completed_at) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((r) => r.completed_at && new Date(r.completed_at) <= to);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'overall_score') return (b.overall_score || 0) - (a.overall_score || 0);
      if (sortBy === 'communication') return (b.communication || 0) - (a.communication || 0);
      if (sortBy === 'questions') return (b.questions_count || 0) - (a.questions_count || 0);
      if (sortBy === 'date') return new Date(b.completed_at || 0) - new Date(a.completed_at || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'duration') {
        const parseDur = (d) => { if (!d) return 0; const m = d.match(/(\d+)/); return m ? parseInt(m[1]) : 0; };
        return parseDur(b.duration) - parseDur(a.duration);
      }
      return 0;
    });

    return result;
  }, [reports, searchTerm, minScore, statusFilter, roleFilter, sortBy]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, minScore, statusFilter, roleFilter, sortBy, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const statCards = stats ? [
    { label: 'Total Interviews', value: stats.totalInterviews, icon: HiOutlineUsers, color: 'text-violet-500', bg: 'bg-violet-50' },
    { label: 'Avg Overall', value: `${Math.round(stats.avgOverall)}%`, icon: HiOutlineTrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    // { label: 'Avg Communication', value: `${Math.round(stats.avgCommunication)}%`, icon: HiOutlineChatAlt2, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Shortlisted', value: stats.shortlisted, icon: HiOutlineCheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    // { label: 'Avg Questions', value: Math.round(stats.avgQuestionsCount || 0), icon: HiOutlineQuestionMarkCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
  ] : [];

  if (loading) return <Loader />;

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
      <h3 className="text-lg font-semibold text-red-800">Error loading reports</h3>
      <p className="text-red-600 mt-2 text-sm">{error}</p>
      <button onClick={loadData} className="mt-4 px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Retry</button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500">{card.label}</p>
              <div className={`${card.bg} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineAdjustments className="w-5 h-5 text-brand-purple" />
          <h2 className="text-base font-semibold text-gray-900">Filters & Sort</h2>
          {(searchTerm || minScore > 0 || statusFilter !== 'all' || roleFilter !== 'all' || dateFrom || dateTo) && (
            <button onClick={() => { setSearchTerm(''); setMinScore(0); setStatusFilter('all'); setRoleFilter('all'); setDateFrom(''); setDateTo(''); }} className="ml-auto text-xs text-brand-purple hover:text-brand-violet font-medium">Clear All</button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Search</label>
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none text-sm" />
            </div>
          </div>
          {/* Status */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-brand-purple outline-none text-sm bg-white">
              <option value="all">All Status</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          {/* Role */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Role</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-brand-purple outline-none text-sm bg-white">
              <option value="all">All Roles</option>
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {/* Sort */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-brand-purple outline-none text-sm bg-white">
              <option value="overall_score">Overall Score</option>
              <option value="communication">Communication</option>
              <option value="questions">Questions Count</option>
              <option value="date">Latest First</option>
              <option value="duration">Longest Duration</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
        {/* Date filter row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><HiOutlineCalendar className="w-3.5 h-3.5" /> From Date</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><HiOutlineCalendar className="w-3.5 h-3.5" /> To Date</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Min Score: <span className="text-brand-purple font-bold">{minScore}%</span></label>
            <input type="range" min="0" max="100" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer mt-2
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-purple [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer
                bg-gradient-to-r from-brand-light to-brand-purple/30" />
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Interview Leaderboard</h2>
            <p className="text-sm text-gray-500">{filtered.length} interviews found</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Communication</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Questions</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((report, idx) => {
                const rank = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                const color = getScoreColor(report.overall_score || 0);
                const statusBadge = getStatusBadge(report.status);
                const completedDate = report.completed_at ? new Date(report.completed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

                return (
                  <tr key={report._id || idx} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${
                        rank <= 3 ? 'bg-gradient-to-br from-brand-purple to-brand-indigo text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {rank}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-purple/10 to-brand-indigo/10 flex items-center justify-center border border-brand-purple/10">
                          <span className="text-xs font-bold text-brand-purple">{(report.name || '?')[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{report.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">{report.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{report.role || 'N/A'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${color.bg} ${color.text}`}>
                        {report.overall_score || 0}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-sm font-medium text-gray-700">{report.communication || 0}%</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-sm font-medium text-gray-600">{report.questions_count || 0}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-xs text-gray-500">{completedDate}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-500">
                        <HiOutlineClock className="w-3.5 h-3.5" />
                        <span className="text-xs">{report.duration || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => navigate(`/reports/${report._id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
                          text-brand-purple bg-brand-light hover:bg-brand-purple hover:text-white transition-all duration-200"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center">
                    <p className="text-gray-500 font-medium">No interviews found</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page <span className="font-semibold text-gray-700">{currentPage}</span> of <span className="font-semibold text-gray-700">{totalPages}</span></p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) page = i + 1;
                else if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
                return (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${currentPage === page ? 'bg-brand-purple text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                    {page}
                  </button>
                );
              })}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
