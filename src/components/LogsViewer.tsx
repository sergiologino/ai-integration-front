import React, { useEffect, useState } from 'react';
import { getLogs } from '../api';
import type { RequestLog } from '../types';

export const LogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);
  const [showPretty, setShowPretty] = useState<boolean>(true);

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value || '');
  };

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getLogs(page, 20);
      setLogs(data.content);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const formatUsd = (value?: number | string | null) => {
    if (value === undefined || value === null || value === '') {
      return '-';
    }
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(num)) {
      return '-';
    }
    return `$${num.toFixed(4)}`;
  };

  const formatTokens = (value?: number | null) => {
    if (value === undefined || value === null) {
      return '-';
    }
    return value.toLocaleString('ru-RU');
  };

  const truncateText = (text: string, maxLength: number = 140) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const tryPrettyJson = (text: string | undefined | null) => {
    if (!text) return '';
    const trimmed = text.trim();
    if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) {
      return text; // не JSON — показываем как есть
    }
    try {
      const parsed = JSON.parse(trimmed);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return text; // невалидный JSON — оставляем исходный
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Логи запросов</h2>
        <button
          onClick={loadLogs}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Обновить
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Таблица логов */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                Дата
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Клиент
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-56">
                Нейросеть
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                User ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[360px]">
                Промпт
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Провайдер
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Токены
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                USD
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedLog(log);
                  setShowPretty(true);
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(log.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.clientApplicationName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.neuralNetworkName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.externalUserId.substring(0, 8)}...
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="max-w-[360px] break-all truncate">
                    {truncateText(log.prompt, 200)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      log.success
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {log.success ? 'Успех' : 'Ошибка'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.provider || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {formatTokens(log.tokensUsed)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700 font-medium">
                  {formatUsd(log.costUsd)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className="text-gray-400">Открыть</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Страница {page + 1} из {totalPages}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Назад
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Вперёд
          </button>
        </div>
      </div>

      {/* Модальное окно с деталями лога */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setSelectedLog(null)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Детали запроса</h3>
                  <div className="text-xs text-gray-500 mt-1">ID: <span className="font-mono">{selectedLog.id}</span></div>
                </div>
                <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500">Дата</div>
                  <div className="text-sm text-gray-900">{formatDate(selectedLog.createdAt)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Статус</div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedLog.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedLog.success ? 'Успех' : 'Ошибка'}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Клиент</div>
                  <div className="text-sm text-gray-900">{selectedLog.clientApplicationName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Нейросеть</div>
                  <div className="text-sm text-gray-900">{selectedLog.neuralNetworkName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">User ID</div>
                  <div className="text-sm text-gray-900 font-mono break-all">{selectedLog.externalUserId}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Провайдер</div>
                  <div className="text-sm text-gray-900">{selectedLog.provider || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Токены</div>
                  <div className="text-sm text-gray-900">{formatTokens(selectedLog.tokensUsed)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Стоимость (USD)</div>
                  <div className="text-sm text-gray-900">{formatUsd(selectedLog.costUsd)}</div>
                </div>
              </div>

              {/* Prompt */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Промпт</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowPretty(!showPretty)} className="text-xs text-indigo-600 hover:underline">
                      {showPretty ? 'Показать как есть' : 'Форматировать'}
                    </button>
                    <button onClick={() => copyToClipboard(selectedLog.prompt)} className="text-xs text-gray-600 hover:underline">
                      Скопировать
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded border border-gray-200 max-h-56 overflow-y-auto mt-2">
                  <pre className="text-sm text-gray-900 whitespace-pre-wrap break-all">
                    {showPretty ? tryPrettyJson(selectedLog.prompt) : (selectedLog.prompt || '')}
                  </pre>
                </div>
              </div>

              {/* Response */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Ответ</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowPretty(!showPretty)} className="text-xs text-indigo-600 hover:underline">
                      {showPretty ? 'Показать как есть' : 'Форматировать'}
                    </button>
                    <button onClick={() => copyToClipboard(selectedLog.response)} className="text-xs text-gray-600 hover:underline">
                      Скопировать
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded border border-gray-200 max-h-64 overflow-y-auto mt-2">
                  <pre className="text-sm text-gray-900 whitespace-pre-wrap break-all">
                    {showPretty ? tryPrettyJson(selectedLog.response) : (selectedLog.response || '')}
                  </pre>
                </div>
              </div>

              {selectedLog.errorMessage && (
                <div className="mb-2">
                  <label className="text-sm font-medium text-red-600 block mb-2">Ошибка</label>
                  <div className="bg-red-50 p-4 rounded border border-red-200">
                    <pre className="text-sm text-red-700 whitespace-pre-wrap">{selectedLog.errorMessage}</pre>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

