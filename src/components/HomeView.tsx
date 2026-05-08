import { AppView } from '../types';
import { 
  Package, 
  ShoppingCart, 
  BarChart2, 
  Plus, 
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { motion } from 'motion/react';

export function HomeView({ setView }: { setView: (v: AppView) => void }) {
  return (
    <div className="space-y-8 py-4">
      <header>
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[.2em] border border-blue-100 mb-4">
          <ShoppingBag size={12} />
          Panel de Control v2.0
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard General</h1>
        <p className="text-slate-500 mt-2 text-lg">Resumen operativo y accesos directos de tu tienda.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4">
        {/* Main Action - Nueva Venta (Large) */}
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setView('New Sale')}
          className="md:col-span-2 md:row-span-1 bento-card bento-card-hover group flex flex-col justify-between items-start text-left bg-blue-600 border-none relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <ShoppingCart size={120} />
          </div>
          <div className="bg-white/20 p-3 rounded-xl text-white mb-8 backdrop-blur-md">
            <ShoppingCart size={24} />
          </div>
          <div className="relative z-10 w-full">
            <h3 className="text-2xl font-bold text-white mb-2">Nueva Venta</h3>
            <p className="text-blue-100 text-sm font-medium">Registrar transacción POS rápido</p>
            <div className="mt-6 flex items-center justify-between">
              <span className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">Abrir POS</span>
              <ArrowRight size={20} className="text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </motion.button>

        {/* Inventory Card (Medium) */}
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => setView('Inventory')}
          className="md:col-span-1 md:row-span-1 bento-card bento-card-hover group flex flex-col justify-between items-start text-left"
        >
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl mb-6 group-hover:scale-110 transition-transform">
            <Package size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Inventario</h3>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-tight">Gestionar Productos y Stock</p>
          </div>
          <div className="mt-8 self-end bg-slate-50 p-2 rounded-lg text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
            <ArrowRight size={18} />
          </div>
        </motion.button>

        {/* Reports Card (Medium) */}
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => setView('Reports')}
          className="md:col-span-1 md:row-span-1 bento-card bento-card-hover group flex flex-col justify-between items-start text-left bg-slate-900 border-none"
        >
          <div className="bg-white/10 text-white p-3 rounded-xl mb-6 group-hover:scale-110 transition-transform">
            <BarChart2 size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Reportes</h3>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-tight">Análisis y Estadísticas</p>
          </div>
          <div className="mt-8 self-end bg-white/5 p-2 rounded-lg text-slate-500 group-hover:bg-white/10 group-hover:text-white transition-colors">
            <ArrowRight size={18} />
          </div>
        </motion.button>

        {/* Long Promo Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-4 bento-card bg-slate-100/50 border-slate-200 border-dashed p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-12"
        >
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">Optimiza tu tiempo</h2>
            <p className="text-slate-500 max-w-xl text-lg font-medium leading-relaxed">
              El sistema <span className="text-blue-600 font-bold">Mochi´s Shop</span> integra inventario y ventas en una solución unificada. Mejora tu flujo de trabajo hoy.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
              <button 
                onClick={() => setView('Inventory')}
                className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-xl hover:shadow-slate-200 transition-all flex items-center gap-2"
              >
                Configurar Productos
                <ArrowRight size={18} />
              </button>
              <button 
                className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all"
              >
                Ver Tutoriales
              </button>
            </div>
          </div>
          <div className="w-48 h-48 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center rotate-6 scale-110 transition-transform hover:rotate-0 duration-500 border border-slate-200 border-b-4">
             <div className="w-40 h-40 bg-slate-50 rounded-2xl flex items-center justify-center">
                <ShoppingBag size={80} className="text-slate-300 drop-shadow-sm" />
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
