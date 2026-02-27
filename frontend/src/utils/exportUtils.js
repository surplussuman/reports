import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ========== ATS EXPORTS ==========

export const exportATSToExcel = (students, allStudents) => {
  const data = students.length > 0 ? students : allStudents;
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryRows = data.map((s, i) => ({
    '#': i + 1,
    'Name': s.candidateName || '',
    'Email': s.candidateEmail || '',
    'ATS Score': s.analysis?.atsScore || 0,
    'AI Summary': s.analysis?.summary || '',
  }));
  const ws1 = XLSX.utils.json_to_sheet(summaryRows);
  ws1['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 35 }, { wch: 12 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'ATS Summary');

  // Sheet 2: Skills & Education
  const skillRows = data.map((s) => {
    const skills = s.analysis?.skills || s.structuredData?.skills || [];
    const education = s.structuredData?.education || [];
    const certs = s.structuredData?.certifications || [];
    return {
      'Name': s.candidateName || '',
      'ATS Score': s.analysis?.atsScore || 0,
      'Skills': (Array.isArray(skills) ? skills : []).join(', '),
      'Education': education.map((e) => `${e.degree || ''} - ${e.institution || ''} (${e.year || ''})`).join(' | '),
      'Certifications': (Array.isArray(certs) ? certs : []).join(', '),
    };
  });
  const ws2 = XLSX.utils.json_to_sheet(skillRows);
  ws2['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 60 }, { wch: 60 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Skills & Education');

  // Sheet 3: Section Ratings
  const ratingRows = data.map((s) => {
    const ratings = s.analysis?.sectionRatings || {};
    return {
      'Name': s.candidateName || '',
      'ATS Score': s.analysis?.atsScore || 0,
      'Contact Info': ratings.contactInformation || 0,
      'Summary': ratings.summary || 0,
      'Work Experience': ratings.workExperience || 0,
      'Education': ratings.education || 0,
      'Skills': ratings.skills || 0,
      'Formatting': ratings.formatting || 0,
    };
  });
  const ws3 = XLSX.utils.json_to_sheet(ratingRows);
  ws3['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 12 }, { wch: 10 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Section Ratings');

  // Sheet 4: Detailed Feedback
  const fbRows = data.map((s) => {
    const fb = s.analysis?.feedback || {};
    return {
      'Name': s.candidateName || '',
      'ATS Score': s.analysis?.atsScore || 0,
      'Strengths': (s.analysis?.strengths || []).join('; '),
      'Improvements': (s.analysis?.improvements || []).join('; '),
      'Grammar Feedback': fb.grammar || '',
      'ATS Compatibility': fb.atsCompatibility || '',
      'Content Quality': fb.contentQuality || '',
      'Formatting': fb.formatting || '',
    };
  });
  const ws4 = XLSX.utils.json_to_sheet(fbRows);
  ws4['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 50 }, { wch: 50 }, { wch: 40 }, { wch: 40 }, { wch: 40 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws4, 'Detailed Feedback');

  XLSX.writeFile(wb, `ATS_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const exportATSToPDF = (students, allStudents) => {
  const data = students.length > 0 ? students : allStudents;
  const doc = new jsPDF({ orientation: 'landscape' });

  // Title
  doc.setFontSize(18);
  doc.setTextColor(107, 78, 255);
  doc.text('T.I.M.E - ATS Score Report', 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | Total: ${data.length} candidates`, 14, 26);

  // Summary table
  autoTable(doc, {
    startY: 32,
    head: [['#', 'Name', 'Email', 'ATS Score', 'Strengths', 'Improvements']],
    body: data.map((s, i) => [
      i + 1,
      s.candidateName || '',
      s.candidateEmail || '',
      `${s.analysis?.atsScore || 0}%`,
      (s.analysis?.strengths || []).slice(0, 2).join('; ') || '-',
      (s.analysis?.improvements || []).slice(0, 2).join('; ') || '-',
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [107, 78, 255], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 246, 255] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 40 },
      2: { cellWidth: 50 },
      3: { cellWidth: 20 },
      4: { cellWidth: 60 },
      5: { cellWidth: 60 },
    },
  });

  // Detailed Analysis - new page
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(107, 78, 255);
  doc.text('Detailed Section Ratings', 14, 18);

  autoTable(doc, {
    startY: 24,
    head: [['Name', 'ATS Score', 'Contact', 'Summary', 'Experience', 'Education', 'Skills', 'Formatting']],
    body: data.map((s) => {
      const r = s.analysis?.sectionRatings || {};
      return [
        s.candidateName || '',
        `${s.analysis?.atsScore || 0}%`,
        `${r.contactInformation || 0}/5`,
        `${r.summary || 0}/5`,
        `${r.workExperience || 0}/5`,
        `${r.education || 0}/5`,
        `${r.skills || 0}/5`,
        `${r.formatting || 0}/5`,
      ];
    }),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [107, 78, 255], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 246, 255] },
  });

  doc.save(`ATS_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const exportATSToCSV = (students, allStudents) => {
  const data = students.length > 0 ? students : allStudents;
  const headers = ['Name', 'Email', 'ATS Score', 'Summary', 'Skills', 'Strengths', 'Improvements'];
  const rows = data.map((s) => [
    `"${(s.candidateName || '').replace(/"/g, '""')}"`,
    s.candidateEmail || '',
    s.analysis?.atsScore || 0,
    `"${(s.analysis?.summary || '').replace(/"/g, '""')}"`,
    `"${(s.analysis?.skills || []).join(', ')}"`,
    `"${(s.analysis?.strengths || []).join('; ')}"`,
    `"${(s.analysis?.improvements || []).join('; ')}"`,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csv, 'text/csv', `ATS_Report_${new Date().toISOString().slice(0, 10)}.csv`);
};


