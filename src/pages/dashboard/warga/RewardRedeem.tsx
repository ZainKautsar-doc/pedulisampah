import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { useAppContext } from '../../../store/AppContext';
import { Gift, Star, CheckCircle2, Ticket, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../lib/supabaseClient';

type RewardItem = {
  id: string;
  title: string;
  description: string | null;
  points_required: number;
  stock: number;
  image_url: string | null;
};

type RedeemHistoryItem = {
  id: string;
  voucher_code: string;
  status: string;
  created_at: string;
  rewards: { title: string } | null;
};

export const RewardRedeem = () => {
  const { currentUser, updateCurrentUserPoints } = useAppContext();
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [history, setHistory] = useState<RedeemHistoryItem[]>([]);
  const [userPoints, setUserPoints] = useState<number>(currentUser?.points || 0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);
  const [redeemResult, setRedeemResult] = useState<{ success: boolean; code?: string; message?: string } | null>(null);

  if (!currentUser) return null;

  const fetchRewards = async () => {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .order('points_required', { ascending: true });

    if (error) throw error;
    setRewards(data || []);
  };

  const fetchMyPoints = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('points')
      .eq('id', currentUser.id)
      .single();

    if (error) throw error;
    const nextPoints = data?.points || 0;
    setUserPoints(nextPoints);
    updateCurrentUserPoints(nextPoints);
  };

  const fetchMyHistory = async () => {
    const { data, error } = await supabase
      .from('redeems')
      .select(`
        id,
        voucher_code,
        status,
        created_at,
        rewards(title)
      `)
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setHistory((data || []) as RedeemHistoryItem[]);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchRewards(), fetchMyPoints(), fetchMyHistory()]);
      } catch (error) {
        console.error('Error loading rewards page:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [currentUser.id]);

  const initiateRedeem = (rewardId: string) => {
    setSelectedRewardId(rewardId);
    setConfirmModalOpen(true);
  };

  const generateVoucherCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'PS-';
    for (let i = 0; i < 6; i += 1) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleConfirmRedeem = async () => {
    if (!selectedRewardId || redeeming) return;

    setRedeeming(true);

    try {
      const selectedReward = rewards.find((r) => r.id === selectedRewardId);
      if (!selectedReward) throw new Error('Reward tidak ditemukan.');

      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('id, points')
        .eq('id', currentUser.id)
        .single();
      if (userError) throw userError;

      const { data: rewardRow, error: rewardError } = await supabase
        .from('rewards')
        .select('id, title, points_required, stock')
        .eq('id', selectedRewardId)
        .single();
      if (rewardError) throw rewardError;

      if ((userRow?.points || 0) < rewardRow.points_required) {
        setRedeemResult({ success: false, message: 'Poin kamu belum cukup untuk reward ini.' });
        setConfirmModalOpen(false);
        setModalOpen(true);
        return;
      }

      if ((rewardRow?.stock || 0) <= 0) {
        setRedeemResult({ success: false, message: 'Stok reward sudah habis.' });
        setConfirmModalOpen(false);
        setModalOpen(true);
        return;
      }

      const { data: stockUpdated, error: stockError } = await supabase
        .from('rewards')
        .update({ stock: rewardRow.stock - 1 })
        .eq('id', rewardRow.id)
        .eq('stock', rewardRow.stock)
        .select('stock')
        .single();
      if (stockError || !stockUpdated) {
        setRedeemResult({ success: false, message: 'Stok reward tidak tersedia. Silakan coba lagi.' });
        setConfirmModalOpen(false);
        setModalOpen(true);
        return;
      }

      const nextPoints = userRow.points - rewardRow.points_required;
      const { data: userUpdated, error: updatePointError } = await supabase
        .from('users')
        .update({ points: nextPoints })
        .eq('id', currentUser.id)
        .eq('points', userRow.points)
        .select('points')
        .single();

      if (updatePointError || !userUpdated) {
        await supabase
          .from('rewards')
          .update({ stock: rewardRow.stock })
          .eq('id', rewardRow.id);

        setRedeemResult({ success: false, message: 'Poin berubah saat proses redeem. Silakan coba lagi.' });
        setConfirmModalOpen(false);
        setModalOpen(true);
        return;
      }

      const voucherCode = generateVoucherCode();
      const nowIso = new Date().toISOString();

      const { error: redeemInsertError } = await supabase
        .from('redeems')
        .insert([{
          user_id: currentUser.id,
          reward_id: rewardRow.id,
          voucher_code: voucherCode,
          status: 'active',
          created_at: nowIso
        }]);

      if (redeemInsertError) {
        await supabase.from('users').update({ points: userRow.points }).eq('id', currentUser.id);
        await supabase.from('rewards').update({ stock: rewardRow.stock }).eq('id', rewardRow.id);
        throw redeemInsertError;
      }

      const { error: historyError } = await supabase
        .from('points_history')
        .insert([{
          user_id: currentUser.id,
          points_change: -rewardRow.points_required,
          description: `Redeem reward: ${rewardRow.title}`
        }]);

      if (historyError) {
        console.error('Failed to insert points history:', historyError);
      }

      setUserPoints(nextPoints);
      updateCurrentUserPoints(nextPoints);
      await Promise.all([fetchRewards(), fetchMyHistory()]);

      setRedeemResult({ success: true, code: voucherCode });
      setConfirmModalOpen(false);
      setModalOpen(true);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      setRedeemResult({ success: false, message: 'Terjadi kesalahan saat redeem. Coba lagi sebentar.' });
      setConfirmModalOpen(false);
      setModalOpen(true);
    } finally {
      setRedeeming(false);
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
            <p className="text-2xl font-bold leading-none">{userPoints}</p>
          </div>
        </motion.div>
      </motion.div>

      {loading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 mb-6">
          Memuat reward dan riwayat redeem...
        </div>
      )}

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
            <div className="h-40 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 flex items-center justify-center border-b border-emerald-100/50 group-hover:from-emerald-100/80 group-hover:to-teal-100/80 transition-colors duration-300 overflow-hidden">
              {reward.image_url ? (
                <img src={reward.image_url} alt={reward.title} className="w-full h-full object-cover" />
              ) : (
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
              >
                <Gift className="h-12 w-12 text-emerald-400 drop-shadow-sm" />
              </motion.div>
              )}
            </div>
            <div className="p-6 flex-1 flex flex-col bg-white/40">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{reward.title}</h3>
              <p className="text-sm text-slate-500 mb-3 flex-1">{reward.description || '-'}</p>
              <p className="text-xs text-slate-500 mb-4">Stok: <span className="font-semibold">{reward.stock}</span></p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100/60">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100/80 text-yellow-800 border border-yellow-200/50 shadow-sm">
                  {reward.points_required} Poin
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => initiateRedeem(reward.id)}
                  disabled={redeeming || userPoints < reward.points_required || reward.stock <= 0}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Redeem Reward
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="glass-card rounded-3xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-100/60 bg-slate-50/50 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-slate-500" />
            Riwayat Redeem
          </h3>
        </div>
        <div className="divide-y divide-slate-100/60 bg-white/40">
          {history.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">Belum ada riwayat redeem.</div>
          ) : history.map(item => {
            return (
              <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div>
                  <h4 className="text-md font-bold text-slate-900">{item.rewards?.title || 'Reward Tidak Diketahui'}</h4>
                  <p className="text-sm text-slate-500 mt-1">{new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                  <p className="text-xs text-slate-500 mt-1">Status: <span className="font-semibold">{item.status || 'active'}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Kode Voucher</p>
                  <p className="text-lg font-mono font-bold text-emerald-600 bg-emerald-50/80 px-3 py-1 rounded-lg border border-emerald-100/50 shadow-sm">{item.voucher_code}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

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
                          Apakah Anda yakin ingin menukarkan <span className="font-bold text-slate-900">{rewards.find(r => r.id === selectedRewardId)?.points_required} poin</span> untuk mendapatkan <span className="font-bold text-slate-900">{rewards.find(r => r.id === selectedRewardId)?.title}</span>?
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
                    disabled={redeeming}
                    className="w-full inline-flex items-center gap-2 justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-base font-medium text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:w-auto sm:text-sm disabled:opacity-60"
                    onClick={handleConfirmRedeem}
                  >
                    {redeeming && <Loader2 className="h-4 w-4 animate-spin" />}
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
