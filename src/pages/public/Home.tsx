import { Link } from 'react-router-dom';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { useAppContext } from '../../store/AppContext';
import { MapPin, CheckCircle, Users, Camera, Truck, Gift, Star, ArrowRight, Leaf, Mail, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Home = () => {
  const { reports, users } = useAppContext();

  const totalReports = reports.length;
  const completedReports = reports.filter(r => r.status === 'Selesai').length;
  const activeCitizens = users.filter(u => u.role === 'warga').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="relative pt-8 pb-16 overflow-hidden bg-slate-50">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-400/20 blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-teal-300/20 blur-[100px]" />
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-green-200/30 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1] text-slate-900">
              Bareng-bareng <br className="hidden sm:block" />
              <span className="text-gradient">Jaga Lingkungan Kita</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
              PeduliSampah ngebantu warga ngelaporin, mantau, dan ngelola sampah di sekitar kita. Laporkan tumpukan sampah, kumpulin poinnya, dan tukerin sama reward menarik!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link 
                to="/login" 
                className="inline-flex justify-center items-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-[0_8px_20px_rgb(16,185,129,0.3)] hover:shadow-[0_8px_25px_rgb(16,185,129,0.4)] transition-all duration-300 transform hover:-translate-y-1 focus:ring-4 focus:ring-emerald-500/30"
              >
                Mulai Melapor
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/peta" 
                className="inline-flex justify-center items-center px-8 py-4 text-lg font-semibold rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all duration-300 transform hover:-translate-y-1 focus:ring-4 focus:ring-slate-200"
              >
                Lihat Peta Sampah
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-20">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants} className="glass-card p-8 rounded-2xl flex flex-col items-center text-center">
            <div className="bg-emerald-100/50 p-4 rounded-2xl mb-5 text-emerald-600">
              <MapPin className="h-8 w-8" />
            </div>
            <h3 className="text-4xl font-bold text-slate-900 mb-1">{totalReports}</h3>
            <p className="text-slate-500 font-medium">Total Laporan</p>
          </motion.div>
          <motion.div variants={itemVariants} className="glass-card p-8 rounded-2xl flex flex-col items-center text-center">
            <div className="bg-teal-100/50 p-4 rounded-2xl mb-5 text-teal-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-4xl font-bold text-slate-900 mb-1">{completedReports}</h3>
            <p className="text-slate-500 font-medium">Laporan Selesai</p>
          </motion.div>
          <motion.div variants={itemVariants} className="glass-card p-8 rounded-2xl flex flex-col items-center text-center">
            <div className="bg-blue-100/50 p-4 rounded-2xl mb-5 text-blue-600">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-4xl font-bold text-slate-900 mb-1">{activeCitizens}</h3>
            <p className="text-slate-500 font-medium">Warga Aktif</p>
          </motion.div>
        </motion.div>
      </div>

      {/* How it works Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Cara Kerja PeduliSampah</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Gampang banget kok buat ikutan jaga lingkungan! Ikuti 4 langkah mudah ini.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <motion.div variants={itemVariants} className="glass-card p-8 rounded-2xl text-center relative group">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">1</div>
              <div className="bg-slate-50 w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Camera className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Laporkan Sampah</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Foto tumpukan sampah yang kamu temuin dan tandai lokasinya di peta.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-8 rounded-2xl text-center relative group">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">2</div>
              <div className="bg-slate-50 w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Truck className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Petugas Menangani</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Komunitas atau petugas kebersihan bakal verifikasi dan angkut sampahnya.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-8 rounded-2xl text-center relative group">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">3</div>
              <div className="bg-slate-50 w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Star className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Dapatkan Poin</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Tiap laporan yang valid bakal ngasih kamu poin sebagai bentuk apresiasi.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-8 rounded-2xl text-center relative group">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">4</div>
              <div className="bg-slate-50 w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Gift className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Tukar Reward</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Kumpulin poinnya dan tukerin sama voucher UMKM atau token listrik!</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900 text-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 rounded-xl shadow-lg">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">PeduliSampah</h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Platform kolaboratif untuk pelaporan sampah, pemantauan penanganan, dan pengelolaan reward berbasis partisipasi warga.
              </p>
              <p className="mt-3 text-sm text-emerald-300 font-medium">
                Bareng-bareng jaga lingkungan kita.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Navigasi Cepat</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-emerald-300 transition-colors">
                    <ChevronRight className="h-4 w-4" /> Beranda
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/lapor" className="inline-flex items-center gap-2 text-slate-300 hover:text-emerald-300 transition-colors">
                    <ChevronRight className="h-4 w-4" /> Laporan
                  </Link>
                </li>
                <li>
                  <Link to="/peta" className="inline-flex items-center gap-2 text-slate-300 hover:text-emerald-300 transition-colors">
                    <ChevronRight className="h-4 w-4" /> Peta
                  </Link>
                </li>
                <li>
                  <Link to="/leaderboard" className="inline-flex items-center gap-2 text-slate-300 hover:text-emerald-300 transition-colors">
                    <ChevronRight className="h-4 w-4" /> Leaderboard
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/profil" className="inline-flex items-center gap-2 text-slate-300 hover:text-emerald-300 transition-colors">
                    <ChevronRight className="h-4 w-4" /> Profil
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Informasi Platform</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
                <li className="inline-flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  Pelaporan cepat berbasis lokasi
                </li>
                <li className="inline-flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  Monitoring status penanganan
                </li>
                <li className="inline-flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  Sistem poin dan reward warga
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Kontak</h4>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                Punya pertanyaan atau masukan? Hubungi tim kami.
              </p>
              <a
                href="mailto:halo@pedulisampah.id"
                className="mt-3 inline-flex items-center gap-2 text-sm text-slate-200 hover:text-emerald-300 transition-colors"
              >
                <Mail className="h-4 w-4" />
                halo@pedulisampah.id
              </a>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-800 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-slate-400">© 2026 PeduliSampah. Semua hak dilindungi.</p>
            <p className="text-xs text-slate-500">Dibuat untuk mendorong lingkungan yang lebih bersih dan berkelanjutan.</p>
          </div>
        </div>
      </footer>
    </PublicLayout>
  );
};
