import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { SalesModule } from './components/SalesModule';
import { ExpensesModule } from './components/ExpensesModule';
import { DebtorsModule } from './components/DebtorsModule';
import { ReportsModule } from './components/ReportsModule';
import { Settings } from './components/Settings';
import Diagnostics from './components/Diagnostics';
import { User, UserRole } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'sales': return <SalesModule />;
      case 'debtors': return <DebtorsModule />;
      case 'expenses': return <ExpensesModule user={user} />;
      case 'reports': 
        return user.role === UserRole.ADMIN ? <ReportsModule /> : <div className="text-red-500 p-4">Access Denied</div>;
      case 'settings': 
        // Both can access settings, but component handles permissions internally
        return <Settings currentUser={user} />;
      case 'support':
        return <Diagnostics />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout 
      user={user} 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}