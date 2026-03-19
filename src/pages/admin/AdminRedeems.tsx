import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Search, History, CheckCircle, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export const AdminRedeems = () => {
  const [redeems, setRedeems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRedeems();
  }, []);

  const fetchRedeems = async () => {
    setLoading(true);
    try {
      // Joining with users & rewards using foreign keys mapping
      const { data, error } = await supabase
        .from('redeems')
        .select(`
          *,
          users(name, email),
          rewards(name, description, points_required, icon)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        return;
      }
      if (data) setRedeems(data);
    } catch (error) {
      console.error('Error fetching redeems:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'used': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const filteredRedeems = redeems.filter(r => 
    r.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.voucher_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.rewards?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Riwayat Redeem Poin</h1>
            <p className="mt-1 text-sm text-slate-500">
              Pantau seluruh penukaran reward dan poin pengguna.
            </p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari user, voucher..." 
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
                    Pengguna
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Reward (Biaya Poin)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Kode Voucher
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tanggal Penukaran
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Memuat data histori redeem...
                    </td>
                  </tr>
                ) : filteredRedeems.length > 0 ? (
                  filteredRedeems.map((redeem) => (
                    <tr key={redeem.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{redeem.users?.name || 'User Terhapus'}</span>
                          <span className="text-xs text-slate-500">{redeem.users?.email || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-slate-900 max-w-[200px] truncate">
                            {redeem.rewards?.name || 'Reward Dihapus'}
                          </div>
                          <span className="text-xs font-medium px-2 py-0.5 bg-amber-50 text-amber-600 rounded">
                            -{redeem.points_spent ?? redeem.rewards?.points_required ?? 0} Poin
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-sm font-bold tracking-wider text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 w-fit">
                          <Tag className="h-3.5 w-3.5 text-slate-400" />
                          {redeem.voucher_code}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <History className="h-4 w-4" />
                          {new Date(redeem.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border items-center gap-1 ${getStatusColor(redeem.status)}`}>
                            {redeem.status === 'active' && <CheckCircle className="h-3 w-3" />}
                            {redeem.status || 'Active'}
                          </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Tidak ada data redeem penukaran poin.
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
