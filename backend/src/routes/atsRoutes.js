const express = require('express');
const router = express.Router();
const {
  getSRMStudents,
  getSRMCount,
  getSRMStats,
  getColleges,
  getATSDetail,
  getSRETStudents,
  getSRETCount,
  getSRETStats,
} = require('../controllers/atsController');

router.get('/ats/srm', getSRMStudents);
router.get('/ats/count/srm', getSRMCount);
router.get('/ats/stats/srm', getSRMStats);
router.get('/ats/sret', getSRETStudents);
router.get('/ats/count/sret', getSRETCount);
router.get('/ats/stats/sret', getSRETStats);
router.get('/ats/detail/:id', getATSDetail);
router.get('/colleges', getColleges);

module.exports = router;