// ========== REPORTS (INTERVIEW) EXPORTS ==========

export const exportReportsToExcel = (reports, allReports) => {
  const data = reports.length > 0 ? reports : allReports;
  const wb = XLSX.utils.book_new();

  // Sheet 1: Leaderboard Summary
  const summaryRows = data.map((r, i) => ({
    'Rank': i + 1,
    'Name': r.name || '',
    'Email': r.email || '',
    'Role': r.role || '',
    'Overall Score': r.overall_score || 0,
    'Communication': r.communication || 0,
    'Status': r.status || '',
    'Duration': r.duration || '',
    'Questions': r.questions_count || 0,
    'Completed': r.completed_at ? new Date(r.completed_at).toLocaleDateString('en-IN') : '',
  }));
  const ws1 = XLSX.utils.json_to_sheet(summaryRows);
  ws1['!cols'] = [{ wch: 6 }, { wch: 30 }, { wch: 35 }, { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Interview Summary');

  // Sheet 2: Detailed Scores (per-question analysis)
  const detailRows = [];
  data.forEach((r) => {
    const questions = (r.interview_data || []).filter((q) => q.isRealQuestion);
    if (questions.length === 0) {
      detailRows.push({
        'Candidate': r.name || '',
        'Email': r.email || '',
        'Question #': '-',
        'Category': '-',
        'Question': '-',
        'Answer': '-',
        'Overall': r.overall_score || 0,
        'Confidence': '-',
        'Ideas': '-',
        'Grammar': '-',
        'Content Feedback': '-',
      });
    } else {
      questions.forEach((q, qi) => {
        const fb = q.feedback || {};
        detailRows.push({
          'Candidate': r.name || '',
          'Email': r.email || '',
          'Question #': qi + 1,
          'Category': q.templateCategory || '',
          'Question': q.question || '',
          'Answer': q.answer || '',
          'Overall': fb.overallScore || 0,
          'Confidence': fb.confidenceScore || 0,
          'Ideas': fb.ideasScore || 0,
          'Grammar': fb.grammarScore || 0,
          'Content Feedback': fb.contentFeedback || '',
        });
      });
    }
  });
  const ws2 = XLSX.utils.json_to_sheet(detailRows);
  ws2['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 10 }, { wch: 14 }, { wch: 50 }, { wch: 60 }, { wch: 8 }, { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Detailed Q&A Analysis');

  // Sheet 3: Score Breakdown
  const breakdownRows = data.map((r) => {
    const questions = (r.interview_data || []).filter((q) => q.isRealQuestion);
    const avgScore = (field) => {
      const vals = questions.map((q) => q.feedback?.[field] || 0).filter((v) => v > 0);
      return vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0;
    };
    return {
      'Name': r.name || '',
      'Overall Score': r.overall_score || 0,
      'Communication': r.communication || 0,
      'Status': r.status || '',
      'Avg Confidence': avgScore('confidenceScore'),
      'Avg Ideas': avgScore('ideasScore'),
      'Avg Organization': avgScore('organizationScore'),
      'Avg Accuracy': avgScore('accuracyScore'),
      'Avg Voice': avgScore('voiceScore'),
      'Avg Grammar': avgScore('grammarScore'),
      'Avg Overall/Q': avgScore('overallScore'),
    };
  });
  const ws3 = XLSX.utils.json_to_sheet(breakdownRows);
  ws3['!cols'] = [{ wch: 30 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 15 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Score Breakdown');

  XLSX.writeFile(wb, `Interview_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const exportReportsToPDF = (reports, allReports) => {
  const data = reports.length > 0 ? reports : allReports;
  const doc = new jsPDF({ orientation: 'landscape' });

  // Title
  doc.setFontSize(18);
  doc.setTextColor(107, 78, 255);
  doc.text('T.I.M.E - Interview Reports', 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | Total: ${data.length} interviews`, 14, 26);

  // Leaderboard table
  autoTable(doc, {
    startY: 32,
    head: [['Rank', 'Name', 'Email', 'Role', 'Overall', 'Comm.', 'Status', 'Duration', 'Date']],
    body: data.map((r, i) => [
      i + 1,
      r.name || '',
      r.email || '',
      r.role || '',
      `${r.overall_score || 0}%`,
      `${r.communication || 0}%`,
      r.status || '',
      r.duration || '',
      r.completed_at ? new Date(r.completed_at).toLocaleDateString('en-IN') : '',
    ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [107, 78, 255], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 246, 255] },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 35 },
      2: { cellWidth: 45 },
      3: { cellWidth: 28 },
      4: { cellWidth: 18 },
      5: { cellWidth: 16 },
      6: { cellWidth: 22 },
      7: { cellWidth: 18 },
      8: { cellWidth: 22 },
    },
  });

  // Detailed Analysis pages per candidate
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(107, 78, 255);
  doc.text('Score Breakdown', 14, 18);

  autoTable(doc, {
    startY: 24,
    head: [['Name', 'Overall', 'Communication', 'Status', 'Questions', 'Duration']],
    body: data.map((r) => [
      r.name || '',
      `${r.overall_score || 0}%`,
      `${r.communication || 0}%`,
      r.status || '',
      r.questions_count || 0,
      r.duration || '',
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [107, 78, 255], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 246, 255] },
  });

  doc.save(`Interview_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const exportReportsToCSV = (reports, allReports) => {
  const data = reports.length > 0 ? reports : allReports;
  const headers = ['Rank', 'Name', 'Email', 'Role', 'Overall Score', 'Communication', 'Status', 'Duration', 'Questions', 'Completed'];
  const rows = data.map((r, i) => [
    i + 1,
    `"${(r.name || '').replace(/"/g, '""')}"`,
    r.email || '',
    `"${(r.role || '').replace(/"/g, '""')}"`,
    r.overall_score || 0,
    r.communication || 0,
    r.status || '',
    r.duration || '',
    r.questions_count || 0,
    r.completed_at ? new Date(r.completed_at).toLocaleDateString('en-IN') : '',
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csv, 'text/csv', `Interview_Report_${new Date().toISOString().slice(0, 10)}.csv`);
};

// Helper
function downloadBlob(content, type, filename) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
