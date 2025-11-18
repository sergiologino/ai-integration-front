import React, { useState } from 'react';
import { clearToken } from '../api';
import { NetworksManager } from './NetworksManager';
import { ClientsManager } from './ClientsManager';
import { NetworkAccessManager } from './NetworkAccessManager';
import { NetworkAccessTests } from './NetworkAccessTests';
import { LogsViewer } from './LogsViewer';
import { StatsPanel } from './StatsPanel';
import { PaymentStatsPanel } from './PaymentStatsPanel';

type Tab = 'stats' | 'networks' | 'clients' | 'access' | 'tests' | 'logs' | 'payments';

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('stats');

  const handleLogout = () => {
    clearToken();
    onLogout();
  };

  const tabs = [
    { id: 'stats' as Tab, label: '📊 Статистика', icon: '📊' },
    { id: 'networks' as Tab, label: '🧠 Нейросети', icon: '🧠' },
    { id: 'clients' as Tab, label: '🔑 Клиенты', icon: '🔑' },
    { id: 'access' as Tab, label: '🔗 Доступы', icon: '🔗' },
    { id: 'payments' as Tab, label: '💳 Оплаты', icon: '💳' },
    { id: 'tests' as Tab, label: '🧪 Тесты', icon: '🧪' },
    { id: 'logs' as Tab, label: '📋 Логи', icon: '📋' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AI Integration Admin</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Выйти
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'stats' && <StatsPanel />}
        {activeTab === 'networks' && <NetworksManager />}
        {activeTab === 'clients' && <ClientsManager />}
        {activeTab === 'access' && <NetworkAccessManager />}
        {activeTab === 'payments' && <PaymentStatsPanel />}
        {activeTab === 'tests' && <NetworkAccessTests />}
        {activeTab === 'logs' && <LogsViewer />}
      </main>
    </div>
  );
};

