import { PublicLayout } from '../../components/layout/PublicLayout';
import { Leaf, Users, ShieldCheck, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

export const About = () => {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        </div>

        <motion.div 
          className="text-center mb-16 relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Tentang PeduliSampah</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Platform komunitas pengelolaan sampah yang menghubungkan warga dengan eksekutor kebersihan untuk menciptakan lingkungan yang lebih sehat dan asri.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants} className="glass-card p-8 rounded-3xl flex flex-col items-start group hover:bg-white/60 transition-colors duration-300">
            <div className="bg-gradient-to-br from-emerald-100 to-teal-50 p-4 rounded-2xl mb-6 shadow-sm border border-emerald-100/50 group-hover:scale-110 transition-transform duration-300">
              <Leaf className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Visi Kami</h3>
            <p className="text-slate-600 leading-relaxed">
              Mewujudkan lingkungan bebas sampah melalui partisipasi aktif masyarakat dan pengelolaan yang cerdas berbasis teknologi.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="glass-card p-8 rounded-3xl flex flex-col items-start group hover:bg-white/60 transition-colors duration-300">
            <div className="bg-gradient-to-br from-emerald-100 to-teal-50 p-4 rounded-2xl mb-6 shadow-sm border border-emerald-100/50 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Misi Kami</h3>
            <p className="text-slate-600 leading-relaxed">
              Membangun kesadaran kolektif, mempermudah pelaporan masalah kebersihan, dan memberikan apresiasi bagi pahlawan lingkungan.
            </p>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-emerald-900 to-teal-900 rounded-3xl p-10 md:p-12 text-white text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 opacity-10 mix-blend-overlay">
            <Globe className="w-full h-full scale-150 -translate-y-1/4" />
          </div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 tracking-tight">Bagaimana Cara Kerja PeduliSampah?</h2>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants} className="relative">
                <div className="w-16 h-16 bg-emerald-800/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 border border-emerald-600/50 shadow-lg transform rotate-3">1</div>
                <h4 className="text-xl font-bold mb-3">Lapor</h4>
                <p className="text-emerald-100/80 text-sm leading-relaxed">Temukan tumpukan sampah, foto, dan laporkan lokasinya melalui aplikasi.</p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="relative">
                <div className="hidden md:block absolute top-8 -left-1/2 w-full h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0"></div>
                <div className="w-16 h-16 bg-emerald-800/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 border border-emerald-600/50 shadow-lg transform -rotate-3">2</div>
                <h4 className="text-xl font-bold mb-3">Tindak Lanjut</h4>
                <p className="text-emerald-100/80 text-sm leading-relaxed">Komunitas atau petugas kebersihan akan memverifikasi dan mengangkut sampah.</p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="relative">
                <div className="hidden md:block absolute top-8 -left-1/2 w-full h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0"></div>
                <div className="w-16 h-16 bg-emerald-800/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 border border-emerald-600/50 shadow-lg transform rotate-3">3</div>
                <h4 className="text-xl font-bold mb-3">Reward</h4>
                <p className="text-emerald-100/80 text-sm leading-relaxed">Dapatkan poin dari setiap laporan valid dan tukarkan dengan berbagai reward menarik.</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
};
