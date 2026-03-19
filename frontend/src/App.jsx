import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SimuladorGPS from './pages/SimuladorGPS';
import Dashboard from './pages/Dashboard';
import Rastreamento from './pages/Rastreamento';
import Itens from './pages/Itens';
import './App.css';

const Layout = () => (
  <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>
    <Sidebar />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
      <Header />
      <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <Outlet />
      </main>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/rastreamento" element={<Rastreamento />} />
          <Route path="/simulador-gps"element={<SimuladorGPS />} />
          <Route path="/itens"        element={<Itens />} />
          <Route path="/checklists"   element={<PlaceholderPage title="Checklists" sub="Inspeções e laudos" />} />
          <Route path="/contratos"    element={<PlaceholderPage title="Contratos"  sub="Gestão de contratos" />} />
          <Route path="/clientes"     element={<PlaceholderPage title="Clientes"   sub="Cadastro de clientes" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function PlaceholderPage({ title, sub }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
      <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)', fontSize: 13 }}>
        🚧 {title} — Em construção
      </p>
      <p style={{ color: 'var(--text-subtle)', fontSize: 11 }}>{sub}</p>
    </div>
  );
}

export default App;
