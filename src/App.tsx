import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store/AppContext';

// Public Pages
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
          <Route path="/dashboard/warga" element={<DashboardWarga />} />
          <Route path="/dashboard/warga/lapor" element={<LaporSampah />} />
          <Route path="/dashboard/warga/riwayat" element={<RiwayatLaporan />} />
          <Route path="/dashboard/warga/reward" element={<RewardRedeem />} />
          <Route path="/dashboard/warga/profil" element={<ProfilWarga />} />

          {/* Dashboard Komunitas */}
          <Route path="/dashboard/komunitas" element={<DashboardKomunitas />} />
          <Route path="/dashboard/komunitas/laporan" element={<LaporanMasuk />} />
          <Route path="/dashboard/komunitas/jadwal" element={<JadwalPengangkutan />} />
          <Route path="/dashboard/komunitas/reward" element={<KelolaReward />} />
          <Route path="/dashboard/komunitas/profil" element={<ProfilKomunitas />} />
          
          {/* Admin Route (Placeholder) */}
          <Route path="/dashboard/admin" element={<div className="p-8 text-center text-xl font-bold">Admin Dashboard (Coming Soon)</div>} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
