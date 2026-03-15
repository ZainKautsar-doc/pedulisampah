import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../../store/AppContext';
import { motion } from 'framer-motion';

export const DashboardLayout = ({ children, requiredRole }: { children: ReactNode, requiredRole?: 'warga' | 'komunitas' }) => {
  const { currentUser } = useAppContext();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to={`/dashboard/${currentUser.role}`} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-0 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-400/5 rounded-full blur-3xl" />
      </div>

      <Navbar />
      <div className="flex flex-1 relative z-10">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full">
          <motion.div 
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
};
