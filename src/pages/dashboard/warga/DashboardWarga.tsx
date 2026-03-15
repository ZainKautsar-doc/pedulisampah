import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { useAppContext } from '../../../store/AppContext';
import { FileText, Clock, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

export const DashboardWarga = () => {
  const { currentUser, reports } = useAppContext();

  if (!currentUser) return null;

  const myReports = reports.filter(r => r.userId === currentUser.id);
  const processingReports = myReports.filter(r => r.status === 'Diproses' || r.status === 'Dijadwalkan').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <DashboardLayout requiredRole="warga">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-slate-900">Halo, {currentUser.name}! 👋</h1>
        <p className="text-slate-600 mt-1">Bantu jaga lingkungan kita yuk! Mulai dari hal kecil di sekitarmu.</p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl flex items-center">
          <div className="bg-blue-50/80 p-4 rounded-2xl mr-4 border border-blue-100/50">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Laporan</p>
            <h3 className="text-3xl font-bold text-slate-900">{myReports.length}</h3>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl flex items-center">
          <div className="bg-orange-50/80 p-4 rounded-2xl mr-4 border border-orange-100/50">
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Sedang Diproses</p>
            <h3 className="text-3xl font-bold text-slate-900">{processingReports}</h3>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl flex items-center">
          <div className="bg-emerald-50/80 p-4 rounded-2xl mr-4 border border-emerald-100/50">
            <Gift className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Poin</p>
            <h3 className="text-3xl font-bold text-slate-900">{currentUser.points}</h3>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="glass-card rounded-3xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-100/50 bg-white/40">
          <h3 className="text-lg font-bold text-slate-900">Laporan Terakhir Kamu</h3>
        </div>
        <div className="divide-y divide-slate-100/50">
          {myReports.slice(0, 3).length > 0 ? (
            myReports.slice(0, 3).map(report => (
              <div key={report.id} className="p-6 flex items-center hover:bg-slate-50/50 transition-colors">
                <img src={report.photoUrl} alt={report.title} className="w-16 h-16 rounded-xl object-cover shadow-sm" referrerPolicy="no-referrer" />
                <div className="ml-4 flex-1">
                  <h4 className="text-md font-bold text-slate-900">{report.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">{new Date(report.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="ml-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    report.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    report.status === 'Ditolak' ? 'bg-red-100 text-red-800 border border-red-200' :
                    report.status === 'Menunggu Verifikasi' ? 'bg-slate-100 text-slate-800 border border-slate-200' :
                    'bg-orange-100 text-orange-800 border border-orange-200'
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              Belum ada laporan nih. Yuk mulai laporin tumpukan sampah di sekitar kamu!
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};
