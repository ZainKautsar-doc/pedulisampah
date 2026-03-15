import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';// Public Pages
import { Home } from './pages/public/Home';
import { Login } from './pages/public/Login';
import { MapPage } from './pages/public/MapPage';
import { Leaderboard } from './pages/public/Leaderboard';
import { About } from './pages/public/About';

// Warga Pages
import { DashboardWarga } from './pages/dashboard/warga/DashboardWarga';
import { LaporSampah } from './pages/dashboard/warga/LaporSampah';
import { RiwayatLaporan } from './pages/dashboard/warga/RiwayatLaporan';
import { RewardRedeem } from './pages/dashboard/warga/RewardRedeem';
import { ProfilWarga } from './pages/dashboard/warga/ProfilWarga';

// Komunitas Pages
import { DashboardKomunitas } from './pages/dashboard/komunitas/DashboardKomunitas';
import { LaporanMasuk } from './pages/dashboard/komunitas/LaporanMasuk';
import { JadwalPengangkutan } from './pages/dashboard/komunitas/JadwalPengangkutan';
import { KelolaReward } from './pages/dashboard/komunitas/KelolaReward';
import { ProfilKomunitas } from './pages/dashboard/komunitas/ProfilKomunitas';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/peta" element={<MapPage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/tentang" element={<About />} />

          {/* Dashboard Warga */}
          <Route path="/dashboard/warga" element={<ProtectedRoute><DashboardWarga /></ProtectedRoute>} />
          <Route path="/dashboard/warga/lapor" element={<ProtectedRoute><LaporSampah /></ProtectedRoute>} />
          <Route path="/dashboard/warga/riwayat" element={<ProtectedRoute><RiwayatLaporan /></ProtectedRoute>} />
          <Route path="/dashboard/warga/reward" element={<ProtectedRoute><RewardRedeem /></ProtectedRoute>} />
          <Route path="/dashboard/warga/profil" element={<ProtectedRoute><ProfilWarga /></ProtectedRoute>} />

          {/* Dashboard Komunitas */}
          <Route path="/dashboard/komunitas" element={<ProtectedRoute><DashboardKomunitas /></ProtectedRoute>} />
          <Route path="/dashboard/komunitas/laporan" element={<ProtectedRoute><LaporanMasuk /></ProtectedRoute>} />
          <Route path="/dashboard/komunitas/jadwal" element={<ProtectedRoute><JadwalPengangkutan /></ProtectedRoute>} />
          <Route path="/dashboard/komunitas/reward" element={<ProtectedRoute><KelolaReward /></ProtectedRoute>} />
          <Route path="/dashboard/komunitas/profil" element={<ProtectedRoute><ProfilKomunitas /></ProtectedRoute>} />
          
          {/* Admin Route (Placeholder) */}
          <Route path="/dashboard/admin" element={<ProtectedRoute><div className="p-8 text-center text-xl font-bold">Admin Dashboard (Coming Soon)</div></ProtectedRoute>} />
        </Routes>
      </Router>
    </AppProvider>
    </AuthProvider>
  );
}
