import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { useAppContext } from '../../../store/AppContext';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProfilWarga = () => {
  const { currentUser } = useAppContext();

  if (!currentUser) return null;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <DashboardLayout requiredRole="warga">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="glass-card rounded-3xl overflow-hidden max-w-2xl"
      >
        <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-600 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-20 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl"></div>
          
          <div className="absolute -bottom-12 left-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="w-24 h-24 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg border border-white/50"
            >
              <div className="w-full h-full bg-emerald-100/80 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-emerald-600" />
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="pt-16 px-8 pb-8 bg-white/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-slate-900">{currentUser.name}</h2>
              <p className="text-emerald-600 font-medium capitalize">{currentUser.role}</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-yellow-100/80 text-yellow-800 px-4 py-2 rounded-xl font-bold flex items-center gap-2 border border-yellow-200/50 shadow-sm"
            >
              <span className="text-sm uppercase tracking-wider">Total Poin:</span>
              <span className="text-xl">{currentUser.points}</span>
            </motion.div>
          </div>

          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.6 } }
            }}
            className="space-y-4"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100/60 hover:bg-slate-50/80 transition-colors">
              <div className="bg-white/80 p-3 rounded-xl shadow-sm border border-slate-100">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Email</p>
                <p className="text-slate-900 font-medium">warga@pedulisampah.id (Dummy)</p>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100/60 hover:bg-slate-50/80 transition-colors">
              <div className="bg-white/80 p-3 rounded-xl shadow-sm border border-slate-100">
                <Phone className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">No. Telepon</p>
                <p className="text-slate-900 font-medium">+62 812 3456 7890 (Dummy)</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100/60 hover:bg-slate-50/80 transition-colors">
              <div className="bg-white/80 p-3 rounded-xl shadow-sm border border-slate-100">
                <MapPin className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Alamat</p>
                <p className="text-slate-900 font-medium">Jl. Lingkungan Bersih No. 123, Jakarta (Dummy)</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 pt-6 border-t border-slate-100/60"
          >
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-slate-100/80 text-slate-700 font-bold rounded-xl hover:bg-slate-200/80 transition-colors w-full sm:w-auto shadow-sm border border-slate-200/50"
            >
              Edit Profil (Coming Soon)
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};
