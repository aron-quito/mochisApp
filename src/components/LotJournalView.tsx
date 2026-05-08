import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { ProductLog } from '../types';
import { ClipboardList, TrendingUp, Calendar, DollarSign, ArrowDownCircle, ArrowUpCircle, Edit3, Search, Package, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const EVENT_META = {
  import: { label: 'Importación', icon: ArrowDownCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700' },
  stock_withdrawal: { label: 'Retiro de Stock', icon: ArrowUpCircle, color: 'text-orange-600', bg: 'bg-orange-50', badgeBg: 'bg-orange-100', badgeText: 'text-orange-700' },
  product_edit: { label: 'Edición de Producto', icon: Edit3, color: 'text-blue-600', bg: 'bg-blue-50', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700' },
};

const FIELD_LABELS: Record<string, string> = {
  name: 'Nombre', brand: 'Marca', category: 'Categoría',
  material: 'Material', sellingPrice: 'Precio Venta', sku: 'SKU',
};

export function LotJournalView() {
  const [logs, setLogs] = useState<ProductLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'import' | 'stock_withdrawal' | 'product_edit'>('all');

  const load = async () => {
    try {
      const data = await apiFetch('/logs.php');
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = logs.filter(l => {
    const matchSearch = l.product_name?.toLowerCase().includes(search.toLowerCase()) || l.notes?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || l.event_type === filter;
    return matchSearch && matchFilter;
  });

  const totalImports = logs.filter(l => l.event_type === 'import').reduce((s, l) => s + (l.new_data?.quantity || 0), 0);
  const totalWithdrawals = logs.filter(l => l.event_type === 'stock_withdrawal').reduce((s, l) => s + Math.abs(l.quantity_delta), 0);
  const totalEdits = logs.filter(l => l.event_type === 'product_edit').length;

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Diario de Operaciones</h1>
        <p className="text-slate-500 mt-1 text-lg">Registro completo de importaciones, retiros y modificaciones.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Unidades Ingresadas', value: totalImports, icon: ArrowDownCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Unidades Retiradas', value: totalWithdrawals, icon: ArrowUpCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Ediciones de Fichas', value: totalEdits, icon: Edit3, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bento-card flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 !p-3 md:!p-5">
            <div className={cn('p-2.5 rounded-xl shadow-sm self-center', stat.bg, stat.color)}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
              <p className="text-lg md:text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Buscar prenda o nota..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none shadow-sm font-medium" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(['all', 'import', 'stock_withdrawal', 'product_edit'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all shrink-0',
                filter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
              )}>
              {f === 'all' ? 'Todos' : EVENT_META[f].label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading && (
          <div className="py-16 text-center text-slate-400 font-bold">Cargando...</div>
        )}

        {!loading && filtered.map((log, i) => {
          const meta = EVENT_META[log.event_type];
          const Icon = meta.icon;
          const date = new Date(log.created_at);
          return (
            <motion.div key={log.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }}
              className="bento-card flex items-start gap-4 !p-5 hover:border-slate-300 transition-all">

              {/* Icon */}
              <div className={cn('p-3 rounded-2xl shrink-0 mt-0.5', meta.bg, meta.color)}>
                <Icon size={20} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                  <div>
                    <span className={cn('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mr-2', meta.badgeBg, meta.badgeText)}>
                      {meta.label}
                    </span>
                    <span className="font-black text-slate-900 text-sm uppercase">{log.product_name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                    <Calendar size={12} />
                    <span>{date.toLocaleDateString('es')} {date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 font-medium mb-3">{log.notes}</p>

                {/* Import details */}
                {log.event_type === 'import' && log.new_data && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 rounded-xl p-2.5">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Stock Ingresado</p>
                      <p className="font-black text-emerald-600 text-sm">{log.new_data.quantity} unds</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Costo Total</p>
                      <p className="font-black text-slate-900 text-sm">${parseFloat(log.new_data.totalCost || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">P. Venta</p>
                      <p className="font-black text-blue-600 text-sm">${parseFloat(log.new_data.sellingPrice || 0).toFixed(2)}</p>
                    </div>
                  </div>
                )}

                {/* Withdrawal details */}
                {log.event_type === 'stock_withdrawal' && (
                  <div className="bg-orange-50 rounded-xl p-3 flex items-center gap-3 border border-orange-100">
                    <ArrowUpCircle size={18} className="text-orange-500 shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">Unidades Retiradas</p>
                      <p className="font-black text-orange-700 text-lg">{Math.abs(log.quantity_delta)} unds</p>
                    </div>
                  </div>
                )}

                {/* Edit diff */}
                {log.event_type === 'product_edit' && log.old_data && log.new_data && (
                  <div className="space-y-1.5">
                    {Object.keys(log.new_data).map(field => (
                      <div key={field} className="flex flex-wrap items-center gap-2 text-xs bg-slate-50 rounded-xl px-3 py-2">
                        <span className="font-bold text-slate-500 uppercase tracking-widest text-[9px] w-20 shrink-0">{FIELD_LABELS[field] || field}</span>
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-lg font-bold line-through opacity-70">{log.old_data[field]}</span>
                        <span className="text-slate-400 text-[10px]">→</span>
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg font-bold">{log.new_data[field]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {!loading && filtered.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-dashed border-slate-200">
              <ClipboardList size={32} className="text-slate-200" />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No hay registros disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}
