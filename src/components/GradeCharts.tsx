import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { GradeRecord } from '../types';

interface GradeChartsProps {
  records: GradeRecord[];
  allAssignmentIds: string[];
}

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

export const GradeCharts: React.FC<GradeChartsProps> = ({ records, allAssignmentIds }) => {
  // 1. Pass Percentage per Assignment (Bar Chart)
  const assignmentData = records.reduce((acc: any, record) => {
    if (!acc[record.assignmentId]) {
      acc[record.assignmentId] = { name: record.assignmentId, total: 0, passed: 0 };
    }
    acc[record.assignmentId].total += 1;
    if (record.score >= (record.passingScore || 75)) {
      acc[record.assignmentId].passed += 1;
    }
    return acc;
  }, {});

  const barData = Object.values(assignmentData).map((item: any) => ({
    name: item.name,
    passRate: Math.round((item.passed / item.total) * 100),
    avgScore: Math.round(records.filter(r => r.assignmentId === item.name).reduce((sum, r) => sum + r.score, 0) / item.total)
  }));

  // 2. Overall Pass vs Fail (Pie Chart)
  const passCount = records.filter(r => r.score >= (r.passingScore || 75)).length;
  const failCount = records.length - passCount;
  const pieData = [
    { name: 'Passed', value: passCount },
    { name: 'Failed', value: failCount }
  ];

  // 3. Radar Data (Show all assignments, even if 0)
  const radarData = useMemo(() => {
    const baseIds = allAssignmentIds.length > 0 ? allAssignmentIds : ['A', 'B', 'C', 'D', 'E'];
    
    const data = baseIds.map(id => {
      const assignmentRecords = records.filter(r => r.assignmentId === id);
      const avgScore = assignmentRecords.length > 0 
        ? Math.round(assignmentRecords.reduce((sum, r) => sum + r.score, 0) / assignmentRecords.length)
        : 0;
      
      return {
        name: id,
        avgScore: avgScore,
        fullMark: 100,
        threshold: 75 // Passing threshold reference
      };
    });

    // Ensure at least 3 points for a valid radar chart
    if (data.length < 3) {
      const padded = [...data];
      while (padded.length < 3) {
        padded.push({ name: ' ', avgScore: 0, fullMark: 100, threshold: 75 });
      }
      return padded;
    }
    return data;
  }, [records, allAssignmentIds]);

  const hasData = records.length > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-8">
      {/* Bar Chart: Pass Rate per Assignment */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Pass Rate per Assignment (%)</h3>
        {!hasData && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-2xl">
            <p className="text-sm font-medium text-slate-400">No data available</p>
          </div>
        )}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hasData ? barData : []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="passRate" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart: Overall Distribution */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Overall Pass/Fail Distribution</h3>
        {!hasData && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-2xl">
            <p className="text-sm font-medium text-slate-400">No data available</p>
          </div>
        )}
        <div className="h-80 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={hasData ? pieData : [{ name: 'Empty', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {hasData ? pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                )) : <Cell fill="#f1f5f9" />}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart: Performance Profile */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Performance Profile</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Average</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-400"></div>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Target (75)</span>
            </div>
          </div>
        </div>
        
        {!hasData && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-2xl">
            <p className="text-sm font-medium text-slate-400">No data available</p>
          </div>
        )}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid gridType="circle" stroke="#f1f5f9" />
              <PolarAngleAxis dataKey="name" tick={{ fill: hasData ? '#64748b' : '#cbd5e1', fontSize: 10, fontWeight: 500 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              
              {/* Reference Threshold Radar */}
              <Radar
                name="Threshold"
                dataKey="threshold"
                stroke="#fb7185"
                strokeWidth={1}
                strokeDasharray="4 4"
                fill="none"
                isAnimationActive={false}
              />

              {/* Actual Performance Radar */}
              <Radar
                name="Avg Score"
                dataKey="avgScore"
                stroke={hasData ? "#6366f1" : "#e2e8f0"}
                strokeWidth={2}
                fill={hasData ? "#6366f1" : "#f1f5f9"}
                fillOpacity={hasData ? 0.4 : 0.2}
                dot={{ r: 3, fill: hasData ? '#6366f1' : '#cbd5e1', strokeWidth: 2, stroke: '#fff' }}
              />
              
              {hasData && (
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                />
              )}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
