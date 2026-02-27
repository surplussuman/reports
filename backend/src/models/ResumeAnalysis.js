const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({}, { strict: false });

const ResumeAnalysis = mongoose.model(
  'ResumeAnalysis',
  resumeAnalysisSchema,
  'resumeanalyses'
);

module.exports = ResumeAnalysis;
