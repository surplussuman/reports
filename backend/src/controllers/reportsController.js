const mongoose = require('mongoose');

const CandidateSummary = mongoose.model(
  'CandidateSummary',
  new mongoose.Schema({}, { strict: false }),
  'candidatesummaries'
);

const Transcript = mongoose.model(
  'Transcript',
  new mongoose.Schema({}, { strict: false }),
  'transcripts'
);

// GET /api/reports/srm — SRM interview reports (leaderboard list)
const getSRMReports = async (req, res, next) => {
  try {
    const reports = await CandidateSummary.find(
      { email: { $regex: /@srmist\.edu\.in$/i } },
      {
        name: 1,
        email: 1,
        interview_id: 1,
        candidate_id: 1,
        overall_score: 1,
        technical: 1,
        communication: 1,
        behavioral: 1,
        plagiarism: 1,
        authenticity: 1,
        duration: 1,
        status: 1,
        role: 1,
        subcategory_name: 1,
        exam_name: 1,
        questions_count: 1,
        started_at: 1,
        completed_at: 1,
        template_number: 1,
        interview_data: 1,
      }
    )
      .sort({ overall_score: -1 })
      .lean();

    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/srm/stats — Aggregate interview stats
const getSRMReportStats = async (req, res, next) => {
  try {
    const stats = await CandidateSummary.aggregate([
      { $match: { email: { $regex: /@srmist\.edu\.in$/i } } },
      {
        $group: {
          _id: null,
          totalInterviews: { $sum: 1 },
          avgOverall: { $avg: '$overall_score' },
          avgTechnical: { $avg: '$technical' },
          avgCommunication: { $avg: '$communication' },
          avgQuestionsCount: { $avg: '$questions_count' },
          shortlisted: {
            $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          maxScore: { $max: '$overall_score' },
          minScore: { $min: '$overall_score' },
        },
      },
    ]);

    const result = stats[0] || {
      totalInterviews: 0,
      avgOverall: 0,
      avgTechnical: 0,
      avgCommunication: 0,
      avgQuestionsCount: 0,
      shortlisted: 0,
      completed: 0,
      maxScore: 0,
      minScore: 0,
    };

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/detail/:id — Full interview detail by candidatesummary _id
const getReportDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await CandidateSummary.findById(id).lean();

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // Try to get transcript
    let transcript = null;
    if (report.interview_id) {
      transcript = await Transcript.findOne({
        interview_id: report.interview_id,
      }).lean();
    }

    res.json({ success: true, data: { ...report, transcript } });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/count/srm — Count
const getSRMReportCount = async (req, res, next) => {
  try {
    const count = await CandidateSummary.countDocuments({
      email: { $regex: /@srmist\.edu\.in$/i },
    });
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSRMReports,
  getSRMReportStats,
  getReportDetail,
  getSRMReportCount,
};
