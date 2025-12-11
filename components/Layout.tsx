import React from 'react';
import { User, UserRole } from '../types';
import { LogOut, LayoutDashboard, ShoppingCart, DollarSign, Users, FileText, Settings, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, activeTab, onTabChange, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const isAdmin = user.role === UserRole.ADMIN;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Daily Sales', icon: ShoppingCart },
    { id: 'debtors', label: 'Debtor Management', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    // Only Admin can see reports
    ...(isAdmin ? [{ id: 'reports', label: 'Reports', icon: FileText }] : []),
    // Both can see settings now (Saler for PIN change)
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support', icon: Users }
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-wider">Sales Record System (SRS)</h1>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="text-xs uppercase text-slate-400 font-semibold mb-2 px-2">Menu</div>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <item.icon size={20} className="mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-700">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={18} className="mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10 md:hidden">
          <div className="flex items-center p-4">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-600 mr-4">
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};