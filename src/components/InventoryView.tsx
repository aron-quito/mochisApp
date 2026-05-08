import React from 'react';
import { useState, useEffect, FormEvent, ReactNode } from 'react';
import { apiFetch } from '../lib/api';
import { Product } from '../types';
import { 
  Plus, 
  Search, 
  Package, 
  MoreVertical, 
  Camera, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ShoppingBag,
  History,
  TrendingUp,
  DollarSign,
  Edit,
  ArrowLeft,
  ArrowUpCircle,
  MinusCircle,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Lot } from '../types';

function StepperBtn({ onClick, children }: { onClick: () => void, children: React.ReactNode }) {
  return (
    <button 
      type="button" 
      onClick={onClick}
      className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition-colors"
    >
      {children}
    </button>
  );
}

export function InventoryView({ role = 'admin' }: { role?: 'admin' | 'employee' }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiFetch('/products.php');
        setProducts(data);
      } catch (error) {
        showNotification('error', 'Error loading products');
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Inventario</h1>
          <p className="text-slate-500 mt-1 text-lg">Catálogo completo de prendas y gestión de existencias.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-slate-200"
        >
          <div className="bg-white/20 p-1.5 rounded-lg">
            <Plus size={18} />
          </div>
          Registrar Prenda
        </motion.button>
      </div>

      {/* Mini Stats Bento Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: products.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Bajo Stock', value: products.filter(p => p.totalStock <= 5).length, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Categorías', value: new Set(products.map(p => p.category)).size, icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Inversión Total', value: `$${products.reduce((acc, p) => acc + (p.lots?.reduce((sum, l) => sum + (l.totalCost || 0), 0) || 0), 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bento-card p-4 flex items-center gap-4 bg-white/50 backdrop-blur-sm"
          >
            <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl`}>
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg font-black text-slate-900 tracking-tighter">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre, SKU o marca..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-3xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none shadow-sm transition-all text-base font-medium"
        />
      </div>

      {/* Active stock products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.filter(p => p.totalStock > 0).map((product, i) => (
          <motion.div
            layout
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => setSelectedProduct(product)}
            className="bento-card bento-card-hover group p-0 overflow-hidden flex flex-col h-full bg-white cursor-pointer"
          >
            <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center text-slate-300 relative overflow-hidden">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <Package size={48} className="opacity-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-500" />
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md border",
                  product.totalStock <= 5 ? "bg-orange-500/90 text-white border-orange-400" : 
                  product.totalStock <= 15 ? "bg-yellow-400/90 text-slate-900 border-yellow-300" : 
                  "bg-emerald-500/90 text-white border-emerald-400"
                )}>
                  {product.totalStock} Units
                </span>
              </div>
              <div className="absolute top-3 right-3">
                 <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 border border-slate-200">
                    {product.brand}
                 </div>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                   <span className="text-[10px] font-bold text-slate-400 tracking-[.2em] uppercase">{product.category}</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">
                  {product.name}
                </h3>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Precio Público</p>
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">${product.sellingPrice.toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-600">{product.sku}</span>
                  {(product.sizes || []).length > 0 && (
                    <div className="flex flex-wrap gap-0.5 justify-end">
                      {(product.sizes || []).slice(0, 4).map((s: string) => (
                        <span key={s} className="text-[8px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                      {(product.sizes || []).length > 4 && <span className="text-[8px] font-bold text-slate-400">+{(product.sizes || []).length - 4}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Zero-stock section */}
      {filteredProducts.filter(p => p.totalStock <= 0).length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none flex items-center gap-3 py-4 px-1 select-none">
            <ChevronDown size={18} className="text-slate-400 group-open:rotate-180 transition-transform" />
            <span className="font-black text-slate-400 uppercase tracking-widest text-xs">
              Productos sin stock ({filteredProducts.filter(p => p.totalStock <= 0).length})
            </span>
          </summary>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4 opacity-50 grayscale">
            {filteredProducts.filter(p => p.totalStock <= 0).map((product, i) => (
              <motion.div layout key={`empty-${product.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => setSelectedProduct(product)}
                className="bento-card group p-0 overflow-hidden flex flex-col h-full bg-white cursor-pointer">
                <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center text-slate-300">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <Package size={48} className="opacity-20" />}
                  <div className="absolute top-3 left-3"><span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md border bg-red-500/90 text-white border-red-400">Sin Stock</span></div>
                </div>
                <div className="p-5"><h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight truncate">{product.name}</h3>
                <span className="text-[10px] font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-600">{product.sku}</span></div>
              </motion.div>
            ))}
          </div>
        </details>
      )}

      {filteredProducts.filter(p => p.totalStock > 0).length === 0 && filteredProducts.length === 0 && (
        <div className="col-span-full py-20 text-center text-gray-500 italic">
          No se encontraron productos.
        </div>
      )}

      {role === 'admin' && <InventoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={(msg) => showNotification('success', msg)}
        onError={(msg) => showNotification('error', msg)}
      />}

      <ProductDetailModal
        product={selectedProduct}
        role={role}
        onClose={() => setSelectedProduct(null)}
        onSuccess={(msg) => showNotification('success', msg)}
        onError={(msg) => showNotification('error', msg)}
      />

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              "fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-medium",
              notification.type === 'success' ? "bg-green-600" : "bg-red-600"
            )}
          >
            {notification.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InventoryModal({ isOpen, onClose, onSuccess, onError }: { isOpen: boolean, onClose: () => void, onSuccess: (m: string) => void, onError: (m: string) => void }) {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    brand: '',
    category: '',
    sizes: [] as string[],
    material: '',
    quantity: 0,
    totalCost: 0,
    sellingPrice: 0,
    imageUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const SIZES = ['XS','S','M','L','XL','XXL','XXXL','28','30','32','34','36','38','40'];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const unitCost = formData.quantity > 0 ? formData.totalCost / formData.quantity : 0;
      const newLot = {
        quantity: formData.quantity,
        remainingStock: formData.quantity,
        totalCost: formData.totalCost,
        unitCost: unitCost,
      };

      await apiFetch('/products.php', {
        method: 'POST',
        body: JSON.stringify({
          sku: formData.sku,
          name: formData.name,
          brand: formData.brand,
          category: formData.category,
          sizes: formData.sizes,
          material: formData.material,
          sellingPrice: formData.sellingPrice,
          imageUrl: formData.imageUrl,
          lots: [newLot]
        })
      });

      onSuccess('Prenda e importación inicial registradas exitosamente.');
      setFormData({ sku: '', name: '', brand: '', category: '', sizes: [], material: '', quantity: 0, totalCost: 0, sellingPrice: 0, imageUrl: '' });
      onClose();
      window.location.reload(); // Simple reload to refresh the list since we removed onSnapshot
    } catch (err) {
      onError('Error al procesar el registro.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                  <Plus size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Registro e Importación</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Nueva Prenda o Lote</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6 md:space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Código SKU</label>
                      <input
                        required
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all font-medium"
                        placeholder="EX: JK-204"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Nombre Comercial</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all font-medium"
                        placeholder="Chaqueta Oxford Premium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Marca</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all font-medium"
                        placeholder="Urban"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Categoría</label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all font-medium"
                        placeholder="Invierno"
                      />
                    </div>
                  </div>
                   <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Curva de Tallas</label>
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map(s => (
                        <button key={s} type="button"
                          onClick={() => setFormData(d => ({ ...d, sizes: d.sizes.includes(s) ? d.sizes.filter((x:string) => x !== s) : [...d.sizes, s] }))}
                          className={cn('px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
                            formData.sizes.includes(s) ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400'
                          )}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">URL Imagen Referencial</label>
                    <input type="text" placeholder="https://..." value={formData.imageUrl}
                      onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all font-medium" />
                    {formData.imageUrl && <img src={formData.imageUrl} alt="preview" className="w-full h-28 object-cover rounded-2xl border border-slate-100 mt-2" onError={e => (e.currentTarget.style.display='none')} />}
                  </div>
                </div>

                {/* Logistics Side */}
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-6">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest text-center italic">Datos de Importación</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Cantidad Importada</label>
                        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100">
                          <StepperBtn onClick={() => setFormData(d => ({ ...d, quantity: Math.max(0, d.quantity - 1) }))}>-</StepperBtn>
                          <input 
                            type="number"
                            value={formData.quantity === 0 ? '' : formData.quantity}
                            onFocus={e => e.target.select()}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                            className="flex-1 text-center font-black text-lg bg-transparent outline-none"
                            placeholder="0"
                          />
                          <StepperBtn onClick={() => setFormData(d => ({ ...d, quantity: d.quantity + 1 }))}>+</StepperBtn>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Costo Total Lote ($)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input
                            type="number"
                            step="0.01"
                            value={formData.totalCost === 0 ? '' : formData.totalCost}
                            onFocus={e => e.target.select()}
                            onChange={(e) => setFormData({ ...formData, totalCost: parseFloat(e.target.value) || 0 })}
                            className="w-full pl-12 pr-5 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all font-black text-xl text-emerald-600"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center px-2 py-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Costo Unitario:</p>
                        <span className="text-sm font-black text-slate-900tracking-tighter">
                          ${(formData.quantity > 0 ? formData.totalCost / formData.quantity : 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-blue-600 tracking-widest ml-1">Precio Público Sugerido ($)</label>
                    <div className="relative">
                      <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={18} />
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={formData.sellingPrice === 0 ? '' : formData.sellingPrice}
                        onFocus={e => e.target.select()}
                        onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-12 pr-5 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all font-black text-2xl text-blue-600"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 text-white font-bold py-5 rounded-[2rem] hover:bg-emerald-600 transition-all shadow-xl hover:shadow-emerald-200 disabled:opacity-50 transform active:scale-[0.98]"
                >
                  {isSubmitting ? "Registrando Lote..." : "Confirmar e Importar Lote"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ProductDetailModal({ product, role = 'admin', onClose, onSuccess, onError }: { product: Product | null, role?: 'admin'|'employee', onClose: () => void, onSuccess: (m: string) => void, onError: (m: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'import' | 'withdraw'>('details');
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawConfirm, setWithdrawConfirm] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [importData, setImportData] = useState({ quantity: 0, totalCost: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setEditForm({ ...product });
      setImportData({ quantity: 0, totalCost: 0 });
      setActiveTab('details');
    }
  }, [product]);

  if (!product) return null;

  const handleUpdateDetails = async () => {
    setIsSubmitting(true);
    try {
      await apiFetch(`/products.php?id=${product.id}&action=update`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      onSuccess('Información actualizada correctamente.');
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      onError('Error al actualizar datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewImport = async () => {
    if (importData.quantity <= 0) return;
    setIsSubmitting(true);
    try {
      const unitCost = importData.totalCost / importData.quantity;
      const newLot = {
        quantity: importData.quantity,
        remainingStock: importData.quantity,
        totalCost: importData.totalCost,
        unitCost: unitCost,
      };

      await apiFetch(`/products.php?id=${product.id}&action=add_lot`, {
        method: 'PUT',
        body: JSON.stringify({ lot: newLot })
      });
      onSuccess(`Nuevo lote de ${importData.quantity} unidades registrado.`);
      setImportData({ quantity: 0, totalCost: 0 });
      setActiveTab('history');
      window.location.reload();
    } catch (err) {
      onError('Error al registrar nuevo lote.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (withdrawAmount <= 0 || withdrawAmount > product.totalStock) return;
    setIsSubmitting(true);
    try {
      await apiFetch('/products.php', {
        method: 'POST',
        body: JSON.stringify({
          action: 'withdraw',
          productId: product.id,
          amount: withdrawAmount,
          reason: withdrawReason || `Retiro manual de ${withdrawAmount} unidades`,
        })
      });
      onSuccess(`Se retiraron ${withdrawAmount} unidades correctamente.`);
      setWithdrawAmount(0);
      setWithdrawReason('');
      setWithdrawConfirm(false);
      window.location.reload();
    } catch (err) {
      onError('Error al procesar el retiro de stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative bg-white w-full max-w-4xl rounded-t-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col md:flex-row h-[95vh] md:h-[85vh]"
        >
          {/* MOBILE: compact dark header bar (hidden on md+) */}
          <div className="md:hidden bg-slate-950 text-white shrink-0">
            <div className="flex items-center gap-3 px-4 pt-4 pb-3">
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors shrink-0">
                <ArrowLeft size={18} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[.3em] text-blue-400 leading-none mb-0.5">{product.category}</p>
                <h2 className="text-sm font-black uppercase italic truncate leading-tight">{product.name}</h2>
              </div>
              <div className="flex gap-2 shrink-0">
                <div className="bg-white/10 px-3 py-1.5 rounded-xl text-center">
                  <p className="text-[7px] font-bold text-slate-400 uppercase">Stock</p>
                  <p className="text-sm font-black text-white leading-none">{product.totalStock}</p>
                </div>
                <div className="bg-blue-600 px-3 py-1.5 rounded-xl text-center">
                  <p className="text-[7px] font-bold text-white/60 uppercase">Precio</p>
                  <p className="text-sm font-black text-white leading-none">${product.sellingPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP: dark sidebar (hidden on mobile) */}
          <div className="hidden md:flex w-72 bg-slate-950 text-white p-8 shrink-0 flex-col overflow-y-auto">
            <div className="mb-8">
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl mb-4 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div className="aspect-square bg-slate-900 rounded-[2rem] overflow-hidden mb-6 border border-white/5">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-800">
                    <Package size={64} />
                  </div>
                )}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[.3em] text-blue-400 mb-2">{product.category}</p>
              <h2 className="text-2xl font-black tracking-tight leading-tight uppercase italic mb-2">{product.name}</h2>
              <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-white/5">SKU: {product.sku}</span>
            </div>
            <div className="mt-auto space-y-3">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Stock Actual</p>
                <p className="text-3xl font-black text-white italic tracking-tighter">{product.totalStock} <span className="text-xs text-slate-500 not-italic uppercase ml-1">unds</span></p>
              </div>
              <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-900/40">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Precio Venta</p>
                <p className="text-3xl font-black text-white italic tracking-tighter">${product.sellingPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Main Content - tabs + content */}
          <div className="flex-1 bg-white flex flex-col min-h-0 overflow-hidden">
            {/* Tabs Header */}
            <div className="flex gap-1 p-2 md:p-4 bg-slate-50/50 border-b border-slate-100 shrink-0">
              {(role === 'admin' ? [
                { id: 'details', label: 'Información', icon: Edit },
                { id: 'history', label: 'Historial Lotes', icon: History },
                { id: 'import', label: 'Nueva Importación', icon: Plus },
                { id: 'withdraw', label: 'Retirar Stock', icon: ArrowUpCircle },
              ] : [
                { id: 'details', label: 'Información', icon: Package },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2.5 md:py-3 rounded-2xl font-black text-[8px] md:text-[10px] uppercase tracking-widest transition-all",
                    activeTab === tab.id ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                  )}
                >
                  <tab.icon size={13} />
                  <span className="leading-none">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar min-h-0">
              {activeTab === 'details' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-slate-900 uppercase tracking-tight italic">Ficha Técnica</h3>
                    {role === 'admin' && <button 
                      onClick={() => isEditing ? handleUpdateDetails() : setIsEditing(true)}
                      disabled={isSubmitting}
                      className={cn(
                        "px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                        isEditing ? "bg-emerald-600 text-white shadow-emerald-200 shadow-lg" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      {isSubmitting ? '...' : isEditing ? 'Guardar Cambios' : 'Editar Ficha'}
                    </button>}
                  </div>

                  <div className="space-y-4">
                    {/* Text fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: 'sku', label: 'SKU' },
                        { key: 'brand', label: 'Marca' },
                        { key: 'category', label: 'Categoría' },
                        { key: 'material', label: 'Material' },
                      ].map((field) => (
                        <div key={field.key} className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                          <input
                            disabled={!isEditing}
                            type="text"
                            value={isEditing ? (editForm as any)[field.key] ?? '' : (product as any)[field.key] ?? ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-slate-900 disabled:opacity-60 transition-all focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400"
                          />
                        </div>
                      ))}
                    </div>
                    {/* Precio */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest ml-1">Precio Público ($)</label>
                      <input
                        disabled={!isEditing}
                        type="number"
                        step="0.01"
                        value={isEditing ? editForm.sellingPrice ?? product.sellingPrice : product.sellingPrice}
                        onFocus={e => e.target.select()}
                        onChange={(e) => setEditForm(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl outline-none font-black text-blue-600 disabled:opacity-60 transition-all"
                      />
                    </div>
                    {/* Tallas chips */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Curva de Tallas</label>
                      <div className={cn("flex flex-wrap gap-2", !isEditing && "pointer-events-none opacity-60")}>
                        {['XS','S','M','L','XL','XXL','XXXL','28','30','32','34','36','38','40'].map(s => {
                          const current: string[] = isEditing ? (editForm.sizes ?? product.sizes ?? []) : (product.sizes ?? []);
                          return (
                            <button key={s} type="button"
                              onClick={() => isEditing && setEditForm(prev => ({
                                ...prev,
                                sizes: (prev.sizes ?? product.sizes ?? []).includes(s)
                                  ? (prev.sizes ?? product.sizes ?? []).filter((x:string) => x !== s)
                                  : [...(prev.sizes ?? product.sizes ?? []), s]
                              }))}
                              className={cn('px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
                                current.includes(s) ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400'
                              )}>{s}</button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-slate-900 uppercase tracking-tight italic">Trazabilidad de Lotes</h3>
                    <div className="bg-slate-50 px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 border border-slate-100">
                      {(product.lots || []).length} Registros
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(product.lots || []).slice().reverse().map((lot, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-all">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-blue-500 shadow-sm transition-colors shrink-0">
                          <Package size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Lote #{idx + 1}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">
                              {lot.importDate ? new Date(lot.importDate).toLocaleDateString() : 'Fecha Pendiente'}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                             <div>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Ingreso</p>
                                <p className="text-xs font-bold text-slate-600">{lot.quantity} unds.</p>
                             </div>
                             <div>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total Costo</p>
                                <p className="text-xs font-black text-emerald-600">${lot.totalCost?.toFixed(2)}</p>
                             </div>
                             <div>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Unit. Costo</p>
                                <p className="text-xs font-black text-blue-600">${lot.unitCost?.toFixed(2)}</p>
                             </div>
                          </div>
                        </div>
                        <div className="bg-white px-3 py-1 rounded-full border border-slate-100">
                            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest leading-none">Stk: {lot.remainingStock}</span>
                        </div>
                      </div>
                    ))}
                    {(product.lots || []).length === 0 && (
                      <div className="py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-dashed border-slate-200">
                           <History size={32} className="text-slate-200" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No hay historial de importaciones</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'import' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="p-6 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-900/20">
                      <Plus size={32} />
                    </div>
                    <div>
                      <h3 className="font-black text-blue-900 uppercase tracking-tight italic">Nuevo Lote de Importación</h3>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Añadir stock a este producto</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cantidad Nueva</label>
                      <input 
                        type="number"
                        value={importData.quantity}
                        onChange={(e) => setImportData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-2xl"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Costo Total Lote ($)</label>
                      <input 
                        type="number"
                        step="0.01"
                        value={importData.totalCost}
                        onChange={(e) => setImportData(prev => ({ ...prev, totalCost: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl outline-none font-black text-2xl text-emerald-600"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900 p-8 rounded-[2.5rem] flex justify-between items-center text-white">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[.3em] mb-1">Costo Unitario de esta importación</p>
                      <p className="text-4xl font-black tracking-tighter italic text-blue-400">
                        ${(importData.quantity > 0 ? importData.totalCost / importData.quantity : 0).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={handleNewImport}
                      disabled={isSubmitting || importData.quantity <= 0}
                      className="bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-black uppercase text-xs hover:bg-blue-400 hover:text-white transition-all shadow-xl disabled:opacity-20 transform active:scale-[0.98]"
                    >
                      {isSubmitting ? 'Registrando...' : 'Confirmar Importación'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'withdraw' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="p-6 bg-orange-50 rounded-[2rem] border border-orange-100 flex items-center gap-4">
                    <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                      <ArrowUpCircle size={28} />
                    </div>
                    <div>
                      <h3 className="font-black text-orange-900 uppercase tracking-tight">Retirar Stock</h3>
                      <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Stock actual: {product.totalStock} unidades</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cantidad a Retirar</label>
                      <input type="number" min={1} max={product.totalStock}
                        value={withdrawAmount === 0 ? '' : withdrawAmount}
                        onFocus={e => e.target.select()}
                        onChange={e => setWithdrawAmount(parseInt(e.target.value) || 0)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-2xl text-orange-600"
                        placeholder="0" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Motivo del Retiro</label>
                      <input type="text"
                        value={withdrawReason}
                        onChange={e => setWithdrawReason(e.target.value)}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium"
                        placeholder="Ej: Producto dañado, muestra, etc." />
                    </div>
                  </div>

                  {!withdrawConfirm ? (
                    <button onClick={() => setWithdrawConfirm(true)}
                      disabled={withdrawAmount <= 0 || withdrawAmount > product.totalStock}
                      className="w-full bg-orange-500 text-white font-black py-5 rounded-[2rem] hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 disabled:opacity-30 transform active:scale-[0.98] uppercase tracking-widest text-sm">
                      Continuar con el Retiro →
                    </button>
                  ) : (
                    <div className="bg-orange-950 rounded-[2rem] p-8 space-y-6 text-white">
                      <p className="font-bold text-orange-200 text-center text-sm">¿Confirmas el retiro de <span className="font-black text-white text-xl">{withdrawAmount}</span> unidades de <span className="italic">{product.name}</span>?</p>
                      <p className="text-[10px] font-bold text-orange-400 text-center uppercase tracking-widest">Esta acción se registrará en el Diario de Operaciones.</p>
                      <div className="flex gap-3">
                        <button onClick={() => setWithdrawConfirm(false)}
                          className="flex-1 bg-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/20 transition-all text-sm uppercase tracking-widest">
                          Cancelar
                        </button>
                        <button onClick={handleWithdraw} disabled={isSubmitting}
                          className="flex-1 bg-orange-500 text-white font-black py-4 rounded-2xl hover:bg-orange-400 transition-all shadow-lg shadow-orange-900/50 disabled:opacity-50 text-sm uppercase tracking-widest">
                          {isSubmitting ? 'Procesando...' : 'Confirmar Retiro'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
