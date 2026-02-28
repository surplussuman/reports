const ResumeAnalysis = require('../models/ResumeAnalysis');

// GET /api/ats/srm — SRM students with ATS data
const getSRMStudents = async (req, res, next) => {
  try {
    const students = await ResumeAnalysis.find(
      { candidateEmail: { $regex: /@srmist\.edu\.in$/i } },
      {
        candidateName: 1,
        candidateEmail: 1,
        interviewSessionId: 1,
        fileName: 1,
        'analysis.atsScore': 1,
        'analysis.sectionRatings': 1,
        'analysis.strengths': 1,
        'analysis.areasForImprovement': 1,
        'analysis.skills': 1,
        'analysis.experienceSummary': 1,
        'analysis.comprehensiveSummary': 1,
        'analysis.feedback': 1,
        'structuredData.name': 1,
        'structuredData.email': 1,
        'structuredData.phone': 1,
        'structuredData.location': 1,
        'structuredData.linkedin': 1,
        'structuredData.skills': 1,
        'structuredData.workExperience': 1,
        'structuredData.education': 1,
        'structuredData.certifications': 1,
        'structuredData.aiSummary': 1,
        'structuredData.professionalSummary': 1,
        analyzedAt: 1,
      }
    )
      .sort({ 'analysis.atsScore': -1 })
      .lean();

    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};

// GET /api/ats/count/srm — Count of SRM students
const getSRMCount = async (req, res, next) => {
  try {
    const count = await ResumeAnalysis.countDocuments({
      candidateEmail: { $regex: /@srmist\.edu\.in$/i },
    });
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

// GET /api/ats/stats/srm — Aggregate stats for SRM students
const getSRMStats = async (req, res, next) => {
  try {
    const stats = await ResumeAnalysis.aggregate([
      { $match: { candidateEmail: { $regex: /@srmist\.edu\.in$/i } } },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          avgScore: { $avg: '$analysis.atsScore' },
          maxScore: { $max: '$analysis.atsScore' },
          minScore: { $min: '$analysis.atsScore' },
          above80: {
            $sum: { $cond: [{ $gte: ['$analysis.atsScore', 80] }, 1, 0] },
          },
          above60: {
            $sum: { $cond: [{ $gte: ['$analysis.atsScore', 60] }, 1, 0] },
          },
          below40: {
            $sum: { $cond: [{ $lt: ['$analysis.atsScore', 40] }, 1, 0] },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalStudents: 0,
      avgScore: 0,
      maxScore: 0,
      minScore: 0,
      above80: 0,
      above60: 0,
      below40: 0,
    };

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// GET /api/colleges — Distinct colleges with counts
const getColleges = async (req, res, next) => {
  try {
    const colleges = await ResumeAnalysis.aggregate([
      { $unwind: '$structuredData.education' },
      {
        $group: {
          _id: '$structuredData.education.institution',
          count: { $sum: 1 },
        },
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, institution: '$_id', count: 1 } },
    ]);

    res.json({ success: true, data: colleges });
  } catch (error) {
    next(error);
  }
};

// GET /api/ats/detail/:id — Full ATS detail for a single student
const getATSDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await ResumeAnalysis.findById(id).lean();
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSRMStudents, getSRMCount, getSRMStats, getColleges, getATSDetail };
