import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { CalendarClock, Plus, Search, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export const AdminSchedules = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    report_id: '',
    scheduled_date: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch schedules with joined report info
      const { data: scheduleData } = await supabase
        .from('pickup_schedules')
        .select(`
          *,
          reports (title, location_name, address)
        `)
        .order('scheduled_date', { ascending: true });
        
      if (scheduleData) setSchedules(scheduleData);

      // Fetch active reports (pending or scheduled) for the dropdown
      const { data: reportData } = await supabase
        .from('reports')
        .select('*')
        .in('status', ['pending', 'Menunggu Verifikasi', 'verified', 'scheduled', 'Diproses']);
      
      if (reportData) setReports(reportData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await supabase.from('pickup_schedules').insert([
        {
          report_id: parseInt(formData.report_id),
          scheduled_date: new Date(formData.scheduled_date).toISOString(),
          notes: formData.notes,
          status: 'scheduled'
        }
      ]).select('*, reports(title, location_name, address)').single();

      if (error) throw error;

      // Update report status to scheduled if it isn't already
      await supabase.from('reports').update({ status: 'scheduled' }).eq('id', formData.report_id);

      setSchedules([...schedules, data]);
      setShowForm(false);
      setFormData({ report_id: '', scheduled_date: '', notes: '' });
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Gagal menyimpan jadwal pengangkutan.');
    } finally {
      setSaving(false);
    }
  };

  const filteredSchedules = schedules.filter(s => 
    s.reports?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Jadwal Pengangkutan</h1>
            <p className="mt-1 text-sm text-slate-500">
              Kelola waktu pengangkutan sampah untuk komite atau kurir.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari jadwal..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm py-2 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
              />
            </div>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4" /> Tambah Jadwal
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Buat Jadwal Baru</h3>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Laporan Terkait</label>
                <select 
                  required
                  value={formData.report_id}
                  onChange={e => setFormData({...formData, report_id: e.target.value})}
                  className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Pilih Laporan --</option>
                  {reports.map(r => (
                    <option key={r.id} value={r.id}>
                      #{r.id} - {r.title} ({r.location_name || 'Lokasi tidak diketahui'})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal & Waktu Pengangkutan</label>
                <input 
                  type="datetime-local" 
                  required
                  value={formData.scheduled_date}
                  onChange={e => setFormData({...formData, scheduled_date: e.target.value})}
                  className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Khusus</label>
                <input 
                  type="text" 
                  placeholder="Misal: Truk besar dibutuhkan"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Jadwal / Waktu
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Laporan Referensi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Catatan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Memuat daftar jadwal...
                    </td>
                  </tr>
                ) : filteredSchedules.length > 0 ? (
                  filteredSchedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-slate-900 border border-slate-200 bg-slate-50 px-3 py-1.5 rounded-lg w-fit gap-2">
                          <CalendarClock className="h-4 w-4 text-emerald-600" />
                          {new Date(schedule.scheduled_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900 line-clamp-1">
                          {schedule.reports?.title || `Laporan #${schedule.report_id}`}
                        </div>
                        {schedule.reports?.location_name && (
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">{schedule.reports.location_name}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded border border-slate-100 italic line-clamp-2">
                          {schedule.notes || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                          schedule.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          schedule.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                          'bg-indigo-100 text-indigo-800 border-indigo-200'
                        }`}>
                          {schedule.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      Belum ada jadwal pengangkutan yang tersedia.
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
