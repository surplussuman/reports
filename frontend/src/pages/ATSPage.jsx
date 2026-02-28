import React, { useEffect, useState, useMemo } from 'react';
import StatsCards from '../components/StatsCards';
import FilterBar from '../components/FilterBar';
import StudentTable from '../components/StudentTable';
import ExportDropdown from '../components/ExportDropdown';
import Loader from '../components/Loader';
import { fetchSRMStudents, fetchSRMCount, fetchSRMStats } from '../services/api';
import { exportATSToPDF, exportATSToExcel, exportATSToCSV } from '../utils/exportUtils';
import { HiOutlineSparkles } from 'react-icons/hi';

const ATSPage = () => {
  const [students, setStudents] = useState([]);
  const [count, setCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 100;

  // Detail modal
  // Removed: selectedStudent state & modal — View Details now opens /ats/:id in a new tab

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsRes, countRes, statsRes] = await Promise.all([
        fetchSRMStudents(),
        fetchSRMCount(),
        fetchSRMStats(),
      ]);
      setStudents(studentsRes.data || []);
      setCount(countRes.count || 0);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    let result = [...students];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          (s.candidateName || '').toLowerCase().includes(term) ||
          (s.candidateEmail || '').toLowerCase().includes(term)
      );
    }
    if (maxScore < 100) {
      result = result.filter((s) => (s.analysis?.atsScore || 0) <= maxScore);
    }
    if (activeFilter === 'high') {
      result = result.filter((s) => (s.analysis?.atsScore || 0) >= 80);
    } else if (activeFilter === 'medium') {
      result = result.filter((s) => {
        const score = s.analysis?.atsScore || 0;
        return score >= 50 && score < 80;
      });
    } else if (activeFilter === 'low') {
      result = result.filter((s) => (s.analysis?.atsScore || 0) < 50);
    }
    return result;
  }, [students, searchTerm, maxScore, activeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, maxScore, activeFilter]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 px-6 lg:px-8 py-5 sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3 pl-12 lg:pl-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-purple to-brand-indigo flex items-center justify-center">
              <HiOutlineSparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-purple to-brand-indigo bg-clip-text text-transparent">
                ATS Reports
              </h1>
              <p className="text-sm text-gray-500">Comprehensive candidate evaluation dashboard</p>
            </div>
          </div>
          {/* <ExportDropdown
            onExportPDF={() => exportATSToPDF(filteredStudents, students)}
            onExportExcel={() => exportATSToExcel(filteredStudents, students)}
            onExportCSV={() => exportATSToCSV(filteredStudents, students)}
            disabled={students.length === 0}
          /> */}
        </div>
      </header>

      {/* Content */}
      <div className="px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800">Connection Error</h3>
            <p className="text-red-600 mt-2 text-sm">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <StatsCards stats={stats} count={count} />
            <FilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              maxScore={maxScore}
              setMaxScore={setMaxScore}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />
            <StudentTable
              students={paginatedStudents}
              totalCount={filteredStudents.length}
              itemsPerPage={ITEMS_PER_PAGE}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              onViewDetails={(s) => window.open('/ats/' + s._id, '_blank')}
            />
          </>
        )}
      </div>

      {/* Detail Modal removed — now opens ATSDetailPage in a new tab */}
    </>
  );
};

export default ATSPage;
