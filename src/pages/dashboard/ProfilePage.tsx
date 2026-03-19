import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { Camera, KeyRound, LogOut, Mail, Save, ShieldCheck, User } from 'lucide-react';

type RoleType = 'warga' | 'komunitas' | 'admin';

interface ProfilePageProps {
  requiredRole?: RoleType;
}

export const ProfilePage = ({ requiredRole }: ProfilePageProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Pengguna');
    setAvatarUrl(
      user.avatar_url ||
      user.avatar ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      ''
    );
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchStats();
  }, [user]);

  const roleLabel = useMemo(() => {
    switch (user?.role) {
      case 'admin':
        return 'Admin';
      case 'komunitas':
        return 'Komunitas/Petugas';
      default:
        return 'Warga';
    }
  }, [user?.role]);

  const fetchStats = async () => {
    if (!user) return;
    try {
      if (user.role === 'admin') {
        const [{ count: reportCount }, { count: userCount }, { count: pendingCount }] = await Promise.all([
          supabase.from('reports').select('*', { count: 'exact', head: true }),
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('reports').select('*', { count: 'exact', head: true }).in('status', ['pending', 'Menunggu Verifikasi'])
        ]);

        setStats([
          { label: 'Total Laporan', value: String(reportCount || 0) },
          { label: 'Laporan Pending', value: String(pendingCount || 0) },
          { label: 'Total Pengguna', value: String(userCount || 0) }
        ]);
        return;
      }

      if (user.role === 'komunitas') {
        const [{ count: updateCount }, { count: scheduledCount }, { count: completedCount }] = await Promise.all([
          supabase.from('report_updates').select('*', { count: 'exact', head: true }).eq('updated_by', user.id),
          supabase.from('reports').select('*', { count: 'exact', head: true }).in('status', ['scheduled', 'Diproses']),
          supabase.from('reports').select('*', { count: 'exact', head: true }).in('status', ['completed', 'Selesai'])
        ]);

        setStats([
          { label: 'Aksi Ditangani', value: String(updateCount || 0) },
          { label: 'Laporan Dijadwalkan', value: String(scheduledCount || 0) },
          { label: 'Laporan Selesai', value: String(completedCount || 0) }
        ]);
        return;
      }

      const [{ count: myReports }, { count: pendingReports }, { count: doneReports }] = await Promise.all([
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('user_id', user.id).in('status', ['pending', 'Menunggu Verifikasi']),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('user_id', user.id).in('status', ['completed', 'Selesai'])
      ]);

      setStats([
        { label: 'Laporan Saya', value: String(myReports || 0) },
        { label: 'Masih Pending', value: String(pendingReports || 0) },
        { label: 'Sudah Selesai', value: String(doneReports || 0) }
      ]);
    } catch (error) {
      console.error('Error fetching profile stats:', error);
      setStats([]);
    }
  };

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setMessage(null);

    try {
      const updates: Record<string, unknown> = { name: displayName };
      if ('avatar_url' in user) {
        updates.avatar_url = avatarUrl || null;
      }

      const { error } = await supabase.from('users').update(updates).eq('id', user.id);
      if (error) throw error;

      const { error: authError } = await supabase.auth.updateUser({
        data: { name: displayName, avatar_url: avatarUrl || null }
      });
      if (authError) {
        console.warn('Auth metadata update warning:', authError);
      }

      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui.' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Gagal memperbarui profil. Coba lagi.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password baru minimal 6 karakter.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak sama.' });
      return;
    }

    setIsUpdatingPassword(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Password berhasil diubah.' });
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'Gagal mengganti password. Coba lagi.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logout:', error);
      setMessage({ type: 'error', text: 'Gagal logout. Silakan ulangi.' });
    }
  };

  if (!user) return null;

  const initials = (displayName || user.email || 'U').charAt(0).toUpperCase();

  return (
    <DashboardLayout requiredRole={requiredRole}>
      <div className="mx-auto w-full max-w-4xl py-2">
        <h1 className="text-2xl font-bold text-slate-900">Profil Akun</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola informasi akun, keamanan, dan akses Anda.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-20 w-20 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold border border-emerald-200">
                    {initials}
                  </div>
                )}
                <span className="absolute -right-1 -bottom-1 bg-white border border-slate-200 p-1.5 rounded-full">
                  <Camera className="h-3.5 w-3.5 text-slate-500" />
                </span>
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-900 truncate">{displayName}</h2>
                <p className="text-sm text-slate-600 truncate">{user.email || '-'}</p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {roleLabel}
                </span>
              </div>
            </div>

            {message && (
              <div className={`mt-5 rounded-lg border px-3 py-2 text-sm ${
                message.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nama Pengguna</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Foto Profil (URL)</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {isEditing ? (
                  <>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setDisplayName(user.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Pengguna');
                        setAvatarUrl(
                          user.avatar_url ||
                          user.avatar ||
                          user.user_metadata?.avatar_url ||
                          user.user_metadata?.picture ||
                          ''
                        );
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Batal
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Edit Profil
                  </button>
                )}
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Statistik Singkat</h3>
              <div className="mt-3 space-y-3">
                {stats.length > 0 ? (
                  stats.map((item) => (
                    <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-wider text-slate-500">{item.label}</p>
                      <p className="text-lg font-bold text-slate-900">{item.value}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Statistik belum tersedia.</p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Keamanan</h3>
              <form onSubmit={handleUpdatePassword} className="mt-3 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Password Baru</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Konfirmasi Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70"
                >
                  <KeyRound className="h-4 w-4" />
                  {isUpdatingPassword ? 'Memproses...' : 'Ganti Password'}
                </button>
              </form>
            </section>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
};
