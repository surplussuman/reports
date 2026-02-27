const express = require('express');
const router = express.Router();
const {
  getSRMStudents,
  getSRMCount,
  getSRMStats,
  getColleges,
} = require('../controllers/atsController');

router.get('/ats/srm', getSRMStudents);
router.get('/ats/count/srm', getSRMCount);
router.get('/ats/stats/srm', getSRMStats);
router.get('/colleges', getColleges);

module.exports = router;
