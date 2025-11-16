import React, { useEffect, useState } from 'react';
import { getMyClients, createMyClient, updateMyClient, deleteMyClient, regenerateMyApiKey, getAvailableNetworks, setClientNetworks, userLogout } from '../api';

interface Props {
  onLogout: () => void;
}

export const MyServices: React.FC<Props> = ({ onLogout }) => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [networksModal, setNetworksModal] = useState<any | null>(null);
  const [availableNetworks, setAvailableNetworks] = useState<any[]>([]);
  const [selectedNetworkIds, setSelectedNetworkIds] = useState<string[]>([]);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const data = await getMyClients();
      setClients(data);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEdit = (c: any) => {
    setEditing(c);
    setName(c.name);
    setDescription(c.description);
    setIsActive(c.isActive);
    setIsModalOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) await updateMyClient(editing.id, { name, description, isActive });
      else await createMyClient({ name, description, isActive });
      setIsModalOpen(false);
      load();
    } catch (e: any) {
      alert(e.message || 'Ошибка');
    }
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`Удалить сервис "${title}"?`)) return;
    try {
      await deleteMyClient(id);
      load();
    } catch (e: any) {
      alert(e.message || 'Ошибка удаления');
    }
  };

  const regenKey = async (id: string) => {
    if (!confirm('Перегенерировать API ключ? Старый перестанет работать.')) return;
    try {
      await regenerateMyApiKey(id);
      load();
    } catch (e: any) {
      alert(e.message || 'Ошибка генерации');
    }
  };

  const openNetworks = async (client: any) => {
    setNetworksModal(client);
    setSelectedNetworkIds(client.networkIds || []);
    try {
      const nets = await getAvailableNetworks();
      setAvailableNetworks(nets);
    } catch (e) {
      // ignore
    }
  };

  const toggleNetwork = (id: string) => {
    setSelectedNetworkIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const saveNetworks = async () => {
    if (!networksModal) return;
    try {
      await setClientNetworks(networksModal.id, selectedNetworkIds);
      setNetworksModal(null);
      load();
    } catch (e: any) {
      alert(e.message || 'Ошибка сохранения сетей');
    }
  };

  const doLogout = () => {
    userLogout();
    onLogout();
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Мои сервисы</h1>
          <button onClick={doLogout} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">Выйти</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Управляйте своими API ключами и доступами к нейросетям.</p>
          <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">+ Добавить сервис</button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

        <div className="grid gap-6">
          {clients.map(c => (
            <div key={c.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{c.name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {c.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                  <div className="mt-4 text-xs text-gray-500">
                    <div>ID: {c.id}</div>
                  </div>
                  <div className="mt-3">
                    <label className="text-xs font-medium text-gray-500">API Key</label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="bg-gray-100 rounded px-3 py-2 text-sm">{c.apiKey}</code>
                      <button onClick={() => navigator.clipboard.writeText(c.apiKey)} className="text-sm px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Копировать</button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button onClick={() => openEdit(c)} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">Редактировать</button>
                  <button onClick={() => regenKey(c.id)} className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm">Новый ключ</button>
                  <button onClick={() => remove(c.id, c.name)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Удалить</button>
                  <button onClick={() => openNetworks(c)} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">Нейросети</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Модалка сервиса */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">{editing ? 'Редактировать сервис' : 'Создать сервис'}</h3>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                  <input className="w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Описание *</label>
                  <textarea className="w-full border rounded px-3 py-2" rows={3} value={description} onChange={e => setDescription(e.target.value)} required />
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                  Активен
                </label>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Отмена</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">{editing ? 'Сохранить' : 'Создать'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Модалка выбора нейросетей */}
      {networksModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setNetworksModal(null)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <h3 className="text-xl font-bold mb-4">Доступные нейросети</h3>
              <div className="max-h-[60vh] overflow-y-auto space-y-2">
                {availableNetworks.map(n => (
                  <label key={n.id} className="flex items-center gap-3 border rounded p-3">
                    <input type="checkbox" checked={selectedNetworkIds.includes(n.id)} onChange={() => toggleNetwork(n.id)} />
                    <div className="flex-1">
                      <div className="font-medium">{n.displayName}</div>
                      <div className="text-xs text-gray-500">{n.provider} • {n.modelName}</div>
                    </div>
                    {n.isActive ? <span className="text-green-600 text-xs">Активна</span> : <span className="text-red-600 text-xs">Неактивна</span>}
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setNetworksModal(null)} className="px-4 py-2 border rounded">Отмена</button>
                <button onClick={saveNetworks} className="px-4 py-2 bg-indigo-600 text-white rounded">Сохранить</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

