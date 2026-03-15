import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { useAuth } from '../../context/AuthContext';
import { Leaf, Mail, Lock, AlertCircle, ShieldAlert, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const { role } = await login(email, password);
      // Redirect berdasarkan role
      if (role === 'warga') navigate('/dashboard/warga');
      else if (role === 'komunitas') navigate('/dashboard/komunitas');
      else if (role === 'admin') navigate('/dashboard/admin');
      else navigate('/dashboard/warga');
    } catch (err) {
      setError('Email atau password salah.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = (role: 'warga' | 'admin') => {
    const demoEmail = role === 'warga' ? 'warga@pedulisampah.com' : 'admin@pedulisampah.com';
    const demoPassword = '12345678';
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
          className="max-w-md w-full space-y-8 glass-card p-10 rounded-3xl shadow-2xl border border-white/50 relative z-10 bg-white/60 backdrop-blur-xl"
        >
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto h-16 w-16 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100/50 mb-6"
            >
              <Leaf className="h-8 w-8 text-emerald-600" />
            </motion.div>
            <h2 className="mt-6 text-3xl font-bold text-slate-900 tracking-tight">
              Selamat Datang
            </h2>
            <p className="mt-2 text-sm text-slate-500 font-medium pb-2">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100"
              >
                <AlertCircle className="h-5 w-5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5" htmlFor="email">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors shadow-sm sm:text-sm text-slate-900 placeholder:text-slate-400"
                    placeholder="Masukkan email"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5" htmlFor="password">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors shadow-sm sm:text-sm text-slate-900 placeholder:text-slate-400"
                    placeholder="Masukkan password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200/60">
            <p className="text-xs text-center text-slate-500 font-medium mb-4">
              Gunakan akun demo untuk mencoba aplikasi
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => loginAsDemo('warga')}
                className="flex items-center justify-center gap-2 py-2 px-3 border border-emerald-100 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <User className="h-3.5 w-3.5" />
                Demo Warga
              </button>
              <button
                type="button"
                onClick={() => loginAsDemo('admin')}
                className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
                Demo Admin
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
};
