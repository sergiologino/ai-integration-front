import React, { useEffect, useState } from 'react';
import { getMyClients, getAvailableNetworks, userFetch } from '../api';
import { NetworkInstructionModal } from './NetworkInstructionModal';
import { ArrowUp, ArrowDown, X, Plus, Trash2 } from 'lucide-react';

interface Props {
  onBack: () => void;
}

interface NetworkItem {
  networkId: string;
  networkName: string;
  networkDisplayName: string;
  provider: string;
  networkType: string;
  priority: number;
}

export const UserNetworkManager: React.FC<Props> = ({ onBack }) => {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [availableNetworks, setAvailableNetworks] = useState<any[]>([]);
  const [selectedNetworks, setSelectedNetworks] = useState<NetworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [instructionModal, setInstructionModal] = useState<{ network: any; apiKey: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientNetworks(selectedClient.id);
    }
  }, [selectedClient]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [clientsData, networksData] = await Promise.all([
        getMyClients(),
        getAvailableNetworks()
      ]);
      setClients(clientsData);
      setAvailableNetworks(networksData.map((n: any) => ({
        id: String(n.id || n.code || n.name),
        code: n.code || n.name || n.id,
        displayName: n.displayName || n.label || n.code || n.name,
        provider: n.provider || '',
        networkType: n.networkType || '',
        connectionInstruction: n.connectionInstruction || ''
      })));
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const loadClientNetworks = async (clientId: string) => {
    try {
      const networks = await userFetch<any[]>(`/api/user/clients/${clientId}/networks`);
      setSelectedNetworks(networks.map((n: any) => ({
        networkId: String(n.networkId),
        networkName: n.networkName || n.networkCode,
        networkDisplayName: n.networkDisplayName || n.networkName,
        provider: n.provider || '',
        networkType: n.networkType || '',
        priority: n.priority || 100
      })));
    } catch (e: any) {
      // Если нет подключенных сетей, просто очищаем список
      setSelectedNetworks([]);
    }
  };

  const handleClientSelect = (client: any) => {
    setSelectedClient(client);
  };

  const handleAddNetwork = (network: any) => {
    // Проверяем, не добавлена ли уже эта сеть
    if (selectedNetworks.some(n => n.networkId === network.id)) {
      return;
    }
    
    const newNetwork: NetworkItem = {
      networkId: network.id,
      networkName: network.code,
      networkDisplayName: network.displayName,
      provider: network.provider,
      networkType: network.networkType,
      priority: selectedNetworks.length > 0 
        ? Math.max(...selectedNetworks.map(n => n.priority)) + 10 
        : 10
    };
    setSelectedNetworks([...selectedNetworks, newNetwork]);
  };

  const handleRemoveNetwork = (networkId: string) => {
    setSelectedNetworks(selectedNetworks.filter(n => n.networkId !== networkId));
  };

  const handlePriorityChange = (networkId: string, delta: number) => {
    setSelectedNetworks(selectedNetworks.map(n => {
      if (n.networkId === networkId) {
        const newPriority = Math.max(1, n.priority + delta);
        return { ...n, priority: newPriority };
      }
      return n;
    }));
  };

  const handleSave = async () => {
    if (!selectedClient) return;
    
    setSaving(true);
    setError('');
    try {
      const networks = selectedNetworks.map((n, index) => ({
        networkId: n.networkId,
        priority: n.priority
      }));
      
      await userFetch(`/api/user/clients/${selectedClient.id}/networks`, {
        method: 'PUT',
        body: JSON.stringify({ networks })
      });
      
      alert('Нейросети успешно сохранены');
      loadClientNetworks(selectedClient.id);
    } catch (e: any) {
      setError(e.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenInstruction = (network: NetworkItem) => {
    if (!selectedClient) return;
    const fullNetwork = availableNetworks.find(n => n.id === network.networkId);
    if (fullNetwork) {
      setInstructionModal({
        network: {
          ...fullNetwork,
          apiKey: selectedClient.apiKey,
          apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8091'
        },
        apiKey: selectedClient.apiKey
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-800 mb-2"
          >
            ← Назад к сервисам
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Управление нейросетями</h2>
          <p className="text-gray-600 mt-1">Выберите клиентское приложение и настройте подключенные нейросети</p>
        </div>
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
          value={selectedClient?.id || ''}
          onChange={(e) => {
            const client = clients.find(c => c.id === e.target.value);
            setSelectedClient(client || null);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">-- Выберите приложение --</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name} {client.description ? `(${client.description})` : ''}
            </option>
          ))}
        </select>
      </div>

      {selectedClient && (
        <>
          {/* Доступные нейросети */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Доступные нейросети</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableNetworks
                .filter(n => !selectedNetworks.some(sn => sn.networkId === n.id))
                .map(network => (
                  <div
                    key={network.id}
                    className="border rounded-lg p-4 hover:border-indigo-500 transition-colors cursor-pointer"
                    onClick={() => handleAddNetwork(network)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{network.displayName}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddNetwork(network);
                        }}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      {network.provider} • {network.networkType}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Выбранные нейросети с приоритетами */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Подключенные нейросети ({selectedNetworks.length})
              </h3>
              {selectedNetworks.length > 0 && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              )}
            </div>

            {selectedNetworks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Нет подключенных нейросетей</p>
                <p className="text-sm mt-2">Выберите нейросети из списка выше</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedNetworks
                  .sort((a, b) => a.priority - b.priority)
                  .map((network, index) => (
                    <div
                      key={network.networkId}
                      className="border rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => handlePriorityChange(network.networkId, -10)}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            title="Повысить приоритет"
                          >
                            <ArrowUp size={20} />
                          </button>
                          <span className="text-xs font-semibold text-indigo-600">
                            {network.priority}
                          </span>
                          <button
                            onClick={() => handlePriorityChange(network.networkId, 10)}
                            disabled={index === selectedNetworks.length - 1}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            title="Понизить приоритет"
                          >
                            <ArrowDown size={20} />
                          </button>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{network.networkDisplayName}</div>
                          <div className="text-sm text-gray-500">
                            {network.provider} • {network.networkType}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenInstruction(network)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          📖 Инструкция
                        </button>
                        <button
                          onClick={() => handleRemoveNetwork(network.networkId)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {selectedNetworks.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                <p><strong>Приоритет:</strong> Чем меньше число, тем выше приоритет нейросети при автовыборе.</p>
                <p className="mt-1">Используйте стрелки ↑↓ для изменения приоритета.</p>
              </div>
            )}
          </div>
        </>
      )}

      {instructionModal && (
        <NetworkInstructionModal
          network={{
            id: instructionModal.network.id,
            code: instructionModal.network.code,
            displayName: instructionModal.network.displayName,
            provider: instructionModal.network.provider,
            networkType: instructionModal.network.networkType,
            connectionInstruction: instructionModal.network.connectionInstruction,
            apiKey: instructionModal.apiKey,
            apiBaseUrl: instructionModal.network.apiBaseUrl
          }}
          onClose={() => setInstructionModal(null)}
        />
      )}
    </div>
  );
};

