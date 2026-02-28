import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { GradeRecord } from '../types';

interface GradeChartsProps {
  records: GradeRecord[];
}

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

export const GradeCharts: React.FC<GradeChartsProps> = ({ records }) => {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {/* Bar Chart: Pass Rate per Assignment */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Pass Rate per Assignment (%)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Overall Pass/Fail Distribution</h3>
        <div className="h-80 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
