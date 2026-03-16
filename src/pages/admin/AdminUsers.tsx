import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabaseClient';
import { Search, Edit2, Check, X, ShieldAlert, Award, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit Role State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // In a real production app without RLS bypass, hitting 'users' table directly works 
      // if policies allow admin read, or via an RPC. Assuming setup allows admin read:
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string) => {
    if (!newRole) return setEditingId(null);
    setUpdating(true);

    try {
      // Prevent stripping own admin rights accidentally via UI as a safety net
      if (userId === currentUser?.id && newRole !== 'admin') {
        const confirm = window.confirm("PERINGATAN: Anda akan menghapus akses admin diri Anda sendiri. Anda akan dikeluarkan dari dashboard ini. Lanjutkan?");
        if (!confirm) {
          setEditingId(null);
          return;
        }
      }

      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setEditingId(null);
      
      if (userId === currentUser?.id && newRole !== 'admin') {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Gagal memperbarui role pengguna.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin': 
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded border border-rose-200 bg-rose-50 text-rose-700 gap-1 items-center"><ShieldAlert className="h-3 w-3" /> Admin</span>;
      case 'komunitas': 
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded border border-blue-200 bg-blue-50 text-blue-700 gap-1 items-center"><Award className="h-3 w-3" /> Komunitas</span>;
      default: 
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded border border-slate-200 bg-slate-50 text-slate-700 gap-1 items-center"><UserIcon className="h-3 w-3" /> Warga</span>;
    }
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Pengguna</h1>
            <p className="mt-1 text-sm text-slate-500">
              Lihat daftar pengguna dan kelola hak akses sistem (role).
            </p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari user (nama/email)..." 
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
                    Tanggal Terdaftar
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Poin
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Role Sistem
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
                      Memuat daftar pengguna...
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 shrink-0 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-lg">
                            {u.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-slate-900">
                              {u.name}
                              {u.id === currentUser?.id && <span className="ml-2 text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">You</span>}
                            </div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(u.created_at || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded w-fit">
                          {u.points || 0} Pts
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === u.id ? (
                          <select 
                            className="text-sm border border-slate-300 rounded p-1 focus:ring-2 focus:ring-emerald-500 outline-none w-32"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            autoFocus
                          >
                            <option value="warga">Warga</option>
                            <option value="komunitas">Komunitas</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          getRoleBadge(u.role)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingId === u.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleUpdateRole(u.id)}
                              disabled={updating}
                              className="text-emerald-600 hover:text-white p-1.5 bg-emerald-50 hover:bg-emerald-600 rounded transition-colors"
                              title="Simpan"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => { setEditingId(null); setNewRole(''); }}
                              disabled={updating}
                              className="text-slate-600 hover:text-white p-1.5 bg-slate-100 hover:bg-slate-500 rounded transition-colors"
                              title="Batal"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setEditingId(u.id);
                              setNewRole(u.role);
                            }}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors inline-block"
                            title="Edit Akses (Role)"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Tidak ada pengguna yang cocok dengan pencarian.
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
