import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8091';

interface TestResult {
  name: string;
  status: 'pending' | 'loading' | 'success' | 'error' | 'info';
  message: string;
  data?: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const authorizedFetch = async (path: string, init?: RequestInit) => {
  const token = localStorage.getItem('ai_admin_token');
  const headers = new Headers(init?.headers ?? undefined);

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  let data: any = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  return { response, data };
};

export const NetworkAccessTests: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: TestResult) => {
    setResults((prev) => [...prev.filter((r) => r.name !== result.name), result]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    const tests = [
      testGetAllAccesses,
      testGetAccessStats,
      testGrantAccess,
      testRevokeAccess,
      testGetClientAccesses,
      testGetNetworkAccesses,
    ];

    for (const test of tests) {
      await test();
      await delay(400);
    }

    setIsRunning(false);
  };

  const testGetAllAccesses = async () => {
    addResult({ name: 'Получение всех доступов', status: 'loading', message: 'Загружаем все доступы...' });
    try {
      const { response, data } = await authorizedFetch('/api/admin/access');
      if (response.ok) {
        addResult({
          name: 'Получение всех доступов',
          status: 'success',
          message: `✅ Получено ${Array.isArray(data) ? data.length : 0} доступов`,
          data: JSON.stringify(data, null, 2),
        });
      } else {
        addResult({
          name: 'Получение всех доступов',
          status: 'error',
          message: `❌ Ошибка: ${response.status}`,
          data: JSON.stringify(data, null, 2),
        });
      }
    } catch (error: any) {
      addResult({ name: 'Получение всех доступов', status: 'error', message: `❌ Ошибка сети: ${error.message}` });
    }
  };

  const testGetAccessStats = async () => {
    addResult({ name: 'Статистика доступов', status: 'loading', message: 'Загружаем статистику...' });
    try {
      const { response, data } = await authorizedFetch('/api/admin/access/stats');
      if (response.ok) {
        addResult({
          name: 'Статистика доступов',
          status: 'success',
          message: `✅ Всего: ${data.totalAccesses}, с лимитами: ${data.accessesWithLimits}`,
          data: JSON.stringify(data, null, 2),
        });
      } else {
        addResult({
          name: 'Статистика доступов',
          status: 'error',
          message: `❌ Ошибка: ${response.status}`,
          data: JSON.stringify(data, null, 2),
        });
      }
    } catch (error: any) {
      addResult({ name: 'Статистика доступов', status: 'error', message: `❌ Ошибка сети: ${error.message}` });
    }
  };

  const testGrantAccess = async () => {
    addResult({ name: 'Предоставление доступа', status: 'loading', message: 'Готовим данные...' });
    try {
      const [{ response: clientsResponse, data: clients }, { response: networksResponse, data: networks }] = await Promise.all([
        authorizedFetch('/api/admin/clients'),
        authorizedFetch('/api/admin/networks'),
      ]);

      if (!clientsResponse.ok || !networksResponse.ok) {
        addResult({
          name: 'Предоставление доступа',
          status: 'error',
          message: '❌ Не удалось получить клиентов или нейросети',
        });
        return;
      }

      if (!clients.length || !networks.length) {
        addResult({
          name: 'Предоставление доступа',
          status: 'info',
          message: '⚠️ Нет данных для теста (клиенты или нейросети отсутствуют)',
        });
        return;
      }

      const payload = {
        clientId: clients[0].id,
        networkId: networks[0].id,
        dailyRequestLimit: 100,
        monthlyRequestLimit: 1000,
      };

      const { response, data } = await authorizedFetch('/api/admin/access', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        addResult({
          name: 'Предоставление доступа',
          status: 'success',
          message: `✅ Доступ предоставлен: ${data.clientName} → ${data.networkDisplayName}`,
          data: JSON.stringify(data, null, 2),
        });
      } else {
        addResult({
          name: 'Предоставление доступа',
          status: 'error',
          message: `❌ Ошибка: ${response.status}`,
          data: JSON.stringify(data, null, 2),
        });
      }
    } catch (error: any) {
      addResult({ name: 'Предоставление доступа', status: 'error', message: `❌ Ошибка сети: ${error.message}` });
    }
  };

  const testRevokeAccess = async () => {
    addResult({ name: 'Отзыв доступа', status: 'loading', message: 'Загружаем текущие доступы...' });
    try {
      const { response, data } = await authorizedFetch('/api/admin/access');

      if (!response.ok) {
        addResult({
          name: 'Отзыв доступа',
          status: 'error',
          message: `❌ Ошибка получения списка: ${response.status}`,
        });
        return;
      }

      if (!Array.isArray(data) || !data.length) {
        addResult({
          name: 'Отзыв доступа',
          status: 'info',
          message: '⚠️ Нет доступов для удаления',
        });
        return;
      }

      const accessToRevoke = data[0];
      const revoke = await authorizedFetch(`/api/admin/access/${accessToRevoke.id}`, { method: 'DELETE' });

      if (revoke.response.ok) {
        addResult({
          name: 'Отзыв доступа',
          status: 'success',
          message: `✅ Доступ отозван: ${accessToRevoke.clientName} → ${accessToRevoke.networkDisplayName}`,
        });
      } else {
        addResult({
          name: 'Отзыв доступа',
          status: 'error',
          message: `❌ Ошибка: ${revoke.response.status}`,
          data: JSON.stringify(revoke.data, null, 2),
        });
      }
    } catch (error: any) {
      addResult({ name: 'Отзыв доступа', status: 'error', message: `❌ Ошибка сети: ${error.message}` });
    }
  };

  const testGetClientAccesses = async () => {
    addResult({ name: 'Доступы клиента', status: 'loading', message: 'Получаем список клиентов...' });
    try {
      const { response: clientsResponse, data: clients } = await authorizedFetch('/api/admin/clients');
      if (!clientsResponse.ok) {
        addResult({
          name: 'Доступы клиента',
          status: 'error',
          message: `❌ Ошибка получения клиентов: ${clientsResponse.status}`,
        });
        return;
      }

      if (!clients.length) {
        addResult({
          name: 'Доступы клиента',
          status: 'info',
          message: '⚠️ Клиенты отсутствуют',
        });
        return;
      }

      const { response, data } = await authorizedFetch(`/api/admin/access/client/${clients[0].id}`);
      if (response.ok) {
        addResult({
          name: 'Доступы клиента',
          status: 'success',
          message: `✅ Найдено ${Array.isArray(data) ? data.length : 0} доступов для клиента ${clients[0].name}`,
          data: JSON.stringify(data, null, 2),
        });
      } else {
        addResult({
          name: 'Доступы клиента',
          status: 'error',
          message: `❌ Ошибка: ${response.status}`,
          data: JSON.stringify(data, null, 2),
        });
      }
    } catch (error: any) {
      addResult({ name: 'Доступы клиента', status: 'error', message: `❌ Ошибка сети: ${error.message}` });
    }
  };

  const testGetNetworkAccesses = async () => {
    addResult({ name: 'Доступы нейросети', status: 'loading', message: 'Получаем список нейросетей...' });
    try {
      const { response: networksResponse, data: networks } = await authorizedFetch('/api/admin/networks');
      if (!networksResponse.ok) {
        addResult({
          name: 'Доступы нейросети',
          status: 'error',
          message: `❌ Ошибка получения нейросетей: ${networksResponse.status}`,
        });
        return;
      }

      if (!networks.length) {
        addResult({
          name: 'Доступы нейросети',
          status: 'info',
          message: '⚠️ Нейросети отсутствуют',
        });
        return;
      }

      const { response, data } = await authorizedFetch(`/api/admin/access/network/${networks[0].id}`);
      if (response.ok) {
        addResult({
          name: 'Доступы нейросети',
          status: 'success',
          message: `✅ Найдено ${Array.isArray(data) ? data.length : 0} доступов для ${networks[0].displayName}`,
          data: JSON.stringify(data, null, 2),
        });
      } else {
        addResult({
          name: 'Доступы нейросети',
          status: 'error',
          message: `❌ Ошибка: ${response.status}`,
          data: JSON.stringify(data, null, 2),
        });
      }
    } catch (error: any) {
      addResult({ name: 'Доступы нейросети', status: 'error', message: `❌ Ошибка сети: ${error.message}` });
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return '⚠️';
      default:
        return '⏸️';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'info':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">🧪 Тесты управления доступом</h2>
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isRunning ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isRunning ? '⏳ Запуск тестов...' : '🚀 Запустить все тесты'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Результаты тестов</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {results.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">Нажмите «Запустить все тесты», чтобы выполнить проверку API</div>
          ) : (
            results.map((result, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getStatusIcon(result.status)}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{result.name}</h4>
                      <p className={`text-sm ${getStatusColor(result.status)}`}>{result.message}</p>
                    </div>
                  </div>

                  {result.data && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800">Показать данные</summary>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">{result.data}</pre>
                    </details>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">📋 Что проверяем:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• GET /api/admin/access</li>
          <li>• GET /api/admin/access/stats</li>
          <li>• POST /api/admin/access</li>
          <li>• DELETE /api/admin/access/{'{id}'}</li>
          <li>• GET /api/admin/access/client/{'{id}'}</li>
          <li>• GET /api/admin/access/network/{'{id}'}</li>
        </ul>
      </div>
    </div>
  );
};

