import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Product } from '../types';
import { Package, Search, ClipboardList, TrendingUp, Calendar, DollarSign, ArrowDownCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface JournalEntry {
  lotId: string;
  productId: string;
  productName: string;
  productSku: string;
  category: string;
  quantity: number;
  remainingStock: number;
  totalCost: number;
  unitCost: number;
  sellingPrice: number;
  importDate: string;
}

export function LotJournalView() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const products: Product[] = await apiFetch('/products.php');
        const all: JournalEntry[] = [];
        products.forEach(p => {
          (p.lots || []).forEach(lot => {
            all.push({
              lotId: lot.id,
              productId: p.id,
              productName: p.name,
              productSku: p.sku,
              category: p.category,
              quantity: lot.quantity,
              remainingStock: lot.remainingStock,
              totalCost: lot.totalCost,
              unitCost: lot.unitCost,
              sellingPrice: p.sellingPrice,
              importDate: lot.importDate || '',
            });
          });
        });
        all.sort((a, b) => new Date(b.importDate).getTime() - new Date(a.importDate).getTime());
        setEntries(all);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = entries.filter(e =>
    e.productName.toLowerCase().includes(search.toLowerCase()) ||
    e.productSku.toLowerCase().includes(search.toLowerCase())
  );

  const totalInvested = entries.reduce((s, e) => s + e.totalCost, 0);
  const totalUnits = entries.reduce((s, e) => s + e.quantity, 0);
  const totalLots = entries.length;

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Diario de Lotes</h1>
        <p className="text-slate-500 mt-1 text-lg">Registro completo de todas las importaciones y entradas de stock.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Lotes', value: totalLots, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Unidades Ingresadas', value: totalUnits, icon: ArrowDownCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Capital Invertido', value: `$${totalInvested.toLocaleString('es', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bento-card flex items-center gap-4">
            <div className={cn('p-3 rounded-xl shadow-sm', stat.bg, stat.color)}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input type="text" placeholder="Buscar por prenda o SKU..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-3xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none shadow-sm font-medium" />
      </div>

      <div className="bento-card overflow-hidden !p-0 shadow-xl shadow-slate-200/40">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm italic">Entradas al Inventario</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 uppercase text-[10px] font-extrabold text-slate-400 tracking-[.15em]">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Prenda / SKU</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Stock Ingreso</th>
                <th className="px-6 py-4">Stock Actual</th>
                <th className="px-6 py-4">P. Compra Unit.</th>
                <th className="px-6 py-4">Costo Total</th>
                <th className="px-6 py-4">P. Venta</th>
                <th className="px-6 py-4">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400 text-sm font-bold">Cargando...</td></tr>
              )}
              {!loading && filtered.map((entry, i) => {
                const margin = entry.sellingPrice > 0
                  ? (((entry.sellingPrice - entry.unitCost) / entry.sellingPrice) * 100).toFixed(1)
                  : '0.0';
                const marginNum = parseFloat(margin);
                return (
                  <motion.tr key={`${entry.lotId}-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-300" />
                        <div>
                          <p className="text-xs font-bold text-slate-700">{entry.importDate ? new Date(entry.importDate).toLocaleDateString('es') : '—'}</p>
                          <p className="text-[9px] text-slate-400">{entry.importDate ? new Date(entry.importDate).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-900 text-sm uppercase truncate max-w-[180px] group-hover:text-blue-600">{entry.productName}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">{entry.productSku}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg uppercase">{entry.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <ArrowDownCircle size={14} className="text-emerald-500" />
                        <span className="font-black text-slate-900">{entry.quantity}</span>
                        <span className="text-[9px] text-slate-400">unds</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('px-2 py-1 rounded-full text-[10px] font-black',
                        entry.remainingStock <= 0 ? 'bg-red-100 text-red-600' :
                        entry.remainingStock <= 5 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-700'
                      )}>{entry.remainingStock} unds</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700">${entry.unitCost?.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-emerald-600">${entry.totalCost?.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <TrendingUp size={12} className="text-blue-400" />
                        <span className="font-black text-blue-600">${entry.sellingPrice?.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('font-black text-sm',
                        marginNum >= 30 ? 'text-emerald-600' : marginNum >= 15 ? 'text-yellow-600' : 'text-red-500'
                      )}>{margin}%</span>
                    </td>
                  </motion.tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={9} className="px-6 py-16 text-center text-slate-400 text-sm font-bold italic">No hay registros de importaciones.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
