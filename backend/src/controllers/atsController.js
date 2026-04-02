const ResumeAnalysis = require('../models/ResumeAnalysis');

// GET /api/ats/srm — SRM students with ATS data (list view only — minimal fields)
const getSRMStudents = async (req, res, next) => {
  try {
    const students = await ResumeAnalysis.find(
      { candidateEmail: { $regex: /@srmist\.edu\.in$/i } },
      {
        candidateName: 1,
        candidateEmail: 1,
        'analysis.atsScore': 1,
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

// ── SRET ATS endpoints ──

const getSRETStudents = async (req, res, next) => {
  try {
    // Get all known SRET emails from metadata
    const SretMeta = mongoose.model('SretMeta', new mongoose.Schema({}, { strict: false }), 'sretStudentMetadata');
    const metaDocs = await SretMeta.find({ emailId: { $exists: true, $ne: '' } }, { emailId: 1, name: 1 }).lean();
    const sretEmails = metaDocs.map((d) => d.emailId.toLowerCase()).filter(Boolean);

    // Fetch any ResumeAnalysis records for these emails
    const found = await ResumeAnalysis.find(
      { candidateEmail: { $in: sretEmails } },
      { candidateName: 1, candidateEmail: 1, 'analysis.atsScore': 1, analyzedAt: 1 }
    ).lean();

    // Map found by lowercased email
    const foundMap = new Map(found.map((f) => [String(f.candidateEmail).toLowerCase(), f]));

    // For emails not found in ResumeAnalysis, create placeholder entries from metadata
    const placeholders = metaDocs
      .filter((m) => !foundMap.has(String(m.emailId).toLowerCase()))
      .map((m) => ({ candidateName: m.name || '', candidateEmail: m.emailId, analysis: { atsScore: null }, analyzedAt: null }));

    // Combine and sort: existing records first by score, then placeholders at the end
    const combined = found.concat(placeholders);
    combined.sort((a, b) => {
      const sa = (a.analysis && a.analysis.atsScore) || 0;
      const sb = (b.analysis && b.analysis.atsScore) || 0;
      return sb - sa;
    });

    res.json({ success: true, count: combined.length, data: combined });
  } catch (error) {
    next(error);
  }
};

const getSRETCount = async (req, res, next) => {
  try {
    const count = await ResumeAnalysis.countDocuments({
      candidateEmail: { $regex: /@sret\.edu\.in$/i },
    });
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

const getSRETStats = async (req, res, next) => {
  try {
    const stats = await ResumeAnalysis.aggregate([
      { $match: { candidateEmail: { $regex: /@sret\.edu\.in$/i } } },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          avgScore: { $avg: '$analysis.atsScore' },
          maxScore: { $max: '$analysis.atsScore' },
          minScore: { $min: '$analysis.atsScore' },
          above80: { $sum: { $cond: [{ $gte: ['$analysis.atsScore', 80] }, 1, 0] } },
          above60: { $sum: { $cond: [{ $gte: ['$analysis.atsScore', 60] }, 1, 0] } },
          below40: { $sum: { $cond: [{ $lt:  ['$analysis.atsScore', 40] }, 1, 0] } },
        },
      },
    ]);
    res.json({
      success: true,
      data: stats[0] || { totalStudents: 0, avgScore: 0, maxScore: 0, minScore: 0, above80: 0, above60: 0, below40: 0 },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSRMStudents, getSRMCount, getSRMStats, getColleges, getATSDetail, getSRETStudents, getSRETCount, getSRETStats };
