import { useState, useEffect } from 'react';
import { apiFetch, getUserRole, getUserId } from '../lib/api';
import { Sale, Product } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell
} from 'recharts';
import { 
  Calendar, 
  MapPin, 
  Download, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Users,
  ChevronDown,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function ReportsView({ role = 'admin' }: { role?: 'admin'|'employee' }) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [dateRange, setDateRange] = useState('Ultimos 7 dias');
  const [location, setLocation] = useState('Consolidado');

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const data = await apiFetch('/sales.php');
        // Employees only see their own sales
        if (role === 'employee') {
          const myId = getUserId();
          setSales(data.filter((s: any) => s.employee_id === myId));
        } else {
          setSales(data);
        }
      } catch (error) {
        console.error('Error fetching sales', error);
      }
    };
    fetchSales();
  }, []);

  // Aggregated data for charts
  const salesByPayment = sales.reduce((acc: any[], sale) => {
    const existing = acc.find(i => i.name === sale.paymentMethod);
    if (existing) {
      existing.value += sale.totalPrice;
    } else {
      acc.push({ name: sale.paymentMethod, value: sale.totalPrice });
    }
    return acc;
  }, []);

  const salesTrend = sales.slice(0, 15).reverse().map(s => ({
    date: new Date(s.timestamp).toLocaleDateString(),
    total: s.totalPrice
  }));

  const totalRevenue = sales.reduce((acc, s) => acc + s.totalPrice, 0);
  const totalSales = sales.length;

  const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626'];

  return (
    <div className="space-y-10 pb-12 py-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Análisis Operativo</h1>
          <p className="text-slate-500 mt-1 text-lg">Métricas de venta y rendimiento de inventario.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-2xl font-bold text-xs text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
            <Calendar size={18} className="text-blue-500" />
            {dateRange.toUpperCase()}
            <ChevronDown size={14} className="opacity-40" />
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-2xl font-bold text-xs text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
            <MapPin size={18} className="text-emerald-500" />
            {location.toUpperCase()}
            <ChevronDown size={14} className="opacity-40" />
          </button>
          <button 
            onClick={() => setIsExportOpen(true)}
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold text-xs hover:bg-slate-800 shadow-xl shadow-slate-200 uppercase tracking-widest transition-all"
          >
            <Download size={18} />
            Exportar
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-900">
        {[
          { label: 'Ventas Totales', value: totalSales, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Ingresos Totales', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Promedio Venta', value: `$${(totalSales > 0 ? totalRevenue / totalSales : 0).toFixed(2)}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Nuevos Clientes', value: '24', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bento-card bento-card-hover flex flex-col justify-between"
          >
            <div className={cn("p-3 rounded-xl w-fit mb-6 shadow-sm", stat.bg, stat.color)}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black tracking-tighter italic">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bento-card p-10 bg-white shadow-xl shadow-slate-200/40">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight italic">Tendencia de Ingresos</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Histórico diario de transacciones</p>
            </div>
            <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
               <TrendingUp size={20} />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', padding: '20px' }} 
                  itemStyle={{ color: '#2563eb', fontWeight: '900', fontSize: '18px' }}
                />
                <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={5} dot={{ r: 6, fill: '#fff', stroke: '#2563eb', strokeWidth: 3 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bento-card p-10 text-slate-900 bg-white shadow-xl shadow-slate-200/40">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight italic">Canales de Pago</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Distribución por método de cobro</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
               <DollarSign size={20} />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByPayment}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip cursor={{ fill: '#f8fafc', radius: 12 }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', padding: '20px' }} />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={40}>
                  {salesByPayment.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bento-card overflow-hidden !p-0 shadow-xl shadow-slate-200/40 border-slate-100">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <h3 className="font-black text-slate-900 uppercase tracking-[.2em] text-sm italic">Registro de Ventas Recientes</h3>
          <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Ver Todo</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 uppercase text-[10px] font-extrabold text-slate-400 tracking-[.2em]">
              <tr>
                <th className="px-8 py-5">UID Venta</th>
                <th className="px-8 py-5">Prenda / SKU</th>
                <th className="px-8 py-5">Cantidad</th>
                <th className="px-8 py-5">Monto Total</th>
                <th className="px-8 py-5">Método Pago</th>
                <th className="px-8 py-5">Fecha / Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sales.slice(0, 10).map((sale) => (
                <tr key={sale.id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-8 py-5 text-[10px] font-mono text-slate-300">#{sale.id.slice(0, 8)}</td>
                  <td className="px-8 py-5">
                     <p className="font-black text-slate-900 text-sm uppercase truncate max-w-[200px] group-hover:text-blue-600 transition-colors">{sale.productName}</p>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">EAN {sale.sku}</p>
                  </td>
                  <td className="px-8 py-5">
                     <div className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
                        {sale.quantity} unds.
                     </div>
                  </td>
                  <td className="px-8 py-5">
                     <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-lg tracking-tighter">${sale.totalPrice.toFixed(2)}</span>
                        <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Neto</span>
                     </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[9px] font-bold uppercase bg-white border border-slate-100 text-slate-500 px-3 py-1.5 rounded-xl shadow-sm">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-slate-900 uppercase tracking-tighter">{new Date(sale.timestamp).toLocaleDateString()}</span>
                       <span className="text-[9px] font-medium text-slate-400">{new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {isExportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExportOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Exportar Reporte</h2>
              <div className="space-y-3 mb-8">
                {[
                  { label: 'PDF Report (.pdf)', icon: FileText, color: 'text-red-600', bg: 'bg-red-50' },
                  { label: 'Excel Spreadsheet (.xlsx)', icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'CSV Format (.csv)', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' }
                ].map(opt => (
                  <button 
                    key={opt.label}
                    onClick={() => setIsExportOpen(false)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl border border-gray-50 transition-colors"
                  >
                    <div className={cn("p-3 rounded-xl", opt.bg, opt.color)}>
                      <opt.icon size={20} />
                    </div>
                    <span className="font-semibold text-gray-700 text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
              <button 
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200"
                onClick={() => setIsExportOpen(false)}
              >
                Descargar Reporte Seleccionado
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
