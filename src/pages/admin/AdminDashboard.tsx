import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Users, FileText, Clock, CheckCircle, Activity, MapPin, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar 
} from 'recharts';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  
  // Stats
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    completedReports: 0,
    totalUsers: 0
  });

  // Charts Data
  const [reportsPerDay, setReportsPerDay] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // Colors for charts
  const CATEGORY_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const STATUS_COLORS = {
    pending: '#f59e0b',
    verified: '#3b82f6',
    scheduled: '#8b5cf6',
    completed: '#10b981',
    rejected: '#ef4444'
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all reports for admin dashboard (without status/user filter or limit)
      const { data: allReports, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportsError) {
        console.error(reportsError);
        return;
      }

      const { data: allUsers, error: usersError } = await supabase.from('users').select('*');
      if (usersError) {
        console.error(usersError);
        return;
      }
      
      const reports = allReports || [];
      const users = allUsers || [];

      // Calculate Stats
      const pendingCount = reports.filter(r => r.status === 'pending' || r.status === 'Menunggu Verifikasi').length;
      const completedCount = reports.filter(r => r.status === 'completed' || r.status === 'Selesai').length;

      setStats({
        totalReports: reports.length,
        pendingReports: pendingCount,
        completedReports: completedCount,
        totalUsers: users.length
      });

      setRecentReports(reports.slice(0, 10));

      // Calculate Chart Data: Reports Per Day (Last 7 Days)
      const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const dailyData = last7Days.map(dateStr => {
        const count = reports.filter(r => r.created_at?.startsWith(dateStr)).length;
        // Format date for display
        const displayDate = new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        return { name: displayDate, total: count };
      });
      setReportsPerDay(dailyData);

      // Calculate Chart Data: Category Distribution
      const categoryCounts = reports.reduce((acc: any, cur: any) => {
        const cat = cur.waste_type || cur.category || 'Lainnya';
        // Normalize name
        const normalizedCat = cat.toLowerCase().includes('organik') && !cat.toLowerCase().includes('anorganik') ? 'Organik' :
                              cat.toLowerCase().includes('anorganik') ? 'Anorganik' :
                              cat.toLowerCase().includes('b3') ? 'B3' : 'Lainnya';
                              
        acc[normalizedCat] = (acc[normalizedCat] || 0) + 1;
        return acc;
      }, {});
      
      setCategoryDistribution(Object.keys(categoryCounts).map(key => ({
        name: key,
        value: categoryCounts[key]
      })));

      // Calculate Chart Data: Status Distribution
      const statusCounts = reports.reduce((acc: any, cur: any) => {
        let status = cur.status || 'pending';
        // Normalize legacy indonesian status to english
        if (status === 'Menunggu Verifikasi') status = 'pending';
        if (status === 'Diproses') status = 'scheduled';
        if (status === 'Selesai') status = 'completed';
        if (status === 'Ditolak') status = 'rejected';

        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      setStatusDistribution(Object.keys(statusCounts).map(key => ({
        name: key,
        value: statusCounts[key],
        fill: STATUS_COLORS[key as keyof typeof STATUS_COLORS] || '#cbd5e1'
      })));

      // Fetch Recent Activities from report_updates (join with users)
      const { data: updates } = await supabase
        .from('report_updates')
        .select(`
          *,
          users (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (updates) {
        setRecentActivities(updates);
      } else {
        // Fallback dummy activities if table is empty or error
        setRecentActivities([
          { id: 1, users: { name: 'Admin System' }, new_status: 'verified', created_at: new Date().toISOString() },
          { id: 2, users: { name: 'Admin System' }, new_status: 'completed', created_at: new Date(Date.now() - 86400000).toISOString() }
        ]);
      }

    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': 
      case 'menunggu verifikasi': 
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'verified': 
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': 
      case 'diproses': 
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'completed': 
      case 'selesai': 
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected': 
      case 'ditolak': 
        return 'bg-red-100 text-red-800 border-red-200';
      default: 
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const translateStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Menunggu Verifikasi';
      case 'verified': return 'Diverifikasi';
      case 'scheduled': return 'Dijadwalkan';
      case 'completed': return 'Selesai';
      case 'rejected': return 'Ditolak';
      default: return status;
    }
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pusat kontrol dan statistik sistem PeduliSampah.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Laporan</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalReports}</p>
              </div>
            </div>
            <Link to="/dashboard/admin/reports" className="text-xs font-medium text-blue-600 flex items-center hover:underline">
              Lihat semua laporan &rarr;
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Laporan Pending</p>
                <p className="text-2xl font-bold text-slate-900">{stats.pendingReports}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Laporan Selesai</p>
                <p className="text-2xl font-bold text-slate-900">{stats.completedReports}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total User</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
              </div>
            </div>
            <Link to="/dashboard/admin/users" className="text-xs font-medium text-indigo-600 flex items-center hover:underline">
              Kelola user &rarr;
            </Link>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Statistik Aktivitas Sistem (7 Hari Terakhir)</h3>
            <div className="h-72 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400">Memuat grafik...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportsPerDay} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Distribusi Jenis Sampah</h3>
            <div className="h-72 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400">Memuat grafik...</div>
              ) : categoryDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number) => [`${value} Laporan`, 'Jumlah']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">Belum ada data distribusi jenis sampah.</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Activities & Latest Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Bar Chart & Recent Activities side */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <h3 className="text-lg font-bold text-slate-900 mb-6">Status Laporan</h3>
               <div className="h-48 w-full">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-slate-400">Memuat grafik...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusDistribution} margin={{ top: 0, right: 0, left: -25, bottom: 0 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tickFormatter={(val) => translateStatus(val)} tick={{ fontSize: 11, fill: '#64748b' }} width={80} />
                      <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px' }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
               </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-h-[400px] overflow-y-auto">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                Aktivitas Sistem
              </h3>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-4 text-slate-400">Memuat aktivitas...</div>
                ) : recentActivities.length > 0 ? (
                  recentActivities.map((activity, idx) => (
                    <div key={idx} className="flex gap-3 relative">
                      {idx !== recentActivities.length - 1 && (
                        <div className="absolute top-8 left-[11px] bottom-[-16px] w-[2px] bg-slate-100" />
                      )}
                      <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border-2 border-white z-10">
                        <div className={`h-2.5 w-2.5 rounded-full ${
                          activity.new_status === 'completed' || activity.new_status === 'verified' ? 'bg-emerald-500' :
                          activity.new_status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                      </div>
                      <div className="pb-4">
                        <p className="text-sm text-slate-900">
                          <span className="font-semibold">{activity.users?.name || 'User'}</span> mengubah status laporan menjadi <span className="font-semibold text-emerald-600">{translateStatus(activity.new_status || 'pending')}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(activity.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-slate-400">Belum ada aktivitas.</div>
                )}
              </div>
            </div>
          </div>

          {/* Latest Reports Table */}
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden lg:col-span-2 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white">
              <h3 className="text-lg font-bold text-slate-900">Laporan Terbaru</h3>
              <Link to="/dashboard/admin/reports" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                Lihat Semua
              </Link>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Laporan & Pelapor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Jenis
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        Memuat data laporan...
                      </td>
                    </tr>
                  ) : recentReports.length > 0 ? (
                    recentReports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 shrink-0">
                              <img className="h-10 w-10 rounded-lg object-cover" src={report.photoUrl || report.photo_url || 'https://picsum.photos/400'} alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900">{report.title}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3" />
                                {new Date(report.created_at).toLocaleDateString('id-ID')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-900 capitalize px-2.5 py-1 bg-slate-100 rounded-md">
                            {report.waste_type || report.category || 'Lainnya'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(report.status)}`}>
                            {translateStatus(report.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to="/dashboard/admin/reports" className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors inline-block">
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        Belum ada laporan yang relevan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
