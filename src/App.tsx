import React, { useState, useMemo } from 'react';
import { 
  Users, 
  GraduationCap, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Filter, 
  RefreshCw, 
  FileSpreadsheet,
  ChevronDown,
  LayoutDashboard,
  Search,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FileUpload } from './components/FileUpload';
import { StatsCard } from './components/StatsCard';
import { GradeCharts } from './components/GradeCharts';
import { GradeTable } from './components/GradeTable';
import { GradeRecord } from './types';
import { calculateSummary } from './utils/gradeParser';

export default function App() {
  const [data, setData] = useState<GradeRecord[]>([]);
  const [filters, setFilters] = useState({
    course: 'all',
    section: 'all',
    assignment: 'all',
    status: 'all' as 'all' | 'passed' | 'failed',
    search: ''
  });

  const summary = useMemo(() => calculateSummary(data), [data]);

  const uniqueValues = useMemo(() => {
    return {
      courses: ['all', ...Array.from(new Set(data.map(r => r.courseId)))],
      sections: ['all', ...Array.from(new Set(data.map(r => r.sectionId)))],
      assignments: ['all', ...Array.from(new Set(data.map(r => r.assignmentId)))]
    };
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(record => {
      const matchesCourse = filters.course === 'all' || record.courseId === filters.course;
      const matchesSection = filters.section === 'all' || record.sectionId === filters.section;
      const matchesAssignment = filters.assignment === 'all' || record.assignmentId === filters.assignment;
      const matchesSearch = record.studentId.toLowerCase().includes(filters.search.toLowerCase()) ||
                           record.courseId.toLowerCase().includes(filters.search.toLowerCase());
      
      const passed = record.score >= (record.passingScore || 75);
      const matchesStatus = filters.status === 'all' || 
                           (filters.status === 'passed' ? passed : !passed);

      return matchesCourse && matchesSection && matchesAssignment && matchesSearch && matchesStatus;
    });
  }, [data, filters]);

  const filteredSummary = useMemo(() => calculateSummary(filteredData), [filteredData]);

  const handleReset = () => {
    setData([]);
    setFilters({ course: 'all', section: 'all', assignment: 'all', status: 'all', search: '' });
  };

  if (data.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl mb-6 shadow-xl shadow-indigo-200">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">GradeTracker</h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            Upload your student grade data to generate analytics and performance reports instantly.
          </p>
        </motion.div>
        
        <FileUpload onDataLoaded={setData} />
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6 text-indigo-500" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Excel Support</h4>
            <p className="text-sm text-slate-500">Seamlessly parse .xlsx and .xls files.</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-indigo-500" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Visual Analytics</h4>
            <p className="text-sm text-slate-500">Interactive charts for pass rates and distributions.</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6 text-indigo-500" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Instant Refresh</h4>
            <p className="text-sm text-slate-500">Upload new data anytime to update your dashboard instantly.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar/Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">GradeTracker</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search student ID..."
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-64"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                New Upload
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Academic Overview</h2>
            <p className="text-slate-500 text-sm mt-1">Performance metrics and student analytics.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter: Course */}
            <div className="relative group">
              <select 
                value={filters.course}
                onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
                className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer hover:border-slate-300 transition-all"
              >
                {uniqueValues.courses.map(c => (
                  <option key={c} value={c}>{c === 'all' ? 'All Courses' : c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Filter: Section */}
            <div className="relative group">
              <select 
                value={filters.section}
                onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}
                className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer hover:border-slate-300 transition-all"
              >
                {uniqueValues.sections.map(s => (
                  <option key={s} value={s}>{s === 'all' ? 'All Sections' : s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Filter: Assignment */}
            <div className="relative group">
              <select 
                value={filters.assignment}
                onChange={(e) => setFilters(prev => ({ ...prev, assignment: e.target.value }))}
                className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer hover:border-slate-300 transition-all"
              >
                {uniqueValues.assignments.map(a => (
                  <option key={a} value={a}>{a === 'all' ? 'All Assignments' : a}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Unique Students" 
            value={filteredSummary?.totalStudents || 0} 
            icon={Users} 
            color="indigo"
          />
          <StatsCard 
            title="Pass Rate" 
            value={`${Math.round(filteredSummary?.overallPassRate || 0)}%`} 
            icon={CheckCircle} 
            color="emerald"
          />
          <StatsCard 
            title="Average Score" 
            value={Math.round(filteredSummary?.averageScore || 0)} 
            icon={TrendingUp} 
            color="amber"
          />
          <StatsCard 
            title="Total Entries" 
            value={filteredData.length} 
            icon={FileSpreadsheet} 
            color="rose"
          />
        </div>

        {/* Charts Section */}
        <GradeCharts records={filteredData} />

        {/* Table Section */}
        <GradeTable 
          records={filteredData} 
          statusFilter={filters.status}
          onStatusChange={(status) => setFilters(prev => ({ ...prev, status }))}
        />
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-slate-900">GradeTracker</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 GradeTracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
