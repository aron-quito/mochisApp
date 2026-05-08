import { AppView } from '../types';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  BarChart2, 
  User, 
  LogOut, 
  X,
  ShoppingBag,
  ClipboardList,
  Users
} from 'lucide-react';
import { cn } from '../lib/utils';
import { removeAuthToken } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  role?: 'admin' | 'employee';
}

function SidebarContent({ menuItems, currentView, handleNav }: { menuItems: any[], currentView: any, handleNav: (v: any) => void }) {
  return (
    <div className="flex flex-col h-full py-8 px-4 bg-slate-900 text-white">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/20">
          <ShoppingBag size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight">Mochi´s Shop</span>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => handleNav(item.view)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group text-sm font-semibold",
              currentView === item.view 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon size={18} className={cn(
              "transition-transform duration-200 group-hover:scale-110",
              currentView === item.view ? "text-white" : "text-slate-500 group-hover:text-slate-300"
            )} />
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto px-2">
        <button 
          onClick={() => { removeAuthToken(); window.location.reload(); }}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group text-sm font-semibold"
        >
          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ currentView, setView, isOpen, setIsOpen, role = 'admin' }: SidebarProps) {
  const adminItems = [
    { name: 'Inicio', icon: Home, view: 'Home' as AppView },
    { name: 'Inventario', icon: Package, view: 'Inventory' as AppView },
    { name: 'Nueva Venta', icon: ShoppingCart, view: 'New Sale' as AppView },
    { name: 'Diario de Lotes', icon: ClipboardList, view: 'LotJournal' as AppView },
    { name: 'Reportes', icon: BarChart2, view: 'Reports' as AppView },
    { name: 'Empleados', icon: Users, view: 'Employees' as AppView },
    { name: 'Mi Perfil', icon: User, view: 'Profile' as AppView },
  ];

  const employeeItems = [
    { name: 'Nueva Venta', icon: ShoppingCart, view: 'New Sale' as AppView },
    { name: 'Inventario', icon: Package, view: 'Inventory' as AppView },
    { name: 'Reportes', icon: BarChart2, view: 'Reports' as AppView },
    { name: 'Mi Perfil', icon: User, view: 'Profile' as AppView },
  ];

  const menuItems = role === 'admin' ? adminItems : employeeItems;

  const handleNav = (view: AppView) => {
    setView(view);
    setIsOpen(false);
  };



  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden sm:block w-64 bg-slate-900 h-full shrink-0">
        <SidebarContent menuItems={menuItems} currentView={currentView} handleNav={handleNav} />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 sm:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 sm:hidden shadow-2xl"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900"
              >
                <X size={24} />
              </button>
              <SidebarContent menuItems={menuItems} currentView={currentView} handleNav={handleNav} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
