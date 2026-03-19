import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

export type Role = 'warga' | 'komunitas' | 'admin' | null;

export interface User {
  id: string;
  name: string;
  role: Role;
  points: number;
  avatar?: string;
}

export type ReportStatus = 'Menunggu Verifikasi' | 'Diproses' | 'Dijadwalkan' | 'Selesai' | 'Ditolak';
export type WasteCategory = 'organik' | 'anorganik' | 'B3' | 'belum terdeteksi';

export interface Report {
  id: string;
  title: string;
  description: string;
  photoUrl: string;
  lat: number;
  lng: number;
  category: WasteCategory;
  status: ReportStatus;
  createdAt: string;
  userId: string;
  tips?: string;
  userTip?: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  imageUrl?: string;
}

export interface RedeemHistory {
  id: string;
  userId: string;
  rewardId: string;
  code: string;
  redeemedAt: string;
}

export interface PickupSchedule {
  id: string;
  reportId: string;
  scheduledDate: string;
  notes: string;
  communityId: string;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  reports: Report[];
  rewards: Reward[];
  redeemHistory: RedeemHistory[];
  pickupSchedules: PickupSchedule[];
  login: (role: Role) => void;
  logout: () => void;
  addReport: (report: Omit<Report, 'id' | 'createdAt' | 'status' | 'userId'>) => void;
  updateReportStatus: (id: string, status: ReportStatus, tips?: string) => void;
  redeemReward: (rewardId: string) => { success: boolean; code?: string; message?: string };
  addSchedule: (schedule: Omit<PickupSchedule, 'id' | 'communityId'>) => void;
  addReward: (reward: Omit<Reward, 'id'>) => void;
  updateReward: (id: string, reward: Partial<Reward>) => void;
  deleteReward: (id: string) => void;
  updateCurrentUserPoints: (points: number) => void;
}

const initialUsers: User[] = [
  { id: 'u1', name: 'Budi Santoso', role: 'warga', points: 150 },
  { id: 'u2', name: 'Siti Aminah', role: 'warga', points: 80 },
  { id: 'u3', name: 'Tim Bersih Desa', role: 'komunitas', points: 0 },
  { id: 'u4', name: 'Admin Pusat', role: 'admin', points: 0 },
];

const initialReports: Report[] = [
  {
    id: 'r1',
    title: 'Tumpukan sampah plastik di pinggir sungai',
    description: 'Banyak sampah plastik menyumbat aliran sungai dekat jembatan.',
    photoUrl: 'https://picsum.photos/seed/sampah1/400/300',
    lat: -6.200000,
    lng: 106.816666,
    category: 'anorganik',
    status: 'Menunggu Verifikasi',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    userId: 'u1',
  },
  {
    id: 'r2',
    title: 'Limbah rumah tangga menumpuk',
    description: 'Sampah organik berbau busuk di pojok jalan.',
    photoUrl: 'https://picsum.photos/seed/sampah2/400/300',
    lat: -6.210000,
    lng: 106.820000,
    category: 'organik',
    status: 'Diproses',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    userId: 'u2',
  },
  {
    id: 'r3',
    title: 'Baterai bekas berserakan',
    description: 'Ada tumpukan baterai bekas di tanah kosong.',
    photoUrl: 'https://picsum.photos/seed/sampah3/400/300',
    lat: -6.220000,
    lng: 106.830000,
    category: 'B3',
    status: 'Selesai',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    userId: 'u1',
    tips: 'Gunakan sarung tangan saat memindahkan baterai bekas.',
  }
];

const initialRewards: Reward[] = [
  { id: 'rw1', name: 'Voucher Sembako Rp 50.000', description: 'Dapat ditukarkan di warung mitra.', pointsRequired: 100 },
  { id: 'rw2', name: 'Gratis Iuran Sampah 1 Bulan', description: 'Pembebasan biaya iuran sampah bulan depan.', pointsRequired: 200 },
  { id: 'rw3', name: 'Token Listrik Rp 20.000', description: 'Token listrik prabayar.', pointsRequired: 150 },
];

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [redeemHistory, setRedeemHistory] = useState<RedeemHistory[]>([]);
  const [pickupSchedules, setPickupSchedules] = useState<PickupSchedule[]>([]);

  const { user } = useAuth();
  
  useEffect(() => {
    // Sync the Supabase Auth user to the legacy AppContext user
    if (user) {
      setCurrentUser({
        id: user.id,
        name: user.name || user.email,
        role: user.role,
        points: 0, // Default for new users or if not stored in users table yet
        ...user
      });
    } else {
      setCurrentUser(null);
    }
  }, [user]);

  const login = (role: Role) => {
    const user = users.find(u => u.role === role);
    if (user) setCurrentUser(user);
  };

  const logout = () => setCurrentUser(null);

  const addReport = (reportData: Omit<Report, 'id' | 'createdAt' | 'status' | 'userId'>) => {
    if (!currentUser) return;
    const newReport: Report = {
      ...reportData,
      id: `r${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'Menunggu Verifikasi',
      userId: currentUser.id,
    };
    setReports([newReport, ...reports]);
  };

  const updateReportStatus = (id: string, status: ReportStatus, tips?: string) => {
    setReports(reports.map(r => r.id === id ? { ...r, status, tips: tips || r.tips } : r));
  };

  const redeemReward = (rewardId: string) => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return { success: false, message: 'Reward not found' };
    
    if (currentUser.points < reward.pointsRequired) {
      return { success: false, message: 'Poin tidak cukup' };
    }

    const newPoints = currentUser.points - reward.pointsRequired;
    setUsers(users.map(u => u.id === currentUser.id ? { ...u, points: newPoints } : u));
    setCurrentUser({ ...currentUser, points: newPoints });

    const code = `RWD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newHistory: RedeemHistory = {
      id: `rh${Date.now()}`,
      userId: currentUser.id,
      rewardId,
      code,
      redeemedAt: new Date().toISOString(),
    };
    setRedeemHistory([newHistory, ...redeemHistory]);

    return { success: true, code };
  };

  const addSchedule = (scheduleData: Omit<PickupSchedule, 'id' | 'communityId'>) => {
    if (!currentUser) return;
    const newSchedule: PickupSchedule = {
      ...scheduleData,
      id: `ps${Date.now()}`,
      communityId: currentUser.id,
    };
    setPickupSchedules([newSchedule, ...pickupSchedules]);
    updateReportStatus(scheduleData.reportId, 'Dijadwalkan');
  };

  const addReward = (rewardData: Omit<Reward, 'id'>) => {
    setRewards([...rewards, { ...rewardData, id: `rw${Date.now()}` }]);
  };

  const updateReward = (id: string, rewardData: Partial<Reward>) => {
    setRewards(rewards.map(r => r.id === id ? { ...r, ...rewardData } : r));
  };

  const deleteReward = (id: string) => {
    setRewards(rewards.filter(r => r.id !== id));
  };

  const updateCurrentUserPoints = (points: number) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, points });
    setUsers(users.map(u => u.id === currentUser.id ? { ...u, points } : u));
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, reports, rewards, redeemHistory, pickupSchedules,
      login, logout, addReport, updateReportStatus, redeemReward, addSchedule,
      addReward, updateReward, deleteReward, updateCurrentUserPoints
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
