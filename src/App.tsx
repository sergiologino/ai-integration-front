import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { UserAuth } from './components/UserAuth';
import { MyServices } from './components/MyServices';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Проверяем наличие токена в localStorage
    const token = localStorage.getItem('ai_admin_token');
    setIsAuthenticated(!!token);

    const userToken = localStorage.getItem('user_token');
    setIsUserAuthenticated(!!userToken);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleUserLoginSuccess = () => {
    setIsUserAuthenticated(true);
  };

  const handleUserLogout = () => {
    setIsUserAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Админские экраны */}
        <Route
          path="/admin"
          element={
            isAuthenticated ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Пользовательская аутентификация */}
        <Route path="/auth" element={<UserAuth onLoginSuccess={handleUserLoginSuccess} />} />

        {/* Кабинет пользователя */}
        <Route
          path="/app"
          element={
            isUserAuthenticated ? (
              <MyServices onLogout={handleUserLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        {/* Главная страница с выбором входа */}
        <Route
          path="/"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
              <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">AI Integration Service</h1>
                <div className="space-y-4">
                  <a
                    href="/admin"
                    className="block w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Вход для администратора
                  </a>
                  <a
                    href="/app"
                    className="block w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Вход для пользователя
                  </a>
                </div>
              </div>
            </div>
          }
        />

        {/* По умолчанию ведем на главную */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
