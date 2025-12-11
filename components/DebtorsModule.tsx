import React, { useState, useEffect } from 'react';
import { Debtor, DebtorPayment, DebtorStatus } from '../types';
import { getDebtors, addDebtor, addDebtorPayment, getDebtorPayments } from '../services/db';
import { isValidTzPhone, normalizeTzPhone } from '../services/validation';
import { Users, Plus, Phone, DollarSign, History, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export const DebtorsModule: React.FC = () => {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [view, setView] = useState<'list' | 'add' | 'details'>('list');
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
  const [payments, setPayments] = useState<DebtorPayment[]>([]);
  
  // Add Form State (Clean Inputs)
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPhoneError, setNewPhoneError] = useState<string | null>(null);
  const [newDebt, setNewDebt] = useState<number | ''>('');

  // Payment Form State (Clean Input)
  const [payAmount, setPayAmount] = useState<number | ''>('');

  useEffect(() => {
    refreshDebtors();
  }, []);

  const refreshDebtors = () => {
    const all = getDebtors();
    // Sort by unpaid amount desc
    all.sort((a, b) => b.balance - a.balance);
    setDebtors(all);
  };

  const handleAddDebtor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDebt === '' || newDebt < 0) return;

    // Validate Tanzania phone number
    if (!isValidTzPhone(newPhone)) {
      setNewPhoneError('Invalid Tanzanian phone number. Use 07xxxxxxxx or +2557xxxxxxxx');
      return;
    }

    const phoneNormalized = normalizeTzPhone(newPhone);

    addDebtor({
      name: newName,
      phone: phoneNormalized,
      total_debt: newDebt
    });
    setNewName('');
    setNewPhone('');
    setNewPhoneError(null);
    setNewDebt('');
    setView('list');
    refreshDebtors();
  };

  const handleViewDetails = (debtor: Debtor) => {
    setSelectedDebtor(debtor);
    setPayments(getDebtorPayments(debtor.id));
    setView('details');
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtor) return;
    if (payAmount === '' || payAmount <= 0) return;
    
    if (payAmount > selectedDebtor.balance) {
      alert("Payment exceeds remaining balance.");
      return;
    }
    
    addDebtorPayment(selectedDebtor.id, payAmount);
    setPayAmount('');
    
    // Refresh local selected debtor state
    const updatedList = getDebtors();
    const updatedDebtor = updatedList.find(d => d.id === selectedDebtor.id);
    if (updatedDebtor) {
      setSelectedDebtor(updatedDebtor);
      setPayments(getDebtorPayments(updatedDebtor.id));
    }
    refreshDebtors();
  };

  const getStatusColor = (status: DebtorStatus) => {
    switch (status) {
      case DebtorStatus.PAID: return 'bg-green-100 text-green-800';
      case DebtorStatus.PARTIALLY_PAID: return 'bg-yellow-100 text-yellow-800';
      case DebtorStatus.UNPAID: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {view === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Users className="text-indigo-600" size={20} /> Debtors Registry
            </h3>
            <button
              onClick={() => setView('add')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
            >
              <Plus size={16} /> New Debtor
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-semibold shadow-sm">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3 text-right">Total Debt</th>
                  <th className="px-6 py-3 text-right">Balance</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {debtors.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">{d.name}</td>
                    <td className="px-6 py-3 flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" /> {d.phone}
                    </td>
                    <td className="px-6 py-3 text-right">TZS {d.total_debt.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right font-bold text-indigo-600">TZS {d.balance.toLocaleString()}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(d.status)}`}>
                        {d.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => handleViewDetails(d)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
                {debtors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      No debtors recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'add' && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Add New Debtor</h3>
              <button onClick={() => setView('list')} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft size={20} />
              </button>
           </div>
           <form onSubmit={handleAddDebtor} className="space-y-4">
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Customer Name</label>
               <input
                 type="text"
                 value={newName}
                 onChange={e => setNewName(e.target.value)}
                 className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors"
                 required
                 placeholder="Enter name"
               />
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
               <input
                 type="tel"
                 value={newPhone}
                 onChange={e => setNewPhone(e.target.value)}
                 className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors"
                 required
                 placeholder="07..."
               />
                 {newPhoneError && (
                   <p className="text-sm text-red-600 mt-2">{newPhoneError}</p>
                 )}
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Initial Debt Amount (TZS)</label>
               <div className="relative">
                 <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-bold">TZS</span>
                 <input
                   type="number"
                   min="0"
                   step="0.01"
                   value={newDebt}
                   onChange={e => setNewDebt(e.target.value === '' ? '' : Number(e.target.value))}
                   className="w-full pl-12 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors"
                   required
                   placeholder="Enter amount"
                 />
               </div>
             </div>
             <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold shadow-md mt-4"
              >
                Create Debtor Record
              </button>
           </form>
        </div>
      )}

      {view === 'details' && selectedDebtor && (
        <div className="flex flex-col lg:flex-row gap-6">
           {/* Info & Payment */}
           <div className="lg:w-1/3 space-y-6">
              <button 
                onClick={() => setView('list')} 
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
              >
                <ArrowLeft size={16} className="mr-1" /> Back to List
              </button>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-start justify-between">
                   <div>
                     <h2 className="text-xl font-bold text-gray-900">{selectedDebtor.name}</h2>
                     <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                       <Phone size={14} /> {selectedDebtor.phone}
                     </p>
                   </div>
                   <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedDebtor.status)}`}>
                      {selectedDebtor.status}
                   </span>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                   <div className="flex justify-between text-sm">
                     <span className="text-gray-500">Total Credit Given:</span>
                     <span className="font-medium">TZS {selectedDebtor.total_debt.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-gray-500">Paid So Far:</span>
                     <span className="font-medium text-green-600">TZS {(selectedDebtor.total_debt - selectedDebtor.balance).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-lg font-bold bg-gray-50 p-4 rounded-lg border border-gray-100">
                     <span className="text-gray-700">Balance Due:</span>
                     <span className="text-red-600">TZS {selectedDebtor.balance.toLocaleString()}</span>
                   </div>
                </div>
              </div>

              {selectedDebtor.balance > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                   <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                     <DollarSign className="text-green-600" size={20} /> Record Payment
                   </h3>
                   <form onSubmit={handlePayment}>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Amount Received (TZS)</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            min="0.01"
                            max={selectedDebtor.balance}
                            step="0.01"
                            value={payAmount}
                            onChange={e => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                            required
                            placeholder="Amount"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-sm"
                        >
                          Pay
                        </button>
                      </div>
                   </form>
                </div>
              )}
           </div>

           {/* History */}
           <div className="lg:w-2/3">
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                <div className="p-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                   <h3 className="font-bold text-gray-800 flex items-center gap-2">
                     <History className="text-gray-500" size={20} /> Payment History
                   </h3>
                </div>
                <div className="p-0">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 font-semibold shadow-sm">
                      <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3 text-right">Amount Paid</th>
                        <th className="px-6 py-3 text-right">Remaining Bal.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {payments.map(p => (
                        <tr key={p.id}>
                          <td className="px-6 py-3 whitespace-nowrap text-gray-500">
                            {format(new Date(p.date), 'MMM dd, yyyy HH:mm')}
                          </td>
                          <td className="px-6 py-3 text-right font-medium text-green-600">
                             + TZS {p.amount_paid.toLocaleString()}
                          </td>
                          <td className="px-6 py-3 text-right text-gray-900">
                             TZS {p.remaining_balance.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {payments.length === 0 && (
                        <tr>
                           <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                             No payments recorded yet.
                           </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};