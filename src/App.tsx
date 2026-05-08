import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { InventoryView } from './components/InventoryView';
import { SalesView } from './components/SalesView';
import { ReportsView } from './components/ReportsView';
import { ProfileView } from './components/ProfileView';
import { HomeView } from './components/HomeView';
import { LotJournalView } from './components/LotJournalView';
import { EmployeesView } from './components/EmployeesView';
import { AppView } from './types';
import { LogIn, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAuthToken, removeAuthToken, setSession, getUserRole, getUserName } from './lib/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('Home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [role, setRole] = useState<'admin'|'employee'>('admin');
  const [userName, setUserName] = useState('Admin');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
      setRole(getUserRole());
      setUserName(getUserName());
    }
    setLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const response = await fetch('/api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok && data.token) {
        const r = data.role || 'admin';
        const n = data.user?.name || 'Admin';
        setSession(data.token, r, data.user?.id || null, n);
        setRole(r);
        setUserName(n);
        setIsAuthenticated(true);
        // Employees go straight to New Sale
        if (r === 'employee') setCurrentView('New Sale');
      } else {
        setLoginError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setLoginError('Error de conexión con el servidor');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bento-grid-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bento-card text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl opacity-50" />

            <div className="relative">
              <div className="bg-slate-900 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-200/50 rotate-3">
                <ShoppingBag className="text-white w-10 h-10 -rotate-3" />
              </div>
              
              <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tighter">
                Machi´s<span className="text-blue-600 text-shadow-glow"> Shop</span>
              </h1>
              
              <p className="text-slate-500 mb-10 text-lg leading-relaxed">
                Gestión inteligente de inventario para tu tienda.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="text"
                  placeholder="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all font-medium"
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all font-medium"
                />
                
                {loginError && <p className="text-red-500 text-sm font-bold">{loginError}</p>}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-4 bg-slate-900 text-white font-bold py-5 px-6 rounded-2xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-300 transform active:scale-[0.98] disabled:opacity-50"
                >
                  <LogIn className="w-5 h-5" />
                  {isLoggingIn ? 'Iniciando sesión...' : 'Ingresar'}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'Inventory': return <InventoryView role={role} />;
      case 'New Sale': return <SalesView />;
      case 'Reports': return <ReportsView role={role} />;
      case 'LotJournal': return role === 'admin' ? <LotJournalView /> : null;
      case 'Employees': return role === 'admin' ? <EmployeesView /> : null;
      case 'Profile': return <ProfileView user={{ email: userName, role }} onLogout={handleLogout} />;
      default: return role === 'admin' ? <HomeView setView={setCurrentView} /> : <SalesView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        role={role}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bento-grid-bg">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 py-4 px-6 flex justify-between items-center sm:hidden sticky top-0 z-50">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100 text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-white w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight italic">Machi´s Shop</h2>
          </div>
          <div className="w-9 h-9 rounded-xl border-2 border-white shadow-sm ring-1 ring-slate-100 bg-slate-200 flex items-center justify-center">
             A
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-8 md:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
