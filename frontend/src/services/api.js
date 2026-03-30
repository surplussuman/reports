import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const fetchSRMStudents = async () => {
  const { data } = await api.get('/ats/srm');
  return data;
};

export const fetchSRMCount = async () => {
  const { data } = await api.get('/ats/count/srm');
  return data;
};

export const fetchSRMStats = async () => {
  const { data } = await api.get('/ats/stats/srm');
  return data;
};

export const fetchSRETStudents = async () => {
  const { data } = await api.get('/ats/sret');
  return data;
};

export const fetchSRETCount = async () => {
  const { data } = await api.get('/ats/count/sret');
  return data;
};

export const fetchSRETStats = async () => {
  const { data } = await api.get('/ats/stats/sret');
  return data;
};

export const fetchATSStudentsByCollege = (college) =>
  college === 'sret' ? fetchSRETStudents() : fetchSRMStudents();
export const fetchATSCountByCollege = (college) =>
  college === 'sret' ? fetchSRETCount() : fetchSRMCount();
export const fetchATSStatsByCollege = (college) =>
  college === 'sret' ? fetchSRETStats() : fetchSRMStats();

export const fetchColleges = async () => {
  const { data } = await api.get('/colleges');
  return data;
};

// ── SRM KTR Reports ──
export const fetchSRMReports = async () => {
  const { data } = await api.get('/reports/srm');
  return data;
};

export const fetchSRMReportStats = async () => {
  const { data } = await api.get('/reports/srm/stats');
  return data;
};

export const fetchSRMReportCount = async () => {
  const { data } = await api.get('/reports/count/srm');
  return data;
};

// ── SRET Reports ──
export const fetchSRETReports = async () => {
  const { data } = await api.get('/reports/sret');
  return data;
};

export const fetchSRETReportStats = async () => {
  const { data } = await api.get('/reports/sret/stats');
  return data;
};

export const fetchSRETReportCount = async () => {
  const { data } = await api.get('/reports/count/sret');
  return data;
};

// ── College-aware helpers (auto-select based on college key) ──
export const fetchReportsByCollege = (college) => {
  if (college === 'sret') return fetchSRETReports();
  return fetchSRMReports();
};

export const fetchReportStatsByCollege = (college) => {
  if (college === 'sret') return fetchSRETReportStats();
  return fetchSRMReportStats();
};

export const fetchATSDetail = async (id) => {
  const { data } = await api.get(`/ats/detail/${id}`);
  return data;
};

export const fetchReportDetail = async (id) => {
  const { data } = await api.get(`/reports/detail/${id}`);
  return data;
};

export default api;
