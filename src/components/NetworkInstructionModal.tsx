import React, { useState } from 'react';

interface NetworkInstruction {
  id: string;
  code?: string; // code (name) нейросети для использования в networkName
  displayName: string;
  provider: string;
  networkType: string;
  connectionInstruction?: string;
  apiKey: string; // API ключ клиента для примера
  apiBaseUrl: string; // Базовый URL API
}

interface Props {
  network: NetworkInstruction;
  onClose: () => void;
}

export const NetworkInstructionModal: React.FC<Props> = ({ network, onClose }) => {
  const [copiedRequest, setCopiedRequest] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  // Генерируем пример запроса на основе типа сети
  const generateRequestExample = (): string => {
    const networkName = network.code || network.id;
    if (network.networkType === 'chat') {
      return JSON.stringify({
        userId: "user123",
        networkName: networkName,
        requestType: "chat",
        payload: {
          messages: [
            {
              role: "user",
              content: "Привет! Расскажи интересный факт о космосе."
            }
          ]
        }
      }, null, 2);
    } else if (network.networkType === 'transcription') {
      return JSON.stringify({
        userId: "user123",
        networkName: networkName,
        requestType: "transcription",
        payload: {
          audio: "base64_encoded_audio_data_here"
        }
      }, null, 2);
    } else if (network.networkType === 'embedding') {
      return JSON.stringify({
        userId: "user123",
        networkName: networkName,
        requestType: "embedding",
        payload: {
          text: "Текст для получения векторного представления"
        }
      }, null, 2);
    }
    return JSON.stringify({
      userId: "user123",
      networkName: networkName,
      requestType: network.networkType,
      payload: {}
    }, null, 2);
  };

  // Генерируем пример ответа
  const generateResponseExample = (): string => {
    const networkName = network.code || network.id;
    if (network.networkType === 'chat') {
      return JSON.stringify({
        requestId: "550e8400-e29b-41d4-a716-446655440000",
        status: "success",
        networkUsed: networkName,
        response: {
          choices: [
            {
              message: {
                role: "assistant",
                content: "Космос полон удивительных фактов! Например, на Сатурне и Юпитере идут дожди из алмазов."
              }
            }
          ]
        },
        executionTimeMs: 1234,
        tokensUsed: 45,
        usageLimitInfo: {
          used: 10,
          limit: 1000,
          remaining: 990,
          period: "daily"
        }
      }, null, 2);
    } else if (network.networkType === 'transcription') {
      return JSON.stringify({
        requestId: "550e8400-e29b-41d4-a716-446655440000",
        status: "success",
        networkUsed: networkName,
        response: {
          text: "Распознанный текст из аудио"
        },
        executionTimeMs: 2345,
        tokensUsed: 0
      }, null, 2);
    } else if (network.networkType === 'embedding') {
      return JSON.stringify({
        requestId: "550e8400-e29b-41d4-a716-446655440000",
        status: "success",
        networkUsed: networkName,
        response: {
          embedding: [0.123, -0.456, 0.789, /* ... */]
        },
        executionTimeMs: 567,
        tokensUsed: 12
      }, null, 2);
    }
    return JSON.stringify({
      requestId: "550e8400-e29b-41d4-a716-446655440000",
      status: "success",
      networkUsed: networkName,
      response: {}
    }, null, 2);
  };

  const requestExample = generateRequestExample();
  const responseExample = generateResponseExample();
  const apiBaseUrl = network.apiBaseUrl || 'https://sergiologino-zettelkastenapp-ai-integration-bce3.twc1.net';

  const copyToClipboard = async (text: string, type: 'request' | 'response') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'request') {
        setCopiedRequest(true);
        setTimeout(() => setCopiedRequest(false), 2000);
      } else {
        setCopiedResponse(true);
        setTimeout(() => setCopiedResponse(false), 2000);
      }
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{network.displayName}</h3>
              <p className="text-sm text-gray-500 mt-1">{network.provider} • {network.networkType}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Описание */}
          {network.connectionInstruction && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Описание</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                {network.connectionInstruction}
              </div>
            </div>
          )}

          {/* Эндпоинт */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Эндпоинт</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <code className="text-sm text-gray-800">
                POST {apiBaseUrl}/api/ai/process
              </code>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              В заголовке запроса обязательно укажите: <code className="bg-gray-100 px-1 rounded">X-API-Key: {network.apiKey}</code>
            </p>
          </div>

          {/* Пример запроса */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold text-gray-900">Пример запроса</h4>
              <button
                onClick={() => copyToClipboard(requestExample, 'request')}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
              >
                {copiedRequest ? (
                  <>
                    <span>✓</span> Скопировано
                  </>
                ) : (
                  <>
                    <span>📋</span> Копировать
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400 font-mono text-left whitespace-pre">
                <code>{requestExample}</code>
              </pre>
            </div>
          </div>

          {/* Пример ответа */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold text-gray-900">Пример ответа</h4>
              <button
                onClick={() => copyToClipboard(responseExample, 'response')}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
              >
                {copiedResponse ? (
                  <>
                    <span>✓</span> Скопировано
                  </>
                ) : (
                  <>
                    <span>📋</span> Копировать
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400 font-mono text-left whitespace-pre">
                <code>{responseExample}</code>
              </pre>
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-semibold text-blue-900 mb-2">Важно:</h5>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Всегда указывайте заголовок <code className="bg-blue-100 px-1 rounded">X-API-Key</code> с вашим API ключом</li>
              <li>Поле <code className="bg-blue-100 px-1 rounded">networkName</code> можно не указывать для автовыбора нейросети</li>
              <li>Поле <code className="bg-blue-100 px-1 rounded">userId</code> должно быть уникальным для каждого пользователя вашего приложения</li>
              <li>В ответе вы получите <code className="bg-blue-100 px-1 rounded">requestId</code> для отслеживания запроса в логах</li>
            </ul>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

