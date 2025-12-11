import React, { useState } from 'react';
import { getUsers, updateUserPin } from '../services/db';
import { User } from '../types';
import { Lock, ArrowRight, ShieldAlert, KeyRound } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const users = getUsers();

  const activeUser = users.find(u => u.id === selectedUser);
  const isSetupMode = activeUser && activeUser.pin === '';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;

    if (isSetupMode) {
      // First time setup logic
      if (newPin.length < 4) {
        setError('PIN must be at least 4 digits.');
        return;
      }
      if (newPin !== confirmPin) {
        setError('PINs do not match.');
        return;
      }
      // Save new PIN
      updateUserPin(activeUser.id, newPin);
      // Login with updated user object
      const updatedUser = { ...activeUser, pin: newPin, default_pin_changed: true };
      onLogin(updatedUser);
    } else {
      // Regular login logic
      if (activeUser.pin === pin) {
        onLogin(activeUser);
      } else {
        setError('Invalid PIN. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
          <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white" size={32} />
          </div>
            <h2 className="text-2xl font-bold text-white">Sales Record System (SRS)</h2>
          <p className="text-slate-400 mt-2">
            {isSetupMode ? 'Setup Your Security PIN' : 'Secure Login Access'}
          </p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {!isSetupMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
                <select
                  value={selectedUser}
                  onChange={(e) => {
                    setSelectedUser(e.target.value);
                    setPin('');
                    setNewPin('');
                    setConfirmPin('');
                    setError('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  required
                >
                  <option value="">-- Choose Account --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
            )}

            {activeUser && !isSetupMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter PIN</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 tracking-widest text-lg"
                  placeholder="****"
                  maxLength={4}
                  required
                />
              </div>
            )}

            {activeUser && isSetupMode && (
              <div className="space-y-4">
                <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm flex items-start gap-2">
                  <KeyRound size={16} className="mt-1 flex-shrink-0" />
                  <p>Welcome, {activeUser.name}. Since this is your first login, please create a secure PIN.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Create PIN</label>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 tracking-widest text-lg"
                    placeholder="****"
                    maxLength={6}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm PIN</label>
                  <input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 tracking-widest text-lg"
                    placeholder="****"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                <ShieldAlert size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedUser}
            >
              {isSetupMode ? 'Set PIN & Login' : 'Access System'} <ArrowRight size={16} className="ml-2" />
            </button>
            
            {isSetupMode && (
               <button 
                type="button" 
                onClick={() => setSelectedUser('')}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
               >
                 Cancel
               </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};