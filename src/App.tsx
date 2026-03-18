import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';// Public Pages
import { PublicOnlyRoute } from './components/PublicOnlyRoute';
import { Home } from './pages/public/Home';
import { Login } from './pages/public/Login';
import { RegisterPage } from './pages/public/RegisterPage';
import { MapPage } from './pages/public/MapPage';
import { Leaderboard } from './pages/public/Leaderboard';
import { About } from './pages/public/About';

// Warga Pages
import { DashboardWarga } from './pages/dashboard/warga/DashboardWarga';
import { LaporSampah } from './pages/dashboard/warga/LaporSampah';
import { RiwayatLaporan } from './pages/dashboard/warga/RiwayatLaporan';
import { RewardRedeem } from './pages/dashboard/warga/RewardRedeem';
import { ProfilWarga } from './pages/dashboard/warga/ProfilWarga';
import { ProfilePage } from './pages/dashboard/ProfilePage';

// Komunitas Pages
import { DashboardKomunitas } from './pages/dashboard/komunitas/DashboardKomunitas';
import { LaporanMasuk } from './pages/dashboard/komunitas/LaporanMasuk';
import { JadwalPengangkutan } from './pages/dashboard/komunitas/JadwalPengangkutan';
import { KelolaReward } from './pages/dashboard/komunitas/KelolaReward';
import { ProfilKomunitas } from './pages/dashboard/komunitas/ProfilKomunitas';

// Admin Page
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSchedules } from './pages/admin/AdminSchedules';
import { AdminRewards } from './pages/admin/AdminRewards';
import { AdminRedeems } from './pages/admin/AdminRedeems';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminProfile } from './pages/admin/AdminProfile';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-slate-900">404</h1>
        <p className="text-slate-600 mt-2">Halaman tidak ditemukan.</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/peta" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/tentang" element={<About />} />

          {/* Dashboard Warga */}
          <Route path="/dashboard" element={<Navigate to="/dashboard/warga" replace />} />
          <Route path="/dashboard/warga" element={<ProtectedRoute><DashboardWarga /></ProtectedRoute>} />
          <Route path="/dashboard/warga/lapor" element={<ProtectedRoute><LaporSampah /></ProtectedRoute>} />
          <Route path="/dashboard/warga/riwayat" element={<ProtectedRoute><RiwayatLaporan /></ProtectedRoute>} />
          <Route path="/dashboard/warga/reward" element={<ProtectedRoute><RewardRedeem /></ProtectedRoute>} />
          <Route path="/dashboard/warga/profil" element={<ProtectedRoute><ProfilWarga /></ProtectedRoute>} />
          <Route path="/dashboard/lapor" element={<Navigate to="/dashboard/warga/lapor" replace />} />
          <Route path="/dashboard/riwayat" element={<Navigate to="/dashboard/warga/riwayat" replace />} />
          <Route path="/dashboard/reward" element={<Navigate to="/dashboard/warga/reward" replace />} />
          <Route path="/dashboard/profil" element={<Navigate to="/dashboard/warga/profil" replace />} />
          <Route path="/profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Dashboard Komunitas */}
          <Route path="/dashboard-komunitas" element={<ProtectedRoute><DashboardKomunitas /></ProtectedRoute>} />
          <Route path="/dashboard-komunitas/laporan" element={<ProtectedRoute><LaporanMasuk /></ProtectedRoute>} />
          <Route path="/dashboard-komunitas/jadwal" element={<ProtectedRoute><JadwalPengangkutan /></ProtectedRoute>} />
          <Route path="/dashboard-komunitas/reward" element={<ProtectedRoute><KelolaReward /></ProtectedRoute>} />
          <Route path="/dashboard-komunitas/profil" element={<ProtectedRoute><ProfilKomunitas /></ProtectedRoute>} />
          
          {/* Admin Route */}
          <Route path="/dashboard/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/admin/reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
          <Route path="/dashboard/admin/schedules" element={<ProtectedRoute><AdminSchedules /></ProtectedRoute>} />
          <Route path="/dashboard/admin/rewards" element={<ProtectedRoute><AdminRewards /></ProtectedRoute>} />
          <Route path="/dashboard/admin/redeems" element={<ProtectedRoute><AdminRedeems /></ProtectedRoute>} />
          <Route path="/dashboard/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
          <Route path="/dashboard/admin/profil" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AppProvider>
    </AuthProvider>
  );
}
