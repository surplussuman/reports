const m = require('mongoose');
m.connect('mongodb://admin:bBgd1nWdaWrvO14zLsMHx1RL6zgDbjU4@52.65.157.15:27017/times_ai_interviewer?authSource=admin')
  .then(async () => {
    const c = m.connection.db.collection('candidatesummaries');
    
    // Check results_json structure
    const d = await c.findOne({ email: /@srmist\.edu\.in$/i, overall_score: { $gt: 0 } });
    if (d.results_json) {
      console.log('=== results_json keys ===');
      console.log(JSON.stringify(Object.keys(d.results_json), null, 2));
      console.log('=== results_json sample (first 2000 chars) ===');
      console.log(JSON.stringify(d.results_json, null, 2).substring(0, 2000));
    }

    // Check interview_data first item feedback
    if (d.interview_data && d.interview_data.length > 0) {
      const q = d.interview_data.find(x => x.isRealQuestion && x.feedback);
      if (q) {
        console.log('=== interview_data feedback sample ===');
        console.log(JSON.stringify(q.feedback, null, 2));
      }
    }

    // Count non-zero fields across all SRM records
    const stats = await c.aggregate([
      { $match: { email: /@srmist\.edu\.in$/i } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        techNonZero: { $sum: { $cond: [{ $gt: ['$technical', 0] }, 1, 0] } },
        behNonZero: { $sum: { $cond: [{ $gt: ['$behavioral', 0] }, 1, 0] } },
        plagNonZero: { $sum: { $cond: [{ $gt: ['$plagiarism', 0] }, 1, 0] } },
        commNonZero: { $sum: { $cond: [{ $gt: ['$communication', 0] }, 1, 0] } },
        overallNonZero: { $sum: { $cond: [{ $gt: ['$overall_score', 0] }, 1, 0] } },
        authNon100: { $sum: { $cond: [{ $ne: ['$authenticity', 100] }, 1, 0] } },
        hasPosition: { $sum: { $cond: [{ $ne: ['$position', ''] }, 1, 0] } },
        avgQC: { $avg: '$questions_count' },
      }}
    ]).toArray();
    console.log('=== Field stats ===');
    console.log(JSON.stringify(stats, null, 2));

    // Check date range
    const dateRange = await c.aggregate([
      { $match: { email: /@srmist\.edu\.in$/i } },
      { $group: {
        _id: null,
        minDate: { $min: '$completed_at' },
        maxDate: { $max: '$completed_at' },
        minCreated: { $min: '$created_at' },
        maxCreated: { $max: '$created_at' },
      }}
    ]).toArray();
    console.log('=== Date range ===');
    console.log(JSON.stringify(dateRange, null, 2));

    m.disconnect();
  });
