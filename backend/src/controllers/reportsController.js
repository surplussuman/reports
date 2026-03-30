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
    const reports = await CandidateSummary.aggregate([
      { $match: { email: { $regex: /@srmist\.edu\.in$/i } } },
      {
        $addFields: {
          emailLower: { $toLower: '$email' }
        }
      },
      {
        $lookup: {
          from: 'studentmetadata',
          localField: 'emailLower',
          foreignField: 'emailId',
          as: 'metadata'
        }
      },
      {
        $addFields: {
          metadata: { $arrayElemAt: ['$metadata', 0] }
        }
      },
      {
        $project: {
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
          registrationNumber: '$metadata.registrationNumber',
          batchName: '$metadata.batchName',
          batchCode: '$metadata.batchCode',
          timeId: '$metadata.timeId'
        }
      },
      { $sort: { overall_score: -1 } }
    ]);

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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid report id' });
    }
    const report = await CandidateSummary.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $addFields: {
          emailLower: { $toLower: '$email' }
        }
      },
      {
        $lookup: {
          from: 'studentmetadata',
          localField: 'emailLower',
          foreignField: 'emailId',
          as: 'metadata'
        }
      },
      {
        $addFields: {
          metadata: { $arrayElemAt: ['$metadata', 0] }
        }
      },
      {
        $project: {
          _id: 1,
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
          registrationNumber: '$metadata.registrationNumber',
          batchName: '$metadata.batchName',
          batchCode: '$metadata.batchCode',
          timeId: '$metadata.timeId'
        }
      }
    ]);

    if (!report || report.length === 0) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const reportData = report[0];

      // If session duration is longer than 60 minutes, do not return the detail
      const parseMinutes = (d) => {
        if (!d && d !== 0) return 0;
        if (typeof d === 'number') return d;
        const m = ('' + d).match(/(\d+)/);
        return m ? parseInt(m[0], 10) : 0;
      };
      if (parseMinutes(reportData.duration) > 60) {
        return res.status(404).json({ success: false, error: 'Report not available' });
      }

    // Try to get transcript
    let transcript = null;
    if (reportData.interview_id) {
      transcript = await Transcript.findOne({
        interview_id: reportData.interview_id,
      }).lean();
    }

    // Remove organisation scores and question-type labels from interview_data before sending
    if (reportData.interview_data && Array.isArray(reportData.interview_data)) {
      reportData.interview_data = reportData.interview_data.map((q) => {
        const copy = { ...q };
        // remove question type labels
        delete copy.category;
        delete copy.templateCategory;
        // remove organisation / organization scores from feedback if present
        if (copy.feedback && typeof copy.feedback === 'object') {
          const fb = { ...copy.feedback };
          delete fb.organization;
          delete fb.organisation;
          delete fb.organizationScore;
          delete fb.organisationScore;
          // keep per-question overallScore so frontend can show the 8/10 badge
          copy.feedback = fb;
        }
        return copy;
      });
    }

    res.json({ success: true, data: { ...reportData, transcript } });
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

// ─── SRET Reports ────────────────────────────────────────────────────────────

// GET /api/reports/sret — SRET interview reports leaderboard
const getSRETReports = async (req, res, next) => {
  try {
    const reports = await CandidateSummary.aggregate([
      { $match: { email: { $regex: /@sret\.edu\.in$/i } } },
      { $addFields: { emailLower: { $toLower: '$email' } } },
      {
        $lookup: {
          from: 'sretStudentMetadata',
          localField: 'emailLower',
          foreignField: 'emailId',
          as: 'metadata',
        },
      },
      { $addFields: { metadata: { $arrayElemAt: ['$metadata', 0] } } },
      {
        $project: {
          name: 1, email: 1, interview_id: 1, candidate_id: 1,
          overall_score: 1, technical: 1, communication: 1, behavioral: 1,
          plagiarism: 1, authenticity: 1, duration: 1, status: 1, role: 1,
          subcategory_name: 1, exam_name: 1, questions_count: 1,
          started_at: 1, completed_at: 1, template_number: 1, interview_data: 1,
          batchName: '$metadata.batchName',
          batchCode: '$metadata.batchCode',
        },
      },
      { $sort: { overall_score: -1 } },
    ]);
    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/sret/stats
const getSRETReportStats = async (req, res, next) => {
  try {
    const stats = await CandidateSummary.aggregate([
      { $match: { email: { $regex: /@sret\.edu\.in$/i } } },
      {
        $group: {
          _id: null,
          totalInterviews: { $sum: 1 },
          avgOverall: { $avg: '$overall_score' },
          avgTechnical: { $avg: '$technical' },
          avgCommunication: { $avg: '$communication' },
          avgQuestionsCount: { $avg: '$questions_count' },
          shortlisted: { $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          maxScore: { $max: '$overall_score' },
          minScore: { $min: '$overall_score' },
        },
      },
    ]);
    const result = stats[0] || {
      totalInterviews: 0, avgOverall: 0, avgTechnical: 0, avgCommunication: 0,
      avgQuestionsCount: 0, shortlisted: 0, completed: 0, maxScore: 0, minScore: 0,
    };
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/count/sret
const getSRETReportCount = async (req, res, next) => {
  try {
    const count = await CandidateSummary.countDocuments({ email: { $regex: /@sret\.edu\.in$/i } });
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
  getSRETReports,
  getSRETReportStats,
  getSRETReportCount,
};
