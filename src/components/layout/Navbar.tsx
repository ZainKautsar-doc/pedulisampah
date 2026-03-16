import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

export const Navbar = () => {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 20);
    });
  }, [scrollY]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Peta Sampah', path: '/peta' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Tentang', path: '/tentang' },
  ];

  const profilePath = currentUser?.role === 'warga' ? '/dashboard/profil' : 
                      currentUser?.role === 'komunitas' ? '/dashboard-komunitas/profil' : 
                      '/dashboard/admin';

  return (
    <>
      <motion.nav 
        className={clsx(
          "sticky top-0 z-50 transition-all duration-300",
          isScrolled ? "glass-nav shadow-sm py-2" : "bg-transparent py-4"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-900 tracking-tight">PeduliSampah</span>
              </Link>
              
              <div className="hidden md:flex md:space-x-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link 
                      key={link.name}
                      to={link.path} 
                      className="relative px-4 py-2 text-sm font-medium rounded-lg group transition-colors"
                    >
                      <span className={clsx("relative z-10 transition-colors duration-200", isActive ? "text-emerald-700" : "text-slate-600 group-hover:text-emerald-600")}>
                        {link.name}
                      </span>
                      {isActive && (
                        <motion.div 
                          layoutId="navbar-indicator"
                          className="absolute inset-0 bg-emerald-50 rounded-lg z-0"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      {!isActive && (
                        <div className="absolute inset-0 bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center">
              {currentUser ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-slate-200/60 pl-2 pr-4 py-1.5 rounded-full shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-1.5 rounded-full border border-emerald-200/50">
                      <UserIcon className="h-4 w-4 text-emerald-700" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-semibold text-slate-800 leading-none">{currentUser.name}</span>
                      <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider mt-0.5">{currentUser.role}</span>
                    </div>
                    <ChevronDown className={clsx("h-4 w-4 text-slate-400 transition-transform duration-200 ml-1", isProfileOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50"
                      >
                        <div className="py-1">
                          <Link
                            to={profilePath}
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                          >
                            Profil Saya
                          </Link>
                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              setIsLogoutModalOpen(true);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <LogOut className="h-4 w-4" />
                            Keluar
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 focus:ring-4 focus:ring-emerald-500/30"
                >
                  Masuk
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 overflow-hidden"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">Konfirmasi Keluar</h3>
              <p className="text-slate-600 mb-6">Yakin ingin keluar dari aplikasi?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    setIsLogoutModalOpen(false);
                    handleLogout();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
                >
                  Keluar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
