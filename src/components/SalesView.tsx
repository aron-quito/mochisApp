import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Lot, Product, PaymentMethod } from '../types';
import { 
  Search, 
  ShoppingCart, 
  CreditCard, 
  Banknote, 
  Globe, 
  Trash2, 
  CheckCircle2, 
  X,
  Plus,
  ShoppingBag,
  Package,
  History,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface CartItem {
  product: Product;
  quantity: number;
  lotId?: string;
  lotInfo?: Lot;
}

export function SalesView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedProductForLot, setSelectedProductForLot] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiFetch('/products.php');
        setProducts(data);
      } catch (error) {
        console.error('Error loading products', error);
      }
    };
    fetchProducts();
  }, []);

  const addToCartWithLot = (product: Product, lot?: Lot) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.lotId === lot?.id);
      const maxAvailable = lot ? lot.remainingStock : product.totalStock;

      if (existing) {
        if (existing.quantity >= maxAvailable) return prev;
        return prev.map(item => 
          (item.product.id === product.id && item.lotId === lot?.id) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1, lotId: lot?.id, lotInfo: lot }];
    });
    setSelectedProductForLot(null);
  };

  const addToCart = (product: Product) => {
    if (product.totalStock <= 0) return;
    
    // If product has lots, we should select one
    const availableLots = product.lots?.filter(l => l.remainingStock > 0) || [];
    
    if (availableLots.length > 1) {
      setSelectedProductForLot(product);
    } else {
      addToCartWithLot(product, availableLots[0]);
    }
  };

  const removeFromCart = (productId: string, lotId?: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.lotId === lotId)));
  };

  const updateQuantity = (productId: string, lotId: string | undefined, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId && item.lotId === lotId) {
        const maxAvailable = item.lotInfo ? item.lotInfo.remainingStock : item.product.totalStock;
        const newQty = Math.max(1, Math.min(maxAvailable, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const totalPrice = cart.reduce((acc, item) => acc + (item.product.sellingPrice * item.quantity), 0);

  const filteredProducts = products.filter(p => 
    p.totalStock > 0 && (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handlePayment = async () => {
    if (!paymentMethod || cart.length === 0) return;
    setIsProcessing(true);
    try {
      for (const item of cart) {
        await apiFetch('/sales.php', {
          method: 'POST',
          body: JSON.stringify({
            productId: item.product.id,
            lotId: item.lotId || null,
            sku: item.product.sku,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: item.product.sellingPrice,
            totalPrice: item.product.sellingPrice * item.quantity,
            paymentMethod: paymentMethod,
            location: item.product.location,
          })
        });
      }

      setCart([]);
      setIsCheckoutOpen(false);
      setPaymentMethod(null);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        window.location.reload(); // Reload to refresh product stock
      }, 2000);
    } catch (error) {
      console.error("Sale error", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full relative py-4">
      {/* Catalog Section */}
      <div className="flex-1 space-y-6 overflow-hidden flex flex-col">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Caja POS</h1>
            <p className="text-slate-500 mt-1 text-lg">Punto de venta y registro rápido.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Sistema Online</span>
          </div>
        </header>

        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Escanear etiqueta o buscar prenda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none shadow-sm transition-all text-base font-medium"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {filteredProducts.map((product) => (
              <motion.button
                layout
                key={product.id}
                whileHover={product.totalStock > 0 ? { scale: 1.02 } : {}}
                whileTap={product.totalStock > 0 ? { scale: 0.98 } : {}}
                onClick={() => addToCart(product)}
                disabled={product.totalStock <= 0}
                className={cn(
                  "bento-card text-left p-0 overflow-hidden flex flex-col relative group transition-all duration-300",
                  product.totalStock <= 0 ? "opacity-40 grayscale cursor-not-allowed" : "hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100"
                )}
              >
                <div className="aspect-square bg-slate-100 relative">
                   {product.imageUrl ? (
                     <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingBag size={40} />
                     </div>
                   )}
                   <div className="absolute bottom-2 right-2">
                      <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-slate-900 border border-slate-200 shadow-sm">
                         Stk: {product.totalStock}
                      </div>
                   </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-extrabold text-slate-900 text-xs mb-1 uppercase tracking-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-lg font-black text-slate-900 tracking-tighter">${product.sellingPrice.toFixed(2)}</span>
                    <div className="bg-slate-50 p-1.5 rounded-lg text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                       <Plus size={16} />
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Panel - Enhanced Bento Style Dark */}
      <div className="w-full lg:w-[400px] bg-slate-900 rounded-[2.5rem] p-8 flex flex-col shadow-[0_32px_64px_-16px_rgba(15,23,42,0.3)] text-white relative overflow-hidden border border-slate-800">
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600 rounded-full blur-[100px] opacity-20" />
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50 rotate-3">
                <ShoppingCart size={20} className="-rotate-3" />
              </div>
              <div>
                <h2 className="font-black text-xl tracking-tight leading-none uppercase italic">Resumen</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Transacción Pos</p>
              </div>
            </div>
            <div className="bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">
               <span className="text-blue-400 font-black text-xs">{cart.length} prendas</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-8 custom-scrollbar pr-2">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div 
                  layout
                  key={item.product.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-4 p-4 bg-slate-800/40 rounded-3xl border border-slate-800/50 backdrop-blur-sm group"
                >
                  <div className="w-16 h-16 bg-slate-700 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                         <Package size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm uppercase text-slate-100 truncate">{item.product.name}</h4>
                      {item.lotInfo && (
                        <span className="text-[8px] font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 uppercase tracking-widest leading-none">
                          Lote {item.lotInfo.importDate ? new Date(item.lotInfo.importDate).toLocaleDateString() : 'N/A'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.lotId, -1)}
                          className="w-6 h-6 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-300 hover:text-slate-900 transition-colors"
                        >-</button>
                        <span className="text-xs font-black w-3 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.lotId, 1)}
                          className="w-6 h-6 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-300 hover:text-slate-900 transition-colors"
                        >+</button>
                      </div>
                      <span className="font-black text-blue-400">${(item.product.sellingPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.product.id, item.lotId)}
                    className="text-slate-600 hover:text-red-400 transition-colors self-start p-1"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 py-12">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700 border-dashed">
                  <ShoppingCart size={32} className="opacity-20" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[.3em] opacity-40">Carrito Vacío</p>
              </div>
            )}
          </div>

          <div className="mt-auto space-y-6">
            <div className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
               <div className="flex justify-between items-end">
                 <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Subtotal Final</p>
                    <span className="text-4xl font-black text-white tracking-tighter italic">${totalPrice.toFixed(2)}</span>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Impuesto Inc.</p>
                    <span className="text-slate-400 font-bold text-xs">IGV (18%)</span>
                 </div>
               </div>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full bg-white text-slate-900 font-black text-lg py-5 rounded-[2rem] hover:bg-blue-400 hover:text-white transition-all shadow-2xl disabled:opacity-20 disabled:grayscale transform active:scale-[0.98]"
            >
              Registrar Transacción
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal - Enhanced Bento */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 overflow-hidden border border-slate-100"
            >
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-100">
                  <CreditCard size={32} className="text-blue-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase italic mb-2">Método de Pago</h2>
                <p className="text-slate-500 font-medium">Confirmando total de <span className="font-black text-slate-900 tracking-tighter italic text-xl">${totalPrice.toFixed(2)}</span></p>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-10">
                {[
                  { id: 'Virtual', label: 'Billetera Digital', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { id: 'Cash', label: 'Efectivo / Cash', icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { id: 'Bank', label: 'Tarjeta / Transferencia', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.label as PaymentMethod)}
                    className={cn(
                      "group w-full flex items-center gap-5 p-5 rounded-[1.5rem] border-2 transition-all duration-300 text-left relative overflow-hidden",
                      paymentMethod === method.label 
                        ? "border-blue-600 bg-blue-50/20" 
                        : "border-slate-50 hover:border-slate-200 bg-slate-50/50"
                    )}
                  >
                    <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm bg-white", method.color)}>
                      <method.icon size={22} />
                    </div>
                    <div className="flex-1">
                      <p className={cn("font-black text-lg tracking-tight", paymentMethod === method.label ? "text-blue-600" : "text-slate-900")}>{method.label}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Confirmación Inmediata</p>
                    </div>
                    {paymentMethod === method.label && (
                      <div className="bg-blue-600 text-white p-1 rounded-full">
                         <CheckCircle2 size={18} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                disabled={!paymentMethod || isProcessing}
                onClick={handlePayment}
                className="w-full bg-slate-900 text-white font-black text-xl py-5 rounded-[2rem] hover:bg-blue-600 transition-all shadow-2xl hover:shadow-blue-200 disabled:opacity-20 transform active:scale-[0.98]"
              >
                {isProcessing ? "Procesando..." : "Confirmar Pago Total"}
              </button>
              
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="w-full mt-4 text-slate-400 font-bold text-sm uppercase tracking-widest hover:text-slate-900 transition-colors"
                disabled={isProcessing}
              >
                Cancelar y Revisar Carrito
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Success Success */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/80 backdrop-blur-md"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-100">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Venta Registrada!</h2>
              <p className="text-gray-500">El pago se ha procesado correctamente y el inventario ha sido actualizado.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lot Selection Modal */}
      <AnimatePresence>
        {selectedProductForLot && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProductForLot(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 overflow-hidden"
            >
              <div className="mb-8">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                  <Package size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase italic mb-1">Seleccionar Lote</h3>
                <p className="text-slate-500 font-medium">¿De qué importación desea retirar la prenda?</p>
              </div>

              <div className="space-y-3">
                {selectedProductForLot.lots?.filter(l => l.remainingStock > 0).map((lot) => (
                  <button
                    key={lot.id}
                    onClick={() => addToCartWithLot(selectedProductForLot, lot)}
                    className="w-full flex items-center gap-4 p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                      <Calendar size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-slate-900 tracking-tight leading-none uppercase italic border-b border-transparent group-hover:border-blue-200 w-fit pb-0.5">
                        Importado: {lot.importDate ? new Date(lot.importDate).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Disp: {lot.remainingStock} unidades</p>
                    </div>
                    <Plus size={16} className="text-slate-300 group-hover:text-blue-500" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
