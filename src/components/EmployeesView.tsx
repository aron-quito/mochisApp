import { useState, useEffect, FormEvent } from 'react';
import { apiFetch } from '../lib/api';
import { Users, Plus, X, CheckCircle2, AlertCircle, Edit, UserCheck, UserX, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  address: string;
  email: string;
  active: number;
  createdAt: string;
}

const EMPTY_FORM = { firstName: '', lastName: '', dni: '', birthDate: '', address: '', email: '', password: '' };

// Standalone to avoid remount on parent re-render
function Field({ label, id, type = 'text', value, onChange, required = false, placeholder = '' }:
  { label: string; id: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all font-medium" />
    </div>
  );
}

export function EmployeesView() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const load = async () => {
    try {
      const data = await apiFetch('/employees.php');
      setEmployees(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const showNotif = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const openCreate = () => { setEditingEmployee(null); setFormData(EMPTY_FORM); setIsModalOpen(true); };
  const openEdit = (e: Employee) => { setEditingEmployee(e); setFormData({ ...e, password: '' }); setIsModalOpen(true); };

  const handleSubmit = async (evt: FormEvent) => {
    evt.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        await apiFetch(`/employees.php?id=${editingEmployee.id}`, { method: 'PUT', body: JSON.stringify(formData) });
        showNotif('success', 'Empleado actualizado.');
      } else {
        await apiFetch('/employees.php', { method: 'POST', body: JSON.stringify(formData) });
        showNotif('success', 'Empleado registrado exitosamente.');
      }
      setIsModalOpen(false);
      load();
    } catch (err: any) {
      showNotif('error', err.message || 'Error al guardar empleado.');
    } finally { setIsSubmitting(false); }
  };

  const toggleActive = async (emp: Employee) => {
    try {
      await apiFetch(`/employees.php?id=${emp.id}`, { method: 'PUT', body: JSON.stringify({ active: emp.active ? 0 : 1 }) });
      showNotif('success', emp.active ? 'Empleado desactivado.' : 'Empleado activado.');
      load();
    } catch { showNotif('error', 'Error al cambiar estado.'); }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Empleados</h1>
          <p className="text-slate-500 mt-1">Gestión de acceso y datos del personal.</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={openCreate}
          className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-slate-200 shrink-0">
          <Plus size={18} /> Nuevo Empleado
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Empleados', value: employees.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Activos', value: employees.filter(e => e.active).length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Inactivos', value: employees.filter(e => !e.active).length, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(s => (
          <div key={s.label} className="bento-card flex items-center gap-4">
            <div className={cn('p-3 rounded-xl', s.bg, s.color)}><Users size={20} /></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Employee Cards */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 font-bold">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp, i) => (
            <motion.div key={emp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={cn('bento-card space-y-4', !emp.active && 'opacity-50')}>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-blue-700 flex items-center justify-center text-white font-black text-lg shadow-lg">
                    {emp.firstName[0]}{emp.lastName[0]}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 leading-tight">{emp.firstName} {emp.lastName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DNI: {emp.dni}</p>
                  </div>
                </div>
                <span className={cn('text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest',
                  emp.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400')}>
                  {emp.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-1 text-sm">
                <p className="text-slate-600 font-medium truncate">{emp.email}</p>
                {emp.address && <p className="text-slate-400 text-xs truncate">{emp.address}</p>}
                {emp.birthDate && <p className="text-slate-400 text-xs">Nac: {new Date(emp.birthDate).toLocaleDateString('es')}</p>}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-50">
                <button onClick={() => openEdit(emp)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest transition-all">
                  <Edit size={13} /> Editar
                </button>
                <button onClick={() => toggleActive(emp)}
                  className={cn('flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all',
                    emp.active ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600')}>
                  {emp.active ? <><UserX size={13} /> Desactivar</> : <><UserCheck size={13} /> Activar</>}
                </button>
              </div>
            </motion.div>
          ))}
          {employees.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 italic">No hay empleados registrados.</div>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              className="relative bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                    {editingEmployee ? <Edit size={18} /> : <Plus size={18} />}
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900">{editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Datos del personal</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nombre" id="firstName" value={formData.firstName} onChange={v => setFormData(d => ({ ...d, firstName: v }))} required />
                  <Field label="Apellido" id="lastName" value={formData.lastName} onChange={v => setFormData(d => ({ ...d, lastName: v }))} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="DNI / Cédula" id="dni" value={formData.dni} onChange={v => setFormData(d => ({ ...d, dni: v }))} required={!editingEmployee} />
                  <Field label="Fecha de Nacimiento" id="birthDate" type="date" value={formData.birthDate} onChange={v => setFormData(d => ({ ...d, birthDate: v }))} />
                </div>
                <Field label="Correo Electrónico" id="email" type="email" value={formData.email} onChange={v => setFormData(d => ({ ...d, email: v }))} required={!editingEmployee} />
                <Field label="Dirección" id="address" value={formData.address} onChange={v => setFormData(d => ({ ...d, address: v }))} placeholder="Calle, ciudad..." />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <KeyRound size={10} /> {editingEmployee ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                  </label>
                  <input type="password" value={formData.password} required={!editingEmployee}
                    onChange={e => setFormData(d => ({ ...d, password: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all font-medium" />
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={isSubmitting}
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-50 transform active:scale-[0.98]">
                    {isSubmitting ? 'Guardando...' : editingEmployee ? 'Guardar Cambios' : 'Registrar Empleado'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={cn('fixed bottom-8 right-4 md:right-8 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-medium text-sm',
              notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600')}>
            {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
