import React, { useState, useEffect } from 'react';
import { getDailyBreakdown } from '../services/db';
import { FileText, Download, Calendar } from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [dailyData, setDailyData] = useState<{day: number, total: number}[]>([]);

  useEffect(() => {
    const m = date.getMonth();
    const y = date.getFullYear();
    setDailyData(getDailyBreakdown(m, y));
  }, [date]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + offset);
    setDate(newDate);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-indigo-600" size={24} /> Sales Report
          </h2>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
             <button onClick={() => changeMonth(-1)} className="px-3 py-1 hover:bg-white rounded-md text-sm font-medium">Prev</button>
             <span className="px-4 font-bold text-gray-700 min-w-[150px] text-center">
               {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
             </span>
             <button onClick={() => changeMonth(1)} className="px-3 py-1 hover:bg-white rounded-md text-sm font-medium">Next</button>
          </div>
        </div>
        <button className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium">
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* Daily Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
         <div className="p-5 border-b border-gray-200">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" /> Daily Sales Performance
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold">
              <tr>
                <th className="px-6 py-3">Day</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Total Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dailyData.map((d) => (
                <tr key={d.day} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900 font-medium">Day {d.day}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(date.getFullYear(), date.getMonth(), d.day).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-indigo-600">
                    TZS {d.total.toLocaleString()}
                  </td>
                </tr>
              ))}
              {dailyData.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                    No sales recorded for this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};