const express = require('express');
const router = express.Router();
const {
  getSRMReports,
  getSRMReportStats,
  getReportDetail,
  getSRMReportCount,
  getSRETReports,
  getSRETReportStats,
  getSRETReportCount,
} = require('../controllers/reportsController');

router.get('/reports/srm', getSRMReports);
router.get('/reports/srm/stats', getSRMReportStats);
router.get('/reports/count/srm', getSRMReportCount);

router.get('/reports/sret', getSRETReports);
router.get('/reports/sret/stats', getSRETReportStats);
router.get('/reports/count/sret', getSRETReportCount);

// Generic detail — works for any college
router.get('/reports/detail/:id', getReportDetail);

module.exports = router;
