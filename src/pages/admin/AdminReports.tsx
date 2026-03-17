import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Search, MapPin, Clock, Edit2, X, Check, CalendarDays } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Status editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: number) => {
    if (!newStatus) return setEditingId(null);
    setUpdating(true);

    try {
      // 1. Update the report status
      const { error: updateError } = await supabase
        .from('reports')
        .update({ status: newStatus })
        .eq('id', reportId);

      if (updateError) throw updateError;

      // 2. Insert into report_updates for activity tracking
      if (user) {
        await supabase.from('report_updates').insert({
          report_id: reportId,
          user_id: user.id,
          status: newStatus,
          notes: 'Diubah melalui panel admin'
        });
      }

      // 3. Update local state
      setReports(reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Gagal memperbarui status');
    } finally {
      setUpdating(false);
    }
  };

  const translateStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': 
      case 'menunggu verifikasi': return 'Menunggu Verifikasi';
      case 'verified': return 'Diverifikasi';
      case 'scheduled': 
      case 'diproses': return 'Dijadwalkan';
      case 'completed': 
      case 'selesai': return 'Selesai';
      case 'rejected': 
      case 'ditolak': return 'Ditolak';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': 
      case 'menunggu verifikasi': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'verified': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': 
      case 'diproses': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'completed': 
      case 'selesai': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected': 
      case 'ditolak': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const filteredReports = reports.filter(r => 
    r.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.location_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const normalizeStatus = (status: string) => {
    let normalized = status?.toLowerCase();
    if (normalized === 'menunggu verifikasi') normalized = 'pending';
    if (normalized === 'diproses') normalized = 'scheduled';
    if (normalized === 'selesai') normalized = 'completed';
    if (normalized === 'ditolak') normalized = 'rejected';
    return normalized || 'pending';
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Laporan</h1>
            <p className="mt-1 text-sm text-slate-500">
              Ubah status laporan dan pantau seluruh laporan masuk.
            </p>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari laporan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm py-2 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {loading ? 'Memuat laporan...' : `${filteredReports.length} laporan ditemukan`}
            </p>
          </div>

          <div className="mb-3 hidden lg:grid grid-cols-12 gap-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <div className="col-span-6">Laporan & Lokasi</div>
            <div className="col-span-3">Tanggal & Waktu</div>
            <div className="col-span-3 text-right">Status & Aksi</div>
          </div>

          {loading ? (
            <div className="rounded-xl border border-dashed border-slate-300 px-6 py-14 text-center text-slate-500">
              Memuat data laporan...
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredReports.map((report) => (
                <article
                  key={report.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-6">
                      <div className="flex gap-3">
                        <img
                          className="h-20 w-20 rounded-xl object-cover bg-slate-100 shrink-0"
                          src={report.photoUrl || report.photo_url || 'https://picsum.photos/400'}
                          alt={report.title || 'Laporan'}
                        />
                        <div className="min-w-0">
                          <h2 className="text-sm font-bold text-slate-900 line-clamp-2">{report.title}</h2>
                          <div className="mt-2 inline-flex text-[11px] text-slate-600 bg-slate-100 uppercase px-2 py-0.5 rounded">
                            {report.category || 'Lainnya'}
                          </div>
                          <div className="mt-3 space-y-1 text-xs text-slate-600">
                            <p className="flex items-start gap-1.5">
                              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                              <span className="line-clamp-2">{report.location_name || 'Lokasi tidak tersedia'}</span>
                            </p>
                            <p className="text-slate-500">{report.lat}, {report.lng}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 lg:hidden">Tanggal & Waktu</p>
                      <p className="text-sm text-slate-900 flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        {new Date(report.createdAt || report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-slate-600 flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {new Date(report.createdAt || report.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="lg:col-span-3 flex flex-col lg:items-end justify-between gap-3">
                      {editingId === report.id ? (
                        <>
                          <select
                            className="w-full lg:w-auto text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            autoFocus
                          >
                            <option value="pending">Menunggu Verifikasi</option>
                            <option value="verified">Diverifikasi</option>
                            <option value="scheduled">Dijadwalkan</option>
                            <option value="completed">Selesai</option>
                            <option value="rejected">Ditolak</option>
                          </select>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateStatus(report.id)}
                              disabled={updating}
                              className="text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 px-3 py-2 rounded-lg text-sm inline-flex items-center gap-1 transition-colors"
                            >
                              <Check className="h-4 w-4" />
                              Simpan
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setNewStatus(''); }}
                              disabled={updating}
                              className="text-slate-700 hover:text-white bg-slate-100 hover:bg-slate-500 px-3 py-2 rounded-lg text-sm inline-flex items-center gap-1 transition-colors"
                            >
                              <X className="h-4 w-4" />
                              Batal
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(report.status)}`}>
                            {translateStatus(report.status)}
                          </span>
                          <button
                            onClick={() => {
                              setEditingId(report.id);
                              setNewStatus(normalizeStatus(report.status));
                            }}
                            className="text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 text-sm"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            Update
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 px-6 py-14 text-center text-slate-500">
              Tidak ada laporan yang ditemukan.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
