import React, { useState } from 'react';
import { getUsers, updateUserSalary, updateUserPin } from '../services/db';
import { User, UserRole } from '../types';
import { Settings as SettingsIcon, Save, Lock, ShieldCheck } from 'lucide-react';

export const Settings: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>(getUsers());
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Clean input
  const [salaryInput, setSalaryInput] = useState<number | ''>('');
  
  // Password Change State
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [msg, setMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const salers = users.filter(u => u.role === UserRole.SALER);
  const isAdmin = currentUser.role === UserRole.ADMIN;

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setSalaryInput(user.salary_amount || 0);
  };

  const handleSaveSalary = (id: string) => {
    const val = salaryInput === '' ? 0 : salaryInput;
    updateUserSalary(id, val);
    setUsers(getUsers()); // Refresh
    setEditingId(null);
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if(newPin.length < 4) {
      setMsg({type: 'error', text: 'PIN must be at least 4 digits.'});
      return;
    }
    if(newPin !== confirmPin) {
      setMsg({type: 'error', text: 'PINs do not match.'});
      return;
    }
    updateUserPin(currentUser.id, newPin);
    setNewPin('');
    setConfirmPin('');
    setMsg({type: 'success', text: 'Password/PIN updated successfully.'});
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <SettingsIcon className="text-gray-600" /> Settings
      </h2>

      {/* Change Password Section (For Everyone) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-2xl">
        <div className="p-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Lock size={18} className="text-gray-600"/> Change My Password (PIN)
          </h3>
        </div>
        <div className="p-6">
           <form onSubmit={handleUpdatePin} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">New PIN</label>
                 <input 
                    type="password" 
                    value={newPin}
                    onChange={e => setNewPin(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors"
                    placeholder="New PIN"
                    required
                 />
               </div>
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Confirm PIN</label>
                 <input 
                    type="password" 
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors"
                    placeholder="Confirm PIN"
                    required
                 />
               </div>
             </div>
             {msg && (
               <div className={`text-sm p-2 rounded ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                 {msg.text}
               </div>
             )}
             <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-900 text-sm font-medium">
               Update Password
             </button>
           </form>
        </div>
      </div>

      {/* Salary Management (Admin Only) */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
               <ShieldCheck size={18} className="text-indigo-600" /> Staff Salary Management
            </h3>
            <p className="text-sm text-gray-500">Set monthly base salaries for sales staff.</p>
          </div>
          <div className="p-0">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-white text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Monthly Salary</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {salers.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4">{user.role}</td>
                    <td className="px-6 py-4">
                      {editingId === user.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs font-bold">TZS</span>
                          <input
                            type="number"
                            value={salaryInput}
                            onChange={e => setSalaryInput(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-32 px-2 py-1 bg-gray-50 border border-indigo-300 rounded focus:ring-indigo-500 focus:bg-white"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-800 font-medium">TZS {user.salary_amount?.toLocaleString() || 0}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingId === user.id ? (
                        <button 
                          onClick={() => handleSaveSalary(user.id)}
                          className="text-green-600 hover:text-green-800 font-bold flex items-center gap-1 ml-auto"
                        >
                          <Save size={16} /> Save
                        </button>
                      ) : (
                        <button 
                          onClick={() => startEdit(user)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {salers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-400">No Sales Staff found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};