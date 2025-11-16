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

        {/* По умолчанию ведем в кабинет пользователя */}
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
