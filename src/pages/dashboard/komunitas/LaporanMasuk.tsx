import React, { useState } from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { useAppContext, ReportStatus } from '../../../store/AppContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MapPin, User, Eye, Edit, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AddressDisplay } from '../../../components/AddressDisplay';

export const LaporanMasuk = () => {
  const { reports, users, updateReportStatus, addSchedule } = useAppContext();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [status, setStatus] = useState<ReportStatus>('Menunggu Verifikasi');
  const [tips, setTips] = useState('');
  
  // Scheduling fields
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReport) {
      if (status === 'Dijadwalkan') {
        if (!scheduledDate) {
          alert('Mohon isi tanggal pengangkutan.');
          return;
        }
        addSchedule({
          reportId: selectedReport,
          scheduledDate,
          notes: scheduleNotes
        });
        // addSchedule already updates the status to 'Dijadwalkan'
        if (tips) {
          updateReportStatus(selectedReport, 'Dijadwalkan', tips);
        }
      } else {
        updateReportStatus(selectedReport, status, tips);
      }
      setSelectedReport(null);
      setTips('');
      setScheduledDate('');
      setScheduleNotes('');
    }
  };

  const openModal = (reportId: string, currentStatus: ReportStatus, currentTips?: string) => {
    setSelectedReport(reportId);
    setStatus(currentStatus);
    setTips(currentTips || '');
    setScheduledDate('');
    setScheduleNotes('');
  };

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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", duration: 0.5, bounce: 0.3 } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
  };

  return (
    <DashboardLayout requiredRole="komunitas">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-slate-900">Manajemen Laporan</h1>
        <p className="text-slate-600 mt-1">Kelola dan verifikasi laporan sampah dari warga.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="glass-card rounded-3xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/60">
            <thead className="bg-slate-50/50 backdrop-blur-sm">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Laporan</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pelapor</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <motion.tbody 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/40 divide-y divide-slate-200/60"
            >
              {reports.map((report) => {
                const user = users.find(u => u.id === report.userId);
                return (
                  <motion.tr variants={itemVariants} key={report.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img className="h-16 w-16 rounded-xl object-cover shadow-sm" src={report.photoUrl} alt="" referrerPolicy="no-referrer" />
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">{report.title}</div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <AddressDisplay lat={report.lat} lng={report.lng} className="truncate max-w-[200px] sm:max-w-[300px]" />
                          </div>
                          <div className="text-xs text-slate-500 mt-1">{format(new Date(report.createdAt), 'dd MMM yyyy', { locale: id })}</div>
                          {report.userTip && (
                            <div className="mt-2 inline-flex items-center gap-1 bg-emerald-50/80 text-emerald-700 px-2 py-1 rounded-md text-xs font-medium border border-emerald-100/50 shadow-sm">
                              <Heart className="h-3 w-3" />
                              Tip: {report.userTip}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-900 font-medium">
                        <User className="h-4 w-4 mr-2 text-slate-400" />
                        {user?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                        report.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/50' :
                        report.status === 'Ditolak' ? 'bg-red-100 text-red-800 border border-red-200/50' :
                        report.status === 'Menunggu Verifikasi' ? 'bg-slate-100 text-slate-800 border border-slate-200/50' :
                        'bg-orange-100 text-orange-800 border border-orange-200/50'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal(report.id, report.status, report.tips)}
                        className="text-emerald-600 hover:text-emerald-900 bg-emerald-50/80 px-3 py-2 rounded-xl flex items-center gap-2 transition-colors border border-emerald-100/50 shadow-sm"
                      >
                        <Edit className="h-4 w-4" />
                        Update
                      </motion.button>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal Update Status */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                aria-hidden="true" 
                onClick={() => setSelectedReport(null)}
              />
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <motion.div 
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="inline-block align-bottom bg-white/90 backdrop-blur-md rounded-3xl text-left overflow-hidden shadow-2xl border border-white/20 transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              >
                <form onSubmit={handleUpdateStatus}>
                  <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-xl leading-6 font-bold text-slate-900 mb-6" id="modal-title">
                      Update Status Laporan
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Status Baru</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as ReportStatus)}
                          className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-slate-200/60 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-xl bg-slate-50/50 border shadow-sm"
                        >
                          <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                          <option value="Diproses">Diproses</option>
                          <option value="Dijadwalkan">Dijadwalkan</option>
                          <option value="Selesai">Selesai</option>
                          <option value="Ditolak">Ditolak</option>
                        </select>
                      </div>

                      {status === 'Dijadwalkan' && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 bg-emerald-50/80 p-4 rounded-2xl border border-emerald-100/50 shadow-sm"
                        >
                          <h4 className="font-bold text-emerald-900">Detail Pengangkutan</h4>
                          <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">Tanggal Pengangkutan</label>
                            <input
                              type="date"
                              value={scheduledDate}
                              onChange={(e) => setScheduledDate(e.target.value)}
                              className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-slate-200/60 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-xl bg-white/80 border shadow-sm"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">Catatan Petugas</label>
                            <textarea
                              rows={2}
                              value={scheduleNotes}
                              onChange={(e) => setScheduleNotes(e.target.value)}
                              className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-slate-200/60 rounded-xl bg-white/80 border p-3"
                              placeholder="Contoh: Siapkan di depan rumah..."
                            />
                          </div>
                        </motion.div>
                      )}

                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Tips Penanganan (Opsional)</label>
                        <p className="text-xs text-slate-500 mb-2">Berikan tips atau catatan untuk warga terkait laporan ini.</p>
                        <textarea
                          rows={3}
                          value={tips}
                          onChange={(e) => setTips(e.target.value)}
                          className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-slate-200/60 rounded-xl bg-slate-50/50 border p-3"
                          placeholder="Contoh: Pisahkan sampah plastik dari organik..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50/50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse gap-3 border-t border-slate-100/60">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-base font-medium text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:w-auto sm:text-sm"
                    >
                      Simpan Perubahan
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-200 shadow-sm px-4 py-2 bg-white/80 text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => setSelectedReport(null)}
                    >
                      Batal
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};
