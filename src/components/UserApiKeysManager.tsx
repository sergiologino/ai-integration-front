import React, { useEffect, useState } from 'react';
import { getUserApiKeys, saveUserApiKey, deleteUserApiKey, checkUserApiKeyAccess, getAvailableNetworks, getMyClients, userFetch } from '../api';
import { Lock, Trash2, Plus, AlertCircle } from 'lucide-react';

interface Props {
  clientId?: string;
  onBack?: () => void;
}

export const UserApiKeysManager: React.FC<Props> = ({ clientId, onBack }) => {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [availableNetworks, setAvailableNetworks] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>(clientId || '');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadApiKeys(selectedClient);
    }
  }, [selectedClient]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [accessData, clientsData, networksData] = await Promise.all([
        checkUserApiKeyAccess(),
        getMyClients(),
        getAvailableNetworks()
      ]);
      setHasAccess(accessData.hasAccess);
      setClients(clientsData);
      setAvailableNetworks(networksData.map((n: any) => ({
        id: String(n.id || n.code || n.name),
        code: n.code || n.name || n.id,
        displayName: n.displayName || n.label || n.code || n.name
      })));
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const loadApiKeys = async (clientId: string) => {
    try {
      const keys = await getUserApiKeys(clientId);
      setApiKeys(keys);
    } catch (e: any) {
      setApiKeys([]);
    }
  };

  const handleSave = async () => {
    if (!selectedClient || !selectedNetwork || !apiKey.trim()) {
      setError('Заполните все поля');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await saveUserApiKey({
        clientId: selectedClient,
        networkId: selectedNetwork,
        apiKey: apiKey.trim()
      });
      setIsModalOpen(false);
      setApiKey('');
      setSelectedNetwork('');
      loadApiKeys(selectedClient);
    } catch (e: any) {
      setError(e.message || 'Ошибка сохранения ключа');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (networkId: string) => {
    if (!confirm('Удалить API ключ для этой нейросети?')) return;
    
    try {
      await deleteUserApiKey(selectedClient, networkId);
      loadApiKeys(selectedClient);
    } catch (e: any) {
      setError(e.message || 'Ошибка удаления ключа');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        {onBack && (
          <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 mb-2">
            ← Назад
          </button>
        )}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            Функция недоступна
          </h3>
          <p className="text-yellow-800 mb-4">
            Использование собственных API ключей доступно только для платного тарифа.
          </p>
          <p className="text-sm text-yellow-700">
            Оформите платную подписку, чтобы использовать свои API ключи для нейросетей.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {onBack && (
        <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 mb-2">
          ← Назад
        </button>
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Мои API ключи</h2>
          <p className="text-gray-600 mt-1">Управляйте собственными API ключами для нейросетей</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Добавить ключ
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Выбор клиента */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Выберите клиентское приложение
        </label>
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          disabled={!!clientId}
        >
          <option value="">-- Выберите приложение --</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name} {client.description ? `(${client.description})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Список ключей */}
      {selectedClient && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Сохраненные API ключи ({apiKeys.length})
          </h3>
          
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p>Нет сохраненных API ключей</p>
              <p className="text-sm mt-2">Добавьте ключ для использования собственных API ключей нейросетей</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key: any) => (
                <div
                  key={key.id}
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{key.neuralNetworkDisplayName}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {key.clientApplicationName} • {key.neuralNetworkName}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Обновлен: {new Date(key.updatedAt).toLocaleString('ru-RU')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(key.neuralNetworkId)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Модалка добавления ключа */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Добавить API ключ</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Клиентское приложение *
                  </label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">-- Выберите --</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Нейросеть *
                  </label>
                  <select
                    value={selectedNetwork}
                    onChange={(e) => setSelectedNetwork(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">-- Выберите --</option>
                    {availableNetworks.map(network => (
                      <option key={network.id} value={network.id}>
                        {network.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API ключ *
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Введите ваш API ключ"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ключ будет зашифрован и безопасно сохранен
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={saving}
                >
                  Отмена
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !selectedClient || !selectedNetwork || !apiKey.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

