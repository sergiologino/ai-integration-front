import React, { useEffect, useState } from 'react';
import { getStats } from '../api';
import type { UsageStats } from '../types';

export const StatsPanel: React.FC = () => {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Ошибка загрузки статистики: {error}
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center text-gray-500">Нет данных</div>;
  }

  const successRate = stats.totalRequests > 0
    ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Статистика использования</h2>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Обновить
        </button>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Всего запросов</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalRequests}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Успешных</div>
          <div className="mt-2 text-3xl font-bold text-green-600">{stats.successfulRequests}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Ошибок</div>
          <div className="mt-2 text-3xl font-bold text-red-600">{stats.failedRequests}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Успешность</div>
          <div className="mt-2 text-3xl font-bold text-indigo-600">{successRate}%</div>
        </div>
      </div>

      {/* Токены и стоимость */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Использовано токенов (всего)</div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalTokensUsed?.toLocaleString() || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Токены за текущий месяц</div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.monthlyTotalTokensUsed?.toLocaleString() || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Общая стоимость (₽)</div>
          <div className="text-3xl font-bold text-indigo-600">
            {stats.totalCostRub ? `${parseFloat(String(stats.totalCostRub)).toFixed(2)} ₽` : '0.00 ₽'}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Стоимость за месяц (USD)</div>
          <div className="text-3xl font-bold text-indigo-600">
            {stats.monthlyTotalCostUsd
              ? `$${parseFloat(String(stats.monthlyTotalCostUsd)).toFixed(2)}`
              : '$0.00'}
          </div>
        </div>
      </div>

      {/* Статистика по провайдерам за текущий месяц */}
      {stats.providerDetails && stats.providerDetails.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">За текущий месяц по провайдерам</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Провайдер</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Запросы</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Успешных</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ошибок</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Токены</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">USD</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">₽</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.providerDetails
                  .sort((a, b) => (b.totalTokensUsed || 0) - (a.totalTokensUsed || 0))
                  .map((provider) => (
                    <tr key={provider.provider}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{provider.provider}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{provider.totalRequests || 0}</td>
                      <td className="px-4 py-3 text-sm text-green-600">{provider.successfulRequests || 0}</td>
                      <td className="px-4 py-3 text-sm text-red-600">{provider.failedRequests || 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{(provider.totalTokensUsed || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-indigo-600">
                        {provider.totalCostUsd
                          ? `$${parseFloat(String(provider.totalCostUsd)).toFixed(4)}`
                          : '$0.0000'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {provider.totalCostRub
                          ? `${parseFloat(String(provider.totalCostRub)).toFixed(2)} ₽`
                          : '0.00 ₽'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Детальная статистика по нейросетям */}
      {stats.networkDetails && stats.networkDetails.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика по нейросетям</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Нейросеть</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Запросы</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Успешных</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ошибок</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Токенов</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Стоимость</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">₽/токен</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.networkDetails
                  .sort((a, b) => (b.totalRequests || 0) - (a.totalRequests || 0))
                  .map((network: any) => (
                    <tr key={network.networkId}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{network.networkDisplayName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{network.totalRequests || 0}</td>
                      <td className="px-4 py-3 text-sm text-green-600">{network.successfulRequests || 0}</td>
                      <td className="px-4 py-3 text-sm text-red-600">{network.failedRequests || 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{(network.totalTokensUsed || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-indigo-600">
                        {network.totalCostRub ? `${parseFloat(network.totalCostRub).toFixed(2)} ₽` : '0.00 ₽'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {network.costPerTokenRub ? `${parseFloat(network.costPerTokenRub).toFixed(8)} ₽` : '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Запросы по нейросетям (краткая версия) */}
      {Object.keys(stats.requestsByNetwork || {}).length > 0 && !stats.networkDetails && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Запросы по нейросетям</h3>
          <div className="space-y-3">
            {Object.entries(stats.requestsByNetwork)
              .sort(([, a], [, b]) => b - a)
              .map(([network, count]) => (
                <div key={network} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">{network}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Детальная статистика по клиентам */}
      {stats.clientDetails && stats.clientDetails.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика по клиентам</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиент</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Запросы</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Успешных</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ошибок</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Токенов</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Стоимость</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.clientDetails
                  .sort((a, b) => (b.totalRequests || 0) - (a.totalRequests || 0))
                  .map((client: any) => (
                    <tr key={client.clientId}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{client.clientName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{client.totalRequests || 0}</td>
                      <td className="px-4 py-3 text-sm text-green-600">{client.successfulRequests || 0}</td>
                      <td className="px-4 py-3 text-sm text-red-600">{client.failedRequests || 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{(client.totalTokensUsed || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-indigo-600">
                        {client.totalCostRub ? `${parseFloat(client.totalCostRub).toFixed(2)} ₽` : '0.00 ₽'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Запросы по клиентам (краткая версия) */}
      {Object.keys(stats.requestsByClient || {}).length > 0 && !stats.clientDetails && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Запросы по клиентам</h3>
          <div className="space-y-3">
            {Object.entries(stats.requestsByClient)
              .sort(([, a], [, b]) => b - a)
              .map(([client, count]) => (
                <div key={client} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">{client}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

