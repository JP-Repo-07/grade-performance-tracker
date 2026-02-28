import ExcelJS from 'exceljs';
import { GradeRecord } from '../types';

export const parseGradeFile = async (file: File): Promise<GradeRecord[]> => {
  try {
    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = await file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) return [];

    const rows: any[][] = [];
    worksheet.eachRow((row) => {
      const rowData: any[] = [];
      row.eachCell({ includeEmpty: true }, (cell) => {
        rowData.push(cell.value);
      });
      rows.push(rowData);
    });

    if (rows.length < 2) return [];

    const headers = rows[0].map(h => String(h || '').toLowerCase().replace(/[\s_]/g, ''));
    const dataRows = rows.slice(1);

    const records: GradeRecord[] = dataRows.map((row) => {
      const findValue = (keys: string[]) => {
        const index = headers.findIndex(h => keys.some(search => h.includes(search.toLowerCase())));
        return index !== -1 ? row[index] : undefined;
      };

      const scoreValue = findValue(['score', 'points', 'mark']);
      // ExcelJS might return a formula object or a number
      let scoreNum = 0;
      if (typeof scoreValue === 'number') {
        scoreNum = scoreValue;
      } else if (scoreValue && typeof scoreValue === 'object' && 'result' in scoreValue) {
        scoreNum = Number(scoreValue.result);
      } else {
        scoreNum = parseFloat(String(scoreValue || '0'));
      }
      
      const passingScore = 75;

      return {
        studentId: String(findValue(['studentid', 'studentno', 'id']) || ''),
        courseId: String(findValue(['courseid', 'course', 'subject']) || ''),
        sectionId: String(findValue(['sectionid', 'section', 'class']) || ''),
        assignmentId: String(findValue(['assignmentid', 'assignment', 'task']) || ''),
        score: isNaN(scoreNum) ? 0 : scoreNum,
        grade: String(findValue(['grade', 'lettergrade']) || (scoreNum >= passingScore ? 'P' : 'F')),
        passingScore: passingScore
      };
    });

    return records.filter(r => r.studentId && r.courseId);
  } catch (err) {
    console.error('Excel parsing error:', err);
    throw new Error('Failed to parse Excel file. Please ensure it is a valid .xlsx file.');
  }
};

export const calculateSummary = (records: GradeRecord[]): any => {
  if (records.length === 0) return null;

  const total = records.length;
  const passCount = records.filter(r => r.score >= (r.passingScore || 75)).length;
  const failCount = total - passCount;
  const averageScore = records.reduce((acc, r) => acc + r.score, 0) / total;

  return {
    totalStudents: new Set(records.map(r => r.studentId)).size,
    totalRecords: total,
    passCount,
    failCount,
    overallPassRate: (passCount / total) * 100,
    averageScore
  };
};
