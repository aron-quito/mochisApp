import { User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogOut, User as UserIcon, Mail, Shield, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

export function ProfileView({ user }: { user: User }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Mi Perfil</h1>
        <p className="text-slate-500 mt-2 text-lg">Configuración de cuenta y detalles de acceso.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bento-card bento-card-hover text-center relative overflow-hidden h-full flex flex-col justify-center">
            {/* Background design */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-10" />
            
            <div className="relative mt-8">
              <div className="w-24 h-24 bg-white rounded-3xl mx-auto mb-6 flex items-center justify-center overflow-hidden border-4 border-slate-50 shadow-xl ring-1 ring-slate-100">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={40} className="text-slate-300" />
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">{user.displayName || 'Usuario de RopaStock'}</h2>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100">
                <Shield size={12} />
                Administrador
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          {[
            { label: 'Correo Electrónico', value: user.email, icon: Mail, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Rol de Sistema', value: 'Administrador Senior', icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            { label: 'Ubicación Predeterminada', value: 'Almacén Central (Lima, PE)', icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bento-card bento-card-hover flex items-center gap-5 p-5 group"
            >
              <div className={`${item.bg} ${item.color} p-4 rounded-2xl transition-transform group-hover:scale-110 duration-300`}>
                <item.icon size={22} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[.2em] mb-1">{item.label}</p>
                <p className="text-slate-900 font-bold text-lg">{item.value}</p>
              </div>
            </motion.div>
          ))}

          <button
            onClick={() => auth.signOut()}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-red-50 text-red-600 font-bold py-5 rounded-3xl hover:bg-red-50 transition-all group shadow-sm hover:shadow-md"
          >
            <LogOut className="group-hover:translate-x-1 transition-transform" />
            Cerrar Sesión de la Aplicación
          </button>
        </div>
      </div>
    </div>
  );
}
