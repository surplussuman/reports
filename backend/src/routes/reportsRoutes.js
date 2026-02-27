const express = require('express');
const router = express.Router();
const {
  getSRMReports,
  getSRMReportStats,
  getReportDetail,
  getSRMReportCount,
} = require('../controllers/reportsController');

router.get('/reports/srm', getSRMReports);
router.get('/reports/srm/stats', getSRMReportStats);
router.get('/reports/count/srm', getSRMReportCount);
router.get('/reports/detail/:id', getReportDetail);

module.exports = router;
