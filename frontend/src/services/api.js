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

export const fetchColleges = async () => {
  const { data } = await api.get('/colleges');
  return data;
};

// Interview Reports APIs
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

export const fetchReportDetail = async (id) => {
  const { data } = await api.get(`/reports/detail/${id}`);
  return data;
};

export default api;
