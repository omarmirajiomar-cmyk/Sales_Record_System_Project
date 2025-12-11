import React, { useEffect, useState } from 'react';
import { generateMonthlySummary, getDebtors } from '../services/db';
import { MonthlySummary } from '../types';
import { TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react';

// Simple Pie Chart Component
const SimplePieChart: React.FC<{ data: { label: string, value: number, color: string }[] }> = ({ data }) => {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  if (total === 0) return <div className="text-gray-400 text-sm text-center h-48 flex items-center justify-center">No Data to Display</div>;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="-1 -1 2 2" className="w-48 h-48 transform -rotate-90">
        {data.map((slice, i) => {
          if (slice.value === 0) return null;
          const startPercent = cumulativePercent;
          const slicePercent = slice.value / total;
          cumulativePercent += slicePercent;
          
          // Handle single full slice case
          if (slicePercent === 1) {
            return <circle key={i} cx="0" cy="0" r="1" fill={slice.color} />;
          }

          const [startX, startY] = getCoordinatesForPercent(startPercent);
          const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
          
          const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
          
          const pathData = `
            M 0 0
            L ${startX} ${startY}
            A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}
            Z
          `;
          return <path key={i} d={pathData} fill={slice.color} />;
        })}
      </svg>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
        {data.map((d, i) => d.value > 0 && (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
            <span className="text-gray-600">{d.label}: {Math.round((d.value/total)*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [totalDebt, setTotalDebt] = useState(0);

  useEffect(() => {
    const today = new Date();
    const currentSummary = generateMonthlySummary(today.getMonth(), today.getFullYear());
    setSummary(currentSummary);

    const debtors = getDebtors();
    const outstanding = debtors.reduce((acc, curr) => acc + curr.balance, 0);
    setTotalDebt(outstanding);
  }, []);

  if (!summary) return <div>Loading...</div>;

  // Prepare Chart Data (Distribution of Revenue vs Costs)
  // Logic: Show proportion of Costs vs Profit
  // If profit is negative, we just show expenses relative to each other? 
  // Let's show: Expenses vs Salary vs Profit (if +ve).
  
  const chartData = [
    { label: 'Expenses', value: summary.total_expenses, color: '#EF4444' }, // Red-500
    { label: 'Salaries', value: summary.salary_cost, color: '#F97316' }, // Orange-500
    { label: 'Net Profit', value: Math.max(0, summary.profit_or_loss), color: '#22C55E' } // Green-500
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Sales Record System (SRS) — Business Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sales Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <TrendingUp className="text-indigo-600" size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase">This Month</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">TZS {summary.total_sales.toLocaleString()}</h3>
          <p className="text-sm text-gray-500 mt-1">Total Sales</p>
        </div>

        {/* Expenses Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="text-red-600" size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase">This Month</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">TZS {summary.total_expenses.toLocaleString()}</h3>
          <p className="text-sm text-gray-500 mt-1">Total Expenses</p>
        </div>

        {/* Debtors Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="text-orange-600" size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase">Outstanding</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">TZS {totalDebt.toLocaleString()}</h3>
          <p className="text-sm text-gray-500 mt-1">Total Debt to Recover</p>
        </div>

        {/* Profit Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase">Net Profit (Approx)</span>
          </div>
          <h3 className={`text-2xl font-bold ${summary.profit_or_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            TZS {summary.profit_or_loss.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Sales - (Expenses + Salaries)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Summary Breakdown (Pie Chart) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <h3 className="text-lg font-bold text-gray-800 mb-6">Financial Overview</h3>
           <SimplePieChart data={chartData} />
           <div className="mt-6 space-y-2 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Salary Cost:</span>
                <span className="font-semibold text-orange-600">TZS {summary.salary_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Debt Recovered:</span>
                <span className="font-semibold text-green-600">TZS {summary.total_debtor_payments.toLocaleString()}</span>
              </div>
           </div>
        </div>

        {/* AI Assistant Promo removed per request */}
      </div>
    </div>
  );
};