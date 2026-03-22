import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SimuladorGPS from './pages/SimuladorGPS';
import Dashboard from './pages/Dashboard';
import Rastreamento from './pages/Rastreamento';
import Itens from './pages/Itens';
import Clientes from './pages/Clientes';
import Checklists from './pages/Checklists';
import Contratos from './pages/Contratos';
import Login from './pages/Login';
import './App.css';

const Layout = ({ onLogout }) => (
  <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>
    <Sidebar onLogout={onLogout} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
      <Header onLogout={onLogout} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <Outlet />
      </main>
    </div>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('upe_auth') === '1'
  );

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    sessionStorage.removeItem('upe_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout onLogout={handleLogout} />}>
          <Route path="/dashboard"     element={<Dashboard />} />
          <Route path="/rastreamento"  element={<Rastreamento />} />
          <Route path="/simulador-gps" element={<SimuladorGPS />} />
          <Route path="/itens"         element={<Itens />} />
          <Route path="/checklists"    element={<Checklists />} />
          <Route path="/contratos"     element={<Contratos />} />
          <Route path="/clientes"      element={<Clientes />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
