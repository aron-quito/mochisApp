import { useState, useEffect } from 'react';
import { auth, loginWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Sidebar } from './components/Sidebar';
import { InventoryView } from './components/InventoryView';
import { SalesView } from './components/SalesView';
import { ReportsView } from './components/ReportsView';
import { ProfileView } from './components/ProfileView';
import { HomeView } from './components/HomeView';
import { AppView } from './types';
import { LogIn, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('Home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bento-grid-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bento-card text-center relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl opacity-50" />

            <div className="relative">
              <div className="bg-slate-900 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-200/50 rotate-3">
                <ShoppingBag className="text-white w-10 h-10 -rotate-3" />
              </div>
              
              <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tighter">
                Cloth<span className="text-blue-600 text-shadow-glow">Stock</span>
              </h1>
              
              <p className="text-slate-500 mb-10 text-lg leading-relaxed">
                Gestión inteligente de inventario para marcas de ropa modernas.
              </p>

              <div className="space-y-4">
                <button
                  onClick={loginWithGoogle}
                  className="w-full flex items-center justify-center gap-4 bg-slate-900 text-white font-bold py-5 px-6 rounded-2xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-300 transform active:scale-[0.98]"
                >
                  <LogIn className="w-5 h-5" />
                  Ingresar con Google
                </button>
                
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[.2em]">
                  Sistema de Gestión Empresarial v2.0
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'Inventory': return <InventoryView />;
      case 'New Sale': return <SalesView />;
      case 'Reports': return <ReportsView />;
      case 'Profile': return <ProfileView user={user} />;
      default: return <HomeView setView={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
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
            <h2 className="text-lg font-bold text-slate-900 tracking-tight italic">ClothStock</h2>
          </div>
          <motion.img 
            whileHover={{ scale: 1.1 }}
            src={user.photoURL || ''} 
            alt="User" 
            className="w-9 h-9 rounded-xl border-2 border-white shadow-sm ring-1 ring-slate-100" 
          />
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
