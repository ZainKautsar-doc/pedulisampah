import { PublicLayout } from '../../components/layout/PublicLayout';
import { useAppContext } from '../../store/AppContext';
import { Trophy, Medal, Award } from 'lucide-react';
import { clsx } from 'clsx';
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
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

export const Leaderboard = () => {
  const { users } = useAppContext();
  
  const wargaUsers = users
    .filter(u => u.role === 'warga')
    .sort((a, b) => b.points - a.points);

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div 
          className="text-center mb-12 relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Pahlawan Lingkungan</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Daftar warga dengan kontribusi terbaik dalam menjaga kebersihan lingkungan.</p>
        </motion.div>

        <motion.div 
          className="glass-card rounded-3xl overflow-hidden relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50/50 border-b border-emerald-100/50">
            <h2 className="text-xl font-bold text-emerald-900 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl shadow-sm">
                <Trophy className="h-6 w-6 text-emerald-600" />
              </div>
              Leaderboard Poin
            </h2>
          </div>
          <ul className="divide-y divide-white/20 p-2">
            {wargaUsers.map((user, index) => (
              <motion.li 
                key={user.id} 
                variants={itemVariants}
                className="p-4 m-2 rounded-2xl flex items-center hover:bg-white/50 transition-all duration-300 border border-transparent hover:border-white/40 hover:shadow-sm"
              >
                <div className="flex-shrink-0 w-16 flex justify-center">
                  {index === 0 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                      <Trophy className="h-10 w-10 text-yellow-500 drop-shadow-md" />
                    </motion.div>
                  )}
                  {index === 1 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}>
                      <Medal className="h-10 w-10 text-slate-400 drop-shadow-md" />
                    </motion.div>
                  )}
                  {index === 2 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.4 }}>
                      <Award className="h-10 w-10 text-amber-600 drop-shadow-md" />
                    </motion.div>
                  )}
                  {index > 2 && <span className="text-2xl font-bold text-slate-300/80">#{index + 1}</span>}
                </div>
                <div className="ml-6 flex-1">
                  <h3 className="text-lg font-bold text-slate-800">{user.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">Warga Aktif</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <div className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-100 to-teal-50 text-emerald-800 font-bold border border-emerald-200/50 shadow-sm">
                    {user.points} <span className="text-emerald-600/80 ml-1 text-sm">Poin</span>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </PublicLayout>
  );
};
