import React, { useState, useMemo, useEffect } from 'react';
import { GradeRecord } from '../types';
import { Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface GradeTableProps {
  records: GradeRecord[];
  statusFilter: 'all' | 'passed' | 'failed';
  onStatusChange: (status: 'all' | 'passed' | 'failed') => void;
}

export const GradeTable: React.FC<GradeTableProps> = ({ records, statusFilter, onStatusChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reset to first page when records or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [records.length, statusFilter]);

  const totalPages = Math.ceil(records.length / pageSize);
  
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return records.slice(start, start + pageSize);
  }, [records, currentPage]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-slate-900">Detailed Grade Data</h3>
          <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
            {records.length} entries
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value as any)}
              className="appearance-none pl-9 pr-10 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer hover:border-slate-300 transition-all"
            >
              <option value="all">All Status</option>
              <option value="passed">Passed Only</option>
              <option value="failed">Failed Only</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student ID</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Section</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignment</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRecords.map((record, index) => {
              const passed = record.score >= (record.passingScore || 75);
              return (
                <tr key={index} className="hover:bg-slate-50/30 transition-colors duration-200">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{record.studentId}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{record.courseId}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{record.sectionId}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{record.assignmentId}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{record.score}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      passed 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {passed ? 'Passed' : 'Failed'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {paginatedRecords.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                  No records found matching the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="text-slate-900">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="text-slate-900">{Math.min(currentPage * pageSize, records.length)}</span> of{' '}
            <span className="text-slate-900">{records.length}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Simple pagination logic to show a few page numbers
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 3 + i + 1;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[32px] h-8 text-xs font-semibold rounded-lg border transition-all ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

