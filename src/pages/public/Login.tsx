import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { useAppContext, Role } from '../../store/AppContext';
import { Leaf, User, Users, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login = () => {
  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = (role: Role) => {
    login(role);
    navigate(`/dashboard/${role}`);
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
          className="max-w-md w-full space-y-8 glass-card p-10 rounded-3xl shadow-2xl border border-white/50 relative z-10"
        >
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto h-16 w-16 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100/50 mb-6"
            >
              <Leaf className="h-8 w-8 text-emerald-600" />
            </motion.div>
            <h2 className="mt-6 text-3xl font-bold text-slate-900 tracking-tight">
              Pilih Peran Anda
            </h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Prototype mode: Login tanpa password
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLogin('warga')}
              className="group relative w-full flex justify-center py-4 px-4 border border-emerald-100 text-sm font-bold rounded-2xl text-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50/50 hover:from-emerald-100 hover:to-teal-100/50 transition-all shadow-sm overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                <User className="h-5 w-5 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
              </span>
              Masuk sebagai Warga
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLogin('komunitas')}
              className="group relative w-full flex justify-center py-4 px-4 border border-teal-100 text-sm font-bold rounded-2xl text-teal-800 bg-gradient-to-r from-teal-50 to-cyan-50/50 hover:from-teal-100 hover:to-cyan-100/50 transition-all shadow-sm overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                <Users className="h-5 w-5 text-teal-500 group-hover:text-teal-600 transition-colors" />
              </span>
              Masuk sebagai Komunitas
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLogin('admin')}
              className="group relative w-full flex justify-center py-4 px-4 border border-slate-200 text-sm font-bold rounded-2xl text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-sm"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                <ShieldAlert className="h-5 w-5 text-slate-400 group-hover:text-slate-500 transition-colors" />
              </span>
              Masuk sebagai Admin
            </motion.button>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
};
