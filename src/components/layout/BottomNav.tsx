import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../store/AppContext';
import { Home, MapPin, PlusCircle, Gift, User, LayoutDashboard } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export const BottomNav = () => {
  const { currentUser } = useAppContext();

  const publicLinks = [
    { name: 'Beranda', path: '/', icon: Home },
    { name: 'Peta', path: '/peta', icon: MapPin },
    { name: 'Login', path: '/login', icon: User },
  ];

  const wargaLinks = [
    { name: 'Beranda', path: '/dashboard/warga', icon: Home },
    { name: 'Peta', path: '/peta', icon: MapPin },
    { name: 'Lapor', path: '/dashboard/warga/lapor', icon: PlusCircle },
    { name: 'Reward', path: '/dashboard/warga/reward', icon: Gift },
    { name: 'Profil', path: '/dashboard/warga/profil', icon: User },
  ];

  const komunitasLinks = [
    { name: 'Dashboard', path: '/dashboard/komunitas', icon: LayoutDashboard },
    { name: 'Peta', path: '/peta', icon: MapPin },
    { name: 'Laporan', path: '/dashboard/komunitas/laporan', icon: PlusCircle },
    { name: 'Reward', path: '/dashboard/komunitas/reward', icon: Gift },
    { name: 'Profil', path: '/dashboard/komunitas/profil', icon: User },
  ];

  let links = publicLinks;
  if (currentUser?.role === 'warga') links = wargaLinks;
  if (currentUser?.role === 'komunitas') links = komunitasLinks;

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 pb-safe">
      <div className="glass-nav rounded-2xl shadow-lg border border-white/40 px-2">
        <div className="flex justify-around items-center h-16">
          {links.map((link) => {
            const Icon = link.icon;
            const isLapor = link.name === 'Lapor' || link.name === 'Laporan';
            
            return (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/' || link.path === '/dashboard/warga' || link.path === '/dashboard/komunitas'}
                className={({ isActive }) =>
                  clsx(
                    'flex flex-col items-center justify-center w-full h-full space-y-1 relative',
                    isActive ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-500',
                    isLapor && '-mt-8'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && !isLapor && (
                      <motion.div 
                        layoutId="bottom-nav-indicator"
                        className="absolute -top-1 w-8 h-1 bg-emerald-500 rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {isLapor ? (
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-3.5 rounded-full shadow-[0_8px_20px_rgb(16,185,129,0.3)] border-4 border-white/80"
                      >
                        <Icon className="h-6 w-6" />
                      </motion.div>
                    ) : (
                      <motion.div
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Icon className={clsx("h-5 w-5", isActive && "fill-emerald-100")} />
                      </motion.div>
                    )}
                    <span className={clsx("text-[10px] font-semibold", isLapor && "mt-1")}>{link.name}</span>
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
