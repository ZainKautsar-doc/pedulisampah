import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { useAppContext } from '../../../store/AppContext';
import { Users, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

export const ProfilKomunitas = () => {
  const { currentUser } = useAppContext();

  if (!currentUser) return null;

  return (
    <DashboardLayout requiredRole="komunitas">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Profil Komunitas</h1>
      </motion.div>

      <motion.div 
        className="glass-card rounded-3xl overflow-hidden max-w-2xl relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="h-40 bg-gradient-to-r from-emerald-500 to-teal-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -bottom-12 left-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
              className="w-28 h-28 bg-white/40 backdrop-blur-md rounded-full p-1.5 shadow-xl border border-white/50"
            >
              <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-50 rounded-full flex items-center justify-center border border-white/60">
                <Users className="h-12 w-12 text-emerald-600" />
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="pt-20 px-8 pb-8 relative z-10">
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{currentUser.name}</h2>
              <p className="text-emerald-600 font-semibold capitalize mt-1">Tim Eksekutor & Pengelola</p>
            </div>
            <div className="bg-gradient-to-r from-emerald-100 to-teal-50 border border-emerald-200/50 text-emerald-800 px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-sm">
              <span className="text-xs uppercase tracking-wider text-emerald-600/80">Status:</span>
              <span className="text-sm">Aktif</span>
            </div>
          </motion.div>

          <div className="space-y-4">
            <motion.div variants={itemVariants} className="flex items-center gap-5 p-5 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60 shadow-sm hover:bg-white/60 transition-colors duration-300">
              <div className="bg-gradient-to-br from-slate-100 to-slate-50 p-3.5 rounded-xl shadow-sm border border-white">
                <Mail className="h-6 w-6 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Email Kontak</p>
                <p className="text-slate-800 font-semibold">komunitas@pedulisampah.id (Dummy)</p>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex items-center gap-5 p-5 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60 shadow-sm hover:bg-white/60 transition-colors duration-300">
              <div className="bg-gradient-to-br from-slate-100 to-slate-50 p-3.5 rounded-xl shadow-sm border border-white">
                <Phone className="h-6 w-6 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Hotline</p>
                <p className="text-slate-800 font-semibold">021-888-9999 (Dummy)</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-5 p-5 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60 shadow-sm hover:bg-white/60 transition-colors duration-300">
              <div className="bg-gradient-to-br from-slate-100 to-slate-50 p-3.5 rounded-xl shadow-sm border border-white">
                <MapPin className="h-6 w-6 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Markas Operasional</p>
                <p className="text-slate-800 font-semibold">Gedung Pengelolaan Sampah Terpadu, Jakarta (Dummy)</p>
              </div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="mt-10 pt-8 border-t border-white/20">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3.5 bg-white/50 backdrop-blur-sm border border-white/60 text-slate-700 font-bold rounded-2xl hover:bg-white/80 transition-all shadow-sm w-full sm:w-auto"
            >
              Edit Profil (Coming Soon)
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};
