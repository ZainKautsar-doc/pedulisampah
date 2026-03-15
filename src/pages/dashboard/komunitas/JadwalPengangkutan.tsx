import React, { useState } from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { useAppContext } from '../../../store/AppContext';
import { Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { AddressDisplay } from '../../../components/AddressDisplay';

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

export const JadwalPengangkutan = () => {
  const { reports, pickupSchedules, addSchedule } = useAppContext();
  
  const [reportId, setReportId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Only show reports that need scheduling
  const availableReports = reports.filter(r => r.status === 'Diproses' || r.status === 'Menunggu Verifikasi');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportId || !scheduledDate) {
      alert('Pilih laporan dan tanggal pengangkutan.');
      return;
    }

    addSchedule({
      reportId,
      scheduledDate,
      notes,
    });

    setReportId('');
    setScheduledDate('');
    setNotes('');
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <DashboardLayout requiredRole="komunitas">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Jadwal Pengangkutan</h1>
        <p className="text-slate-500 mt-2">Atur jadwal pengambilan sampah untuk laporan warga.</p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
            
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 relative z-10">
              <div className="p-2 bg-emerald-100/50 rounded-xl">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              Buat Jadwal Baru
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih Laporan</label>
                <select
                  value={reportId}
                  onChange={(e) => setReportId(e.target.value)}
                  className="mt-1 block w-full pl-4 pr-10 py-3 text-base border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 sm:text-sm rounded-2xl bg-white/50 backdrop-blur-sm border shadow-sm transition-all"
                >
                  <option value="">-- Pilih Laporan --</option>
                  {availableReports.map(r => (
                    <option key={r.id} value={r.id}>{r.title} ({r.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal & Waktu</label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="mt-1 block w-full pl-4 pr-10 py-3 text-base border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 sm:text-sm rounded-2xl bg-white/50 backdrop-blur-sm border shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Catatan Petugas</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 block w-full pl-4 pr-10 py-3 text-base border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 sm:text-sm rounded-2xl bg-white/50 backdrop-blur-sm border shadow-sm transition-all resize-none"
                  placeholder="Contoh: Bawa truk besar..."
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
              >
                Simpan Jadwal
              </motion.button>
            </form>

            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute inset-x-0 bottom-0 p-4"
                >
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <p className="text-sm font-medium text-emerald-800">
                      Jadwal berhasil ditambahkan!
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="glass-card rounded-3xl overflow-hidden h-full flex flex-col">
            <div className="px-6 py-5 border-b border-white/20 bg-white/40 backdrop-blur-md">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <div className="p-2 bg-slate-100/50 rounded-xl">
                  <Clock className="h-5 w-5 text-slate-500" />
                </div>
                Daftar Jadwal Pengangkutan
              </h3>
            </div>
            
            <div className="divide-y divide-white/20 flex-1 overflow-y-auto p-2">
              {pickupSchedules.length > 0 ? (
                pickupSchedules.map((schedule, index) => {
                  const report = reports.find(r => r.id === schedule.reportId);
                  return (
                    <motion.div 
                      key={schedule.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 m-2 rounded-2xl hover:bg-white/50 transition-all duration-300 border border-transparent hover:border-white/40 hover:shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                        <div>
                          <h4 className="text-lg font-bold text-slate-800">{report?.title || 'Laporan tidak ditemukan'}</h4>
                          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1.5">
                            <MapPin className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                            {report ? <AddressDisplay lat={report.lat} lng={report.lng} className="truncate max-w-[200px] sm:max-w-[300px]" /> : 'Lokasi tidak diketahui'}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100/50 text-emerald-800 px-4 py-2 rounded-xl text-sm font-bold text-center shadow-sm whitespace-nowrap">
                          <div className="text-[10px] uppercase tracking-wider text-emerald-600/80 mb-1">Jadwal</div>
                          {format(new Date(schedule.scheduledDate), 'dd MMM yyyy HH:mm', { locale: id })}
                        </div>
                      </div>
                      {schedule.notes && (
                        <div className="bg-white/60 p-3.5 rounded-xl border border-white/40 text-sm text-slate-600 shadow-sm">
                          <span className="font-semibold text-slate-700">Catatan:</span> {schedule.notes}
                        </div>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-slate-100/50 rounded-2xl flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">Belum ada jadwal pengangkutan.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};
