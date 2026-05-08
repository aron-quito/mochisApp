import { User as UserIcon, Settings, LogOut, Shield, MapPin, Phone, Mail } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileViewProps {
  user: any;
  onLogout?: () => void;
}

export function ProfileView({ user, onLogout }: ProfileViewProps) {
  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Perfil de Administrador</h1>
        <p className="text-slate-500 mt-1 text-lg">Gestiona tu cuenta y preferencias del sistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bento-card p-8 flex flex-col items-center text-center">
             <div className="w-32 h-32 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white mb-6 shadow-2xl shadow-slate-200 rotate-3 hover:rotate-0 transition-transform">
               <UserIcon size={48} className="-rotate-3" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">{user?.email || 'Administrador'}</h2>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1 mb-6">Super Admin</p>
             
             <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-6 py-3.5 rounded-2xl font-bold transition-all border border-red-100"
             >
                <LogOut size={18} />
                Cerrar Sesión
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
