import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { useAppContext } from '../../../store/AppContext';
import { Inbox, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, subDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion } from 'framer-motion';

export const DashboardKomunitas = () => {
  const { currentUser, reports } = useAppContext();

  if (!currentUser) return null;

  const totalReports = reports.length;
  const unverifiedReports = reports.filter(r => r.status === 'Menunggu Verifikasi').length;
  const processingReports = reports.filter(r => r.status === 'Diproses' || r.status === 'Dijadwalkan').length;
  const completedReports = reports.filter(r => r.status === 'Selesai').length;

  // Data for Line Chart (Laporan per Hari - last 7 days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    return format(d, 'dd MMM', { locale: id });
  });

  const lineChartData = last7Days.map(dateStr => {
    const count = reports.filter(r => format(new Date(r.createdAt), 'dd MMM', { locale: id }) === dateStr).length;
    return { name: dateStr, Laporan: count };
  });

  // Data for Pie Chart (Jenis Sampah)
  const pieChartData = [
    { name: 'Organik', value: reports.filter(r => r.category === 'organik').length },
    { name: 'Anorganik', value: reports.filter(r => r.category === 'anorganik').length },
    { name: 'B3', value: reports.filter(r => r.category === 'B3').length },
  ].filter(d => d.value > 0);

  const COLORS = ['#10b981', '#3b82f6', '#ef4444']; // emerald, blue, red

  // Data for Donut Chart (Status Laporan)
  const donutChartData = [
    { name: 'Menunggu', value: unverifiedReports },
    { name: 'Diproses/Dijadwalkan', value: processingReports },
    { name: 'Selesai', value: completedReports },
  ].filter(d => d.value > 0);

  const DONUT_COLORS = ['#f59e0b', '#3b82f6', '#10b981']; // amber, blue, emerald

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
    <DashboardLayout requiredRole="komunitas">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Komunitas</h1>
        <p className="text-slate-600 mt-1">Ringkasan aktivitas pengelolaan sampah.</p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl flex flex-col">
          <div className="bg-blue-50/80 p-3 rounded-2xl w-fit mb-4 border border-blue-100/50">
            <Inbox className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Laporan</p>
          <h3 className="text-3xl font-bold text-slate-900">{totalReports}</h3>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl flex flex-col">
          <div className="bg-red-50/80 p-3 rounded-2xl w-fit mb-4 border border-red-100/50">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Belum Verifikasi</p>
          <h3 className="text-3xl font-bold text-slate-900">{unverifiedReports}</h3>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl flex flex-col">
          <div className="bg-orange-50/80 p-3 rounded-2xl w-fit mb-4 border border-orange-100/50">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Sedang Diproses</p>
          <h3 className="text-3xl font-bold text-slate-900">{processingReports}</h3>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl flex flex-col">
          <div className="bg-emerald-50/80 p-3 rounded-2xl w-fit mb-4 border border-emerald-100/50">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Selesai</p>
          <h3 className="text-3xl font-bold text-slate-900">{completedReports}</h3>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      >
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Laporan per Hari (7 Hari Terakhir)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)' }}
                />
                <Line type="monotone" dataKey="Laporan" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Jenis Sampah</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    labelLine={false}
                    stroke="none"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Status Laporan</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    labelLine={false}
                    stroke="none"
                  >
                    {donutChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="glass-card rounded-3xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-100/50 flex justify-between items-center bg-white/40">
          <h3 className="text-lg font-bold text-slate-900">Laporan Terbaru</h3>
        </div>
        <div className="divide-y divide-slate-100/50">
          {reports.slice(0, 5).map(report => (
            <div key={report.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center">
                <img src={report.photoUrl} alt={report.title} className="w-12 h-12 rounded-xl object-cover shadow-sm" referrerPolicy="no-referrer" />
                <div className="ml-4">
                  <h4 className="text-md font-bold text-slate-900">{report.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{new Date(report.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              <div>
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
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};
