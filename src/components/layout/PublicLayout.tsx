import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { motion } from 'framer-motion';

export const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-400/5 rounded-full blur-3xl" />
      </div>

      <Navbar />
      <main className="flex-1 relative z-10 pt-16"> {/* Added pt-16 to account for fixed navbar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>
      <BottomNav />
    </div>
  );
};
