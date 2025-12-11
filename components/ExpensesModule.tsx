import React, { useState, useEffect } from 'react';
import { Expense, User, UserRole } from '../types';
import { getExpenses, addExpense } from '../services/db';
import { MinusCircle, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ExpensesModuleProps {
  user: User;
}

export const ExpensesModule: React.FC<ExpensesModuleProps> = ({ user }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState('');
  
  const [amount, setAmount] = useState<number | ''>('');
  
  // Default category
  const [category, setCategory] = useState('Stock Purchase');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    refreshExpenses();
  }, []);

  const refreshExpenses = () => {
    const all = getExpenses();
    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setExpenses(all);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === '' || amount <= 0) return;

    addExpense({
      description,
      amount: amount,
      category,
      date: new Date().toISOString()
    });
    setDescription('');
    setAmount('');
    refreshExpenses();
  };

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Define categories based on user role
  // Admin sees all
  // Saler sees ONLY: Stock Purchase, Operational
  const isAdmin = user.role === UserRole.ADMIN;
  const categories = isAdmin 
    ? ['Stock Purchase', 'Transport', 'Utilities', 'Rent', 'Operational', 'Other']
    : ['Stock Purchase', 'Operational'];

  // Reset category if not in list (edge case protection)
  useEffect(() => {
    if (!categories.includes(category)) {
      setCategory(categories[0]);
    }
  }, [user.role, categories, category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Entry Form */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MinusCircle className="text-red-600" size={20} /> Record Expense
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-colors"
                  required
                  placeholder="e.g. Restock Rice"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-colors"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Amount (TZS)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-bold">TZS</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-12 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-colors"
                    required
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold shadow-md"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-800">Expense History</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-red-500 focus:border-red-500 bg-white"
                />
              </div>
            </div>
            <div className="flex-1 overflow-auto max-h-[600px]">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-semibold sticky top-0 shadow-sm z-10">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-red-50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {format(new Date(exp.date), 'MMM dd, HH:mm')}
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-900">{exp.description}</td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-red-600">TZS {exp.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                        No expenses recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};