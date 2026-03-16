import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Search, MapPin, Clock, Edit2, X, Check } from 'lucide-react';
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
          notes: 'Diobahkan melalui panel admin'
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

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Laporan</h1>
            <p className="mt-1 text-sm text-slate-500">
              Ubah status laporan dan pantau seluruh laporan masuk.
            </p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari laporan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm py-2 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Laporan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Lokasi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tanggal
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
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Memuat data reports...
                    </td>
                  </tr>
                ) : filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img 
                            className="h-12 w-12 rounded-lg object-cover bg-slate-100" 
                            src={report.photoUrl || report.photo_url || 'https://picsum.photos/400'} 
                            alt="" 
                          />
                          <div className="ml-4">
                            <div className="text-sm font-bold text-slate-900 line-clamp-1">{report.title}</div>
                            <div className="text-xs text-slate-500 bg-slate-100 uppercase px-2 py-0.5 rounded inline-block mt-1">
                              {report.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 line-clamp-1">{report.location_name || 'Tidak ada deskripsi lokasi'}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {report.lat}, {report.lng}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {new Date(report.createdAt || report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {new Date(report.createdAt || report.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === report.id ? (
                          <select 
                            className="text-sm border border-slate-300 rounded p-1 focus:ring-2 focus:ring-emerald-500 outline-none"
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
                        ) : (
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(report.status)}`}>
                            {translateStatus(report.status)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingId === report.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleUpdateStatus(report.id)}
                              disabled={updating}
                              className="text-emerald-600 hover:text-emerald-900 p-1 bg-emerald-50 rounded"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => { setEditingId(null); setNewStatus(''); }}
                              disabled={updating}
                              className="text-slate-600 hover:text-slate-900 p-1 bg-slate-100 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setEditingId(report.id);
                              // normalisasikan status ke format english yang baru
                              let s = report.status?.toLowerCase();
                              if (s === 'menunggu verifikasi') s = 'pending';
                              if (s === 'diproses') s = 'scheduled';
                              if (s === 'selesai') s = 'completed';
                              if (s === 'ditolak') s = 'rejected';
                              setNewStatus(s || 'pending');
                            }}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <Edit2 className="h-3 w-3" /> Update
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Tidak ada laporan yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
