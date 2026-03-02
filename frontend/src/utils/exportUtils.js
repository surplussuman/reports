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
    'AI Summary': s.analysis?.comprehensiveSummary || s.analysis?.summary || '',
    'Analyzed At': s.analyzedAt ? new Date(s.analyzedAt).toLocaleDateString('en-IN') : '',
  }));
  const ws1 = XLSX.utils.json_to_sheet(summaryRows);
  ws1['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 35 }, { wch: 12 }, { wch: 60 }, { wch: 14 }];
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
      'Improvements': (s.analysis?.areasForImprovement || s.analysis?.improvements || []).join('; '),
      'Grammar Feedback': fb.grammar || fb.grammarFeedback || '',
      'Professional Summary': s.analysis?.comprehensiveSummary || s.structuredData?.professionalSummary || '',
      'ATS Compatibility': fb.atsCompatibility || '',
      'Content Quality': fb.contentQuality || '',
      'Formatting': fb.formatting || '',
    };
  });
  const ws4 = XLSX.utils.json_to_sheet(fbRows);
  ws4['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 50 }, { wch: 50 }, { wch: 40 }, { wch: 60 }, { wch: 40 }, { wch: 40 }, { wch: 40 }];
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
      (s.analysis?.areasForImprovement || s.analysis?.improvements || []).slice(0, 2).join('; ') || '-',
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
    `"${(s.analysis?.comprehensiveSummary || s.analysis?.summary || '').replace(/"/g, '""')}"`,
    `"${(s.analysis?.skills || []).join(', ')}"`,
    `"${(s.analysis?.strengths || []).join('; ')}"`,
    `"${(s.analysis?.areasForImprovement || s.analysis?.improvements || []).join('; ')}"`,    
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

  // Sheet 2: Detailed Q&A Transcript
  const detailRows = [];
  data.forEach((r) => {
    const allQuestions = r.interview_data || [];
    const questions = allQuestions.filter((q) => q.isRealQuestion);
    if (questions.length === 0) {
      detailRows.push({
        'Candidate': r.name || '',
        'Email': r.email || '',
        'Role': r.role || '',
        'Question #': 'No transcript available',
        'Category': '',
        'Question': '',
        'Answer': '',
        'Overall/Q': '',
        'Confidence': '',
        'Ideas': '',
        'Organization': '',
        'Accuracy': '',
        'Voice': '',
        'Grammar': '',
        'Content Feedback': '',
      });
    } else {
      questions.forEach((q, qi) => {
        const fb = q.feedback || {};
        detailRows.push({
          'Candidate': r.name || '',
          'Email': r.email || '',
          'Role': r.role || '',
          'Question #': qi + 1,
          'Category': q.templateCategory || q.category || '',
          'Question': q.question || '',
          'Answer': q.answer || '',
          'Overall/Q': fb.overallScore || 0,
          'Confidence': fb.confidenceScore || 0,
          'Ideas': fb.ideasScore || 0,
          'Organization': fb.organizationScore || 0,
          'Accuracy': fb.accuracyScore || 0,
          'Voice': fb.voiceScore || 0,
          'Grammar': fb.grammarScore || 0,
          'Content Feedback': fb.contentFeedback || fb.feedback || '',
        });
      });
    }
  });
  const ws2 = XLSX.utils.json_to_sheet(detailRows);
  ws2['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 18 }, { wch: 10 }, { wch: 16 }, { wch: 55 }, { wch: 65 }, { wch: 10 }, { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Detailed Q&A Analysis');

  // Sheet 3: Score Breakdown
  const breakdownRows = data.map((r) => {
    const questions = (r.interview_data || []).filter((q) => q.isRealQuestion);
    const avgScore = (field) => {
      const vals = questions.map((q) => q.feedback?.[field] || 0).filter((v) => v > 0);
      return vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '-';
    };
    return {
      'Name': r.name || '',
      'Email': r.email || '',
      'Role': r.role || '',
      'Overall Score': r.overall_score || 0,
      'Communication': r.communication || 0,
      'Status': r.status || '',
      'Questions Count': r.questions_count || questions.length || 0,
      'Duration': r.duration || '',
      'Date': r.completed_at ? new Date(r.completed_at).toLocaleDateString('en-IN') : '',
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
  ws3['!cols'] = [{ wch: 30 }, { wch: 32 }, { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 10 }, { wch: 14 }, { wch: 15 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 14 }];
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

// ========== SINGLE REPORT DETAIL PDF ==========

export const exportReportDetailToPDF = (report, realQuestions, avgFeedbackScores) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210, pageH = 297, margin = 15, usable = pageW - margin * 2;
  let y = 20;

  // Colors
  const purple = [79, 70, 229];
  const purpleLight = [237, 233, 254];
  const gray50 = [249, 250, 251];
  const gray100 = [243, 244, 246];
  const gray200 = [229, 231, 235];
  const gray400 = [156, 163, 175];
  const gray600 = [75, 85, 99];
  const gray700 = [55, 65, 81];
  const gray900 = [17, 24, 39];
  const blue50 = [239, 246, 255];
  const blue100 = [219, 234, 254];
  const blue500 = [59, 130, 246];

  const scoreColor = (v) =>
    v >= 80 ? [16, 185, 129] : v >= 60 ? [59, 130, 246] : v >= 40 ? [245, 158, 11] : [239, 68, 68];
  const scoreBg = (v) =>
    v >= 80 ? [209, 250, 229] : v >= 60 ? [219, 234, 254] : v >= 40 ? [254, 243, 199] : [254, 226, 226];

  const newPage = () => { doc.addPage(); y = 20; };
  const checkBreak = (h = 20) => { if (y + h > pageH - 12) newPage(); };

  // ── HEADER ──────────────────────────────────────────────────────────────
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...purple);
  doc.text('AI Interview Reports', pageW / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...gray400);
  doc.text(`Generated on ${new Date().toLocaleString()}`, pageW / 2, y, { align: 'center' });
  y += 5;
  doc.setDrawColor(...purple);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // ── CANDIDATE HEADER (purple bar) ────────────────────────────────────────
  const hdrH = 22;
  doc.setFillColor(...purple);
  doc.roundedRect(margin, y, usable, hdrH, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text((report.name || 'Unknown').toUpperCase(), margin + 6, y + 9);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(210, 200, 255);
  const meta = [report.interview_id, report.exam_name, report.role, report.status?.toUpperCase()]
    .filter(Boolean).join(' | ');
  doc.text(meta, margin + 6, y + 17);
  y += hdrH + 4;

  // ── SCORE BOXES ──────────────────────────────────────────────────────────
  const scoreItems = [
    { label: 'Overall', value: `${report.overall_score || 0}%`, num: report.overall_score || 0 },
    ...(report.communication > 0 ? [{ label: 'Communication', value: report.communication, num: report.communication }] : []),
    ...(report.technical > 0 ? [{ label: 'Technical', value: report.technical, num: report.technical }] : []),
    ...(report.behavioral > 0 ? [{ label: 'Behavioral', value: report.behavioral, num: report.behavioral }] : []),
  ];
  const bh = 20;
  const bw = (usable - (scoreItems.length - 1) * 3) / scoreItems.length;
  scoreItems.forEach((s, i) => {
    const bx = margin + i * (bw + 3);
    doc.setFillColor(...gray50);
    doc.setDrawColor(...gray200);
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, y, bw, bh, 2, 2, 'FD');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...gray400);
    doc.text(s.label, bx + bw / 2, y + 6, { align: 'center' });
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...scoreColor(s.num));
    doc.text(String(s.value), bx + bw / 2, y + 15, { align: 'center' });
  });
  y += bh + 4;

  // ── INFO ROW ─────────────────────────────────────────────────────────────
  const infoItems = [
    report.plagiarism != null ? { l: 'Plagiarism', v: `${report.plagiarism}%` } : null,
    report.authenticity != null ? { l: 'Authenticity', v: `${report.authenticity}` } : null,
    report.duration ? { l: 'Duration', v: report.duration } : null,
    report.email ? { l: 'Email', v: report.email } : null,
  ].filter(Boolean);

  if (infoItems.length > 0) {
    const infoH = 12;
    doc.setFillColor(...gray100);
    doc.setDrawColor(...gray200);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, usable, infoH, 2, 2, 'FD');
    const iw = usable / infoItems.length;
    infoItems.forEach((item, i) => {
      const ix = margin + i * iw + 4;
      const iy = y + 7.5;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...gray700);
      doc.text(`${item.l}: `, ix, iy);
      const lw = doc.getTextWidth(`${item.l}: `);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...gray600);
      doc.text(item.v, ix + lw, iy);
    });
    y += infoH + 6;
  }

  // ── DETAILED ASSESSMENT ──────────────────────────────────────────────────
  const scoreEntries = Object.entries(avgFeedbackScores).filter(([, v]) => v > 0);
  if (scoreEntries.length > 0) {
    checkBreak(30);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...gray900);
    doc.text('Detailed Assessment', margin, y);
    y += 6;
    const cols = 3;
    const sw = (usable - (cols - 1) * 3) / cols;
    const sh = 10;
    const rows = Math.ceil(scoreEntries.length / cols);
    for (let row = 0; row < rows; row++) {
      checkBreak(sh + 3);
      for (let col = 0; col < cols; col++) {
        const idx = row * cols + col;
        if (idx >= scoreEntries.length) break;
        const [key, val] = scoreEntries[idx];
        const sx = margin + col * (sw + 3);
        const label = key.replace('Score', '').replace(/([A-Z])/g, ' $1').trim();
        const labelCap = label.charAt(0).toUpperCase() + label.slice(1);
        doc.setFillColor(...gray50);
        doc.setDrawColor(...gray200);
        doc.setLineWidth(0.3);
        doc.roundedRect(sx, y, sw, sh, 1.5, 1.5, 'FD');
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...gray700);
        doc.text(labelCap, sx + 4, y + 6.5);
        // mini bar
        const barX = sx + sw - 30;
        doc.setFillColor(...gray200);
        doc.roundedRect(barX, y + 3.5, 22, 3, 1, 1, 'F');
        doc.setFillColor(...scoreColor(val));
        doc.roundedRect(barX, y + 3.5, 22 * (val / 100), 3, 1, 1, 'F');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...scoreColor(val));
        doc.text(`${val}%`, sx + sw - 4, y + 6.5, { align: 'right' });
      }
      y += sh + 3;
    }
    y += 4;
  }

  // ── INTERVIEW TRANSCRIPTS ─────────────────────────────────────────────────
  checkBreak(16);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...gray900);
  doc.text(`Interview Transcripts (${realQuestions.length} question${realQuestions.length !== 1 ? 's' : ''})`, margin, y);
  y += 8;

  realQuestions.forEach((qa, idx) => {
    const fb = qa.feedback || {};

    // ─ Q Badge + Question ─
    checkBreak(18);
    // Badge
    doc.setFillColor(...purple);
    doc.roundedRect(margin, y, 9, 7.5, 1.5, 1.5, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`Q${idx + 1}`, margin + 4.5, y + 5.2, { align: 'center' });

    // Category pill
    const catText = (qa.category || qa.templateCategory || 'general').toLowerCase();
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...purple);
    const catW = doc.getTextWidth(catText) + 5;
    const hasPill = fb.overallScore > 0;
    const pillRight = hasPill ? margin + usable - 17 : margin + usable;
    doc.setFillColor(...purpleLight);
    doc.roundedRect(pillRight - catW, y, catW, 6.5, 1, 1, 'F');
    doc.text(catText, pillRight - catW / 2, y + 4.7, { align: 'center' });

    if (hasPill) {
      const sv = fb.overallScore * 10;
      doc.setFillColor(...scoreBg(sv));
      doc.roundedRect(margin + usable - 13, y, 13, 6.5, 1, 1, 'F');
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...scoreColor(sv));
      doc.text(`${fb.overallScore}/10`, margin + usable - 6.5, y + 4.7, { align: 'center' });
    }

    // Question text
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...gray900);
    const qLines = doc.splitTextToSize(qa.question || '', usable - 14);
    doc.text(qLines, margin + 11, y + 5.5);
    y += Math.max(qLines.length * 5, 8) + 4;

    // ─ Answer box ─
    const ansText = qa.answer || 'No answer provided';
    const ansLines = doc.splitTextToSize(ansText, usable - 10);
    const ansH = ansLines.length * 4.5 + 9;
    checkBreak(ansH + 6);
    doc.setFillColor(...blue50);
    doc.setDrawColor(...blue100);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, usable, ansH, 2, 2, 'FD');
    // left accent bar
    doc.setFillColor(...blue500);
    doc.rect(margin, y, 2.5, ansH, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...blue500);
    doc.text('Answer', margin + 5, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...gray700);
    doc.text(ansLines, margin + 5, y + 10);
    y += ansH + 3;

    // ─ Feedback box ─
    const fbParts = [
      fb.contentFeedback ? `Content: ${fb.contentFeedback}` : null,
      fb.clarityFeedback ? `Clarity: ${fb.clarityFeedback}` : null,
      fb.toneFeedback ? `Tone: ${fb.toneFeedback}` : null,
      fb.visualFeedback ? `Visual: ${fb.visualFeedback}` : null,
    ].filter(Boolean);

    if (fbParts.length > 0) {
      const fbBodyText = fbParts.join(' | ');
      // Render "Feedback: " prefix then body — compute first-line indent
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      const prefixW = doc.getTextWidth('Feedback: ');
      const bodyLines = doc.splitTextToSize(fbBodyText, usable - 10 - prefixW);
      // We'll put prefix on line1 + remaining wrapped from left
      const fbAllLines = doc.splitTextToSize(fbBodyText, usable - 10);
      const fbH = fbAllLines.length * 4.5 + 9;
      checkBreak(fbH + 5);
      doc.setFillColor(...purpleLight);
      doc.setDrawColor(196, 181, 253);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, usable, fbH, 2, 2, 'FD');
      // Bold "Feedback: " label
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...purple);
      doc.text('Feedback:', margin + 5, y + 5.5);
      // Normal body text starting after label on first line
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...gray600);
      const firstLineBody = doc.splitTextToSize(fbBodyText, usable - 10 - prefixW)[0];
      doc.text(firstLineBody, margin + 5 + prefixW, y + 5.5);
      // Remaining lines from left
      const fullLines = doc.splitTextToSize(fbBodyText, usable - 10);
      if (fullLines.length > 1) {
        doc.text(fullLines.slice(1), margin + 5, y + 5.5 + 4.5);
      }
      y += fbH + 3;
    }

    // ─ Score pills row ─
    if (fb.overallScore > 0) {
      const pillFields = [
        { k: 'confidenceScore', l: 'Confidence' },
        { k: 'ideasScore', l: 'Ideas' },
        { k: 'organizationScore', l: 'Organization' },
        { k: 'accuracyScore', l: 'Accuracy' },
        { k: 'voiceScore', l: 'Voice' },
        { k: 'grammarScore', l: 'Grammar' },
      ].filter(({ k }) => fb[k] > 0);

      if (pillFields.length > 0) {
        checkBreak(10);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        let px = margin;
        pillFields.forEach(({ k, l }) => {
          const sv = fb[k] * 10;
          const pillText = `${l}: ${fb[k]}/10`;
          const pw = doc.getTextWidth(pillText) + 6;
          if (px + pw > margin + usable) { px = margin; y += 8; checkBreak(8); }
          doc.setFillColor(...scoreBg(sv));
          doc.roundedRect(px, y, pw, 6.5, 1, 1, 'F');
          doc.setTextColor(...scoreColor(sv));
          doc.text(pillText, px + 3, y + 4.7);
          px += pw + 3;
        });
        y += 9;
      }
    }

    // ─ Score line ─
    checkBreak(8);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...gray700);
    doc.text(`Score: ${fb.overallScore > 0 ? `${fb.overallScore}/10` : 'N/A'}`, margin, y);
    y += 5;

    // Divider between questions
    doc.setDrawColor(...gray200);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
  });

  // ── SESSION DETAILS ───────────────────────────────────────────────────────
  checkBreak(20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...gray900);
  doc.text('Session Details', margin, y);
  y += 6;

  const detailItems = [
    { label: 'Interview ID', value: report.interview_id },
    { label: 'Candidate ID', value: report.candidate_id },
    { label: 'Exam Type', value: report.exam_name },
    { label: 'Role', value: report.role },
    { label: 'Subcategory', value: report.subcategory_name },
    { label: 'Questions Count', value: realQuestions.length },
    { label: 'Duration', value: report.duration },
    { label: 'Status', value: report.status },
    { label: 'Started At', value: report.started_at ? new Date(report.started_at).toLocaleString() : 'N/A' },
    { label: 'Completed At', value: report.completed_at ? new Date(report.completed_at).toLocaleString() : 'N/A' },
  ];

  const dw = (usable - 3) / 2;
  const dh = 9;
  for (let i = 0; i < detailItems.length; i += 2) {
    checkBreak(dh + 3);
    [detailItems[i], detailItems[i + 1]].forEach((item, col) => {
      if (!item) return;
      const dx = margin + col * (dw + 3);
      doc.setFillColor(...gray50);
      doc.setDrawColor(...gray200);
      doc.setLineWidth(0.3);
      doc.roundedRect(dx, y, dw, dh, 1.5, 1.5, 'FD');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...gray400);
      doc.text(item.label, dx + 4, y + 5.8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...gray900);
      doc.text(String(item.value || 'N/A'), dx + dw - 4, y + 5.8, { align: 'right' });
    });
    y += dh + 3;
  }

  const safeName = (report.name || 'candidate').replace(/\s+/g, '_');
  doc.save(`Interview_Report_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`);
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
