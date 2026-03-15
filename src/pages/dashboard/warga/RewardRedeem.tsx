import { useState } from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { useAppContext } from '../../../store/AppContext';
import { Gift, Star, CheckCircle2, Ticket, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RewardRedeem = () => {
  const { currentUser, rewards, redeemReward, redeemHistory } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);
  const [redeemResult, setRedeemResult] = useState<{ success: boolean; code?: string; message?: string } | null>(null);

  if (!currentUser) return null;

  const myHistory = redeemHistory.filter(h => h.userId === currentUser.id);

  const initiateRedeem = (rewardId: string) => {
    setSelectedRewardId(rewardId);
    setConfirmModalOpen(true);
  };

  const handleConfirmRedeem = () => {
    if (selectedRewardId) {
      const result = redeemReward(selectedRewardId);
      setRedeemResult(result);
      setConfirmModalOpen(false);
      setModalOpen(true);
    }
  };

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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", duration: 0.5, bounce: 0.3 } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
  };

  return (
    <DashboardLayout requiredRole="warga">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reward & Redeem</h1>
          <p className="text-slate-600 mt-1">Tukarkan poin Anda dengan berbagai hadiah menarik.</p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-2xl shadow-md flex items-center gap-3 border border-emerald-500/30"
        >
          <Star className="h-6 w-6 text-yellow-300 fill-yellow-300 drop-shadow-sm" />
          <div>
            <p className="text-xs text-emerald-100 font-medium uppercase tracking-wider">Poin Saya</p>
            <p className="text-2xl font-bold leading-none">{currentUser.points}</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
      >
        {rewards.map((reward) => (
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            key={reward.id} 
            className="glass-card rounded-3xl overflow-hidden flex flex-col group"
          >
            <div className="h-32 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 flex items-center justify-center border-b border-emerald-100/50 group-hover:from-emerald-100/80 group-hover:to-teal-100/80 transition-colors duration-300">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
              >
                <Gift className="h-12 w-12 text-emerald-400 drop-shadow-sm" />
              </motion.div>
            </div>
            <div className="p-6 flex-1 flex flex-col bg-white/40">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{reward.name}</h3>
              <p className="text-sm text-slate-500 mb-6 flex-1">{reward.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100/60">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100/80 text-yellow-800 border border-yellow-200/50 shadow-sm">
                  {reward.pointsRequired} Poin
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => initiateRedeem(reward.id)}
                  disabled={currentUser.points < reward.pointsRequired}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Redeem
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {myHistory.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="glass-card rounded-3xl overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-slate-100/60 bg-slate-50/50 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Ticket className="h-5 w-5 text-slate-500" />
              Riwayat Penukaran
            </h3>
          </div>
          <div className="divide-y divide-slate-100/60 bg-white/40">
            {myHistory.map(history => {
              const reward = rewards.find(r => r.id === history.rewardId);
              return (
                <div key={history.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div>
                    <h4 className="text-md font-bold text-slate-900">{reward?.name || 'Reward Tidak Diketahui'}</h4>
                    <p className="text-sm text-slate-500 mt-1">{new Date(history.redeemedAt).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Kode Voucher</p>
                    <p className="text-lg font-mono font-bold text-emerald-600 bg-emerald-50/80 px-3 py-1 rounded-lg border border-emerald-100/50 shadow-sm">{history.code}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Modal Confirm Redeem */}
      <AnimatePresence>
        {confirmModalOpen && selectedRewardId && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                aria-hidden="true" 
                onClick={() => setConfirmModalOpen(false)}
              />
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <motion.div 
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="inline-block align-bottom bg-white/90 backdrop-blur-md rounded-3xl text-left overflow-hidden shadow-2xl border border-white/20 transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full"
              >
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100/80 border border-yellow-200/50 sm:mx-0 sm:h-10 sm:w-10">
                      <AlertCircle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-bold text-slate-900" id="modal-title">
                        Konfirmasi Penukaran
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-slate-500">
                          Apakah Anda yakin ingin menukarkan <span className="font-bold text-slate-900">{rewards.find(r => r.id === selectedRewardId)?.pointsRequired} poin</span> untuk mendapatkan <span className="font-bold text-slate-900">{rewards.find(r => r.id === selectedRewardId)?.name}</span>?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3 border-t border-slate-100/60">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-base font-medium text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:w-auto sm:text-sm"
                    onClick={handleConfirmRedeem}
                  >
                    Ya, Tukarkan
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-200 shadow-sm px-4 py-2 bg-white/80 text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => setConfirmModalOpen(false)}
                  >
                    Batal
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Redeem Result */}
      <AnimatePresence>
        {modalOpen && redeemResult && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                aria-hidden="true" 
                onClick={() => setModalOpen(false)}
              />
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <motion.div 
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="inline-block align-bottom bg-white/90 backdrop-blur-md rounded-3xl text-left overflow-hidden shadow-2xl border border-white/20 transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full"
              >
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full border sm:mx-0 sm:h-10 sm:w-10 ${redeemResult.success ? 'bg-emerald-100/80 border-emerald-200/50' : 'bg-red-100/80 border-red-200/50'}`}>
                      {redeemResult.success ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      ) : (
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-bold text-slate-900" id="modal-title">
                        {redeemResult.success ? 'Penukaran Berhasil!' : 'Penukaran Gagal'}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-slate-500">
                          {redeemResult.success 
                            ? 'Selamat! Anda telah berhasil menukarkan poin Anda. Berikut adalah kode voucher Anda:' 
                            : redeemResult.message}
                        </p>
                        {redeemResult.success && (
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="mt-4 p-4 bg-slate-50/80 rounded-xl border border-slate-200/60 text-center shadow-inner"
                          >
                            <p className="text-2xl font-mono font-bold text-emerald-600 tracking-widest">{redeemResult.code}</p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-100/60">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-base font-medium text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setModalOpen(false)}
                  >
                    Tutup
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};
