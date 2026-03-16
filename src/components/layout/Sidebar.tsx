import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../store/AppContext';
import { 
  LayoutDashboard, 
  MapPin, 
  History, 
  Gift, 
  User, 
  Inbox, 
  CheckSquare, 
  CalendarClock, 
  Settings 
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export const Sidebar = () => {
  const { currentUser } = useAppContext();

  if (!currentUser) return null;

  const wargaLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Laporkan Sampah', path: '/dashboard/lapor', icon: MapPin },
    { name: 'Riwayat Laporan', path: '/dashboard/riwayat', icon: History },
    { name: 'Reward & Redeem', path: '/dashboard/reward', icon: Gift },
    { name: 'Profil', path: '/dashboard/profil', icon: User },
  ];

  const komunitasLinks = [
    { name: 'Dashboard', path: '/dashboard-komunitas', icon: LayoutDashboard },
    { name: 'Laporan Masuk', path: '/dashboard-komunitas/laporan', icon: Inbox },
    { name: 'Jadwal Pengangkutan', path: '/dashboard-komunitas/jadwal', icon: CalendarClock },
    { name: 'Kelola Reward', path: '/dashboard-komunitas/reward', icon: Settings },
    { name: 'Profil', path: '/dashboard-komunitas/profil', icon: User },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Manajemen Laporan', path: '/dashboard/admin/reports', icon: Inbox },
    { name: 'Jadwal Pengangkutan', path: '/dashboard/admin/schedules', icon: CalendarClock },
    { name: 'Kelola Reward', path: '/dashboard/admin/rewards', icon: Gift },
    { name: 'Riwayat Redeem', path: '/dashboard/admin/redeems', icon: History },
    { name: 'Manajemen User', path: '/dashboard/admin/users', icon: User },
  ];

  let links = currentUser.role === 'warga' ? wargaLinks : komunitasLinks;
  if(currentUser.role === 'admin') links = adminLinks;

  return (
    <div className="w-64 bg-white/80 backdrop-blur-md border-r border-slate-200/50 h-[calc(100vh-5rem)] sticky top-20 overflow-y-auto hidden md:block z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-4">
        <div className="space-y-1.5">
          {links.map((link, index) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/dashboard' || link.path === '/dashboard-komunitas' || link.path === '/dashboard/admin'}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 relative overflow-hidden group',
                    isActive
                      ? 'text-emerald-700 bg-emerald-50/80 shadow-sm border border-emerald-100/50'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebarTab"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className={clsx(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200",
                      isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-500"
                    )} />
                    <span className="relative z-10">{link.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};
