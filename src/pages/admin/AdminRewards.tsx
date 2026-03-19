import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabaseClient';
import { Gift, Plus, Search, Edit2, Trash2 } from 'lucide-react';

export const AdminRewards = () => {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totalRewards: 0, totalRedeems: 0 });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points_required: 0,
    icon: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRewards();
    fetchStats();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('rewards').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error(error);
        return;
      }
      if (data) setRewards(data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [{ count: rewardCount }, { count: redeemCount }] = await Promise.all([
        supabase.from('rewards').select('*', { count: 'exact', head: true }),
        supabase.from('redeems').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalRewards: rewardCount || 0,
        totalRedeems: redeemCount || 0
      });
    } catch (error) {
      console.error('Error fetching reward stats:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const pointsRequired = Number(formData.points_required);

      if (!Number.isFinite(pointsRequired) || pointsRequired < 0) {
        throw new Error('Poin yang dibutuhkan harus berupa angka 0 atau lebih.');
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        points_required: Math.floor(pointsRequired),
        icon: formData.icon.trim() ? formData.icon.trim() : null
      };

      if (editingId) {
        // Update existing
        const { data, error } = await supabase
          .from('rewards')
          .update(payload)
          .eq('id', editingId)
          .select()
          .single();
        
        if (error) throw error;
        setRewards(rewards.map(r => r.id === editingId ? data : r));
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('rewards')
          .insert([payload])
          .select()
          .single();
          
        if (error) throw error;
        setRewards([data, ...rewards]);
      }
      resetForm();
      fetchStats();
    } catch (error) {
      console.error('Error saving reward:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message.toLowerCase().includes('row-level security')) {
        alert('Gagal menyimpan reward: akses ditolak oleh policy database (RLS). Pastikan akun admin punya izin INSERT/UPDATE tabel rewards.');
      } else {
        alert(`Gagal menyimpan reward. Detail: ${message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus reward ini?')) return;
    try {
      const { error } = await supabase.from('rewards').delete().eq('id', id);
      if (error) throw error;
      setRewards(rewards.filter(r => r.id !== id));
      fetchStats();
    } catch (error) {
      console.error('Error deleting reward:', error);
      alert('Gagal menghapus reward. Mungkin masih ada histori penukaran.');
    }
  };

  const editReward = (reward: any) => {
    setFormData({
      name: reward.name || '',
      description: reward.description || '',
      points_required: reward.points_required || 0,
      icon: reward.icon || ''
    });
    setEditingId(reward.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', points_required: 0, icon: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredRewards = rewards.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Kelola Reward</h1>
            <p className="mt-1 text-sm text-slate-500">
              CRUD katalog hadiah yang bisa ditukarkan oleh user.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari reward..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm py-2 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
              />
            </div>
            <button 
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4" /> Tambah Reward
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Total Reward</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalRewards}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Total Redeem</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalRedeems}</p>
          </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{editingId ? 'Edit Reward' : 'Tambah Reward Baru'}</h3>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Reward</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Gambar</label>
                <input 
                  type="url" 
                  value={formData.icon}
                  onChange={e => setFormData({...formData, icon: e.target.value})}
                  placeholder="https://example.com/image.png"
                  className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                <textarea 
                  required
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Poin yang Dibutuhkan</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={formData.points_required}
                  onChange={e => setFormData({...formData, points_required: e.target.value === '' ? 0 : Number(e.target.value)})}
                  className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Reward'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rewards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-500">Memuat katalog reward...</div>
          ) : filteredRewards.length > 0 ? (
            filteredRewards.map((reward) => (
              <div key={reward.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group">
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  <img 
                    src={reward.icon || 'https://picsum.photos/400/300?grayscale'} 
                    alt={reward.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-emerald-600 shadow-sm flex items-center gap-1">
                    <Gift className="h-4 w-4" />
                    {reward.points_required} Pts
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900">{reward.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 flex-1 line-clamp-2">
                    {reward.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                    <button 
                      onClick={() => editReward(reward)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <Edit2 className="h-4 w-4" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(reward.id)}
                      className="flex-none flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-xl transition-colors"
                      title="Hapus Reward"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
              <Gift className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">Daftar Reward Kosong</h3>
              <p className="text-slate-500 text-sm">Belum ada reward yang ditambahkan atau tidak ada yang cocok dengan pencarian.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
