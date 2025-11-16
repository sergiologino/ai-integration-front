import React, { useState } from 'react';
import { userLogin, userRegister, oauthSignIn } from '../api';

interface Props {
  onLoginSuccess: () => void;
}

export const UserAuth: React.FC<Props> = ({ onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await userLogin({ email, password });
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const doRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (!name.trim()) throw new Error('Укажите имя');
      if (password !== repeatPassword) throw new Error('Пароли не совпадают');
      await userRegister({ name, email, password });
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(''); setLoading(true);
    try {
      // Открываем popup OAuth (упрощенно: пока ожидаем id_token из prompt)
      // Здесь предполагается, что фронт получает id_token от Google One Tap / OAuth flow
      const idToken = await window.prompt('Вставьте Google ID token');
      if (!idToken) return;
      await oauthSignIn('google', idToken);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Ошибка входа через Google');
    } finally {
      setLoading(false);
    }
  };

  const handleYandex = async () => {
    setError(''); setLoading(true);
    try {
      const token = await window.prompt('Вставьте Yandex OAuth token');
      if (!token) return;
      await oauthSignIn('yandex', token);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Ошибка входа через Yandex');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setTab('login')}
            className={`px-4 py-2 rounded ${tab === 'login' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Войти
          </button>
          <button
            onClick={() => setTab('register')}
            className={`px-4 py-2 rounded ${tab === 'register' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Регистрация
          </button>
        </div>

        {error && <div className="mb-4 bg-red-50 text-red-700 border border-red-200 rounded px-3 py-2">{error}</div>}

        {tab === 'login' ? (
          <form onSubmit={doLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input className="w-full border rounded px-3 py-2" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <input className="w-full border rounded px-3 py-2" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button disabled={loading} className="w-full bg-indigo-600 text-white rounded py-2 hover:bg-indigo-700">{loading ? 'Вход...' : 'Войти'}</button>
          </form>
        ) : (
          <form onSubmit={doRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
              <input className="w-full border rounded px-3 py-2" required value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input className="w-full border rounded px-3 py-2" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                <input className="w-full border rounded px-3 py-2" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Повтор пароля</label>
                <input className="w-full border rounded px-3 py-2" type="password" required value={repeatPassword} onChange={e => setRepeatPassword(e.target.value)} />
              </div>
            </div>
            <button disabled={loading} className="w-full bg-indigo-600 text-white rounded py-2 hover:bg-indigo-700">{loading ? 'Регистрация...' : 'Зарегистрироваться'}</button>
          </form>
        )}

        <div className="my-6 flex items-center">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="px-3 text-gray-500 text-sm">или через</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleGoogle} className="border rounded py-2 hover:bg-gray-50 flex items-center justify-center gap-2">
            <img alt="Google" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" />
            Google
          </button>
          <button onClick={handleYandex} className="border rounded py-2 hover:bg-gray-50 flex items-center justify-center gap-2">
            <img alt="Yandex" src="https://yastatic.net/s3/doc-binary/freeze/design/_/Yandex_icon.svg" className="w-5 h-5" />
            Yandex
          </button>
        </div>
      </div>
    </div>
  );
};

