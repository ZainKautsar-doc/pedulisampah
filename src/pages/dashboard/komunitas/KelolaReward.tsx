import React, { useState } from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { useAppContext } from '../../../store/AppContext';
import { Gift, Plus, Edit, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: 0.2 }
  }
};

export const KelolaReward = () => {
  const { rewards, addReward, updateReward, deleteReward } = useAppContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pointsRequired, setPointsRequired] = useState(0);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPointsRequired(0);
    setIsModalOpen(true);
  };

  const openEditModal = (reward: any) => {
    setEditingId(reward.id);
    setName(reward.name);
    setDescription(reward.description);
    setPointsRequired(reward.pointsRequired);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || pointsRequired <= 0) {
      alert('Mohon lengkapi semua data dengan benar.');
      return;
    }

    if (editingId) {
      updateReward(editingId, { name, description, pointsRequired });
    } else {
      addReward({ name, description, pointsRequired });
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus reward ini?')) {
      deleteReward(id);
    }
  };

  return (
    <DashboardLayout requiredRole="komunitas">
      <motion.div 
        className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Kelola Reward</h1>
          <p className="text-slate-500 mt-2">Atur daftar hadiah yang bisa ditukarkan oleh warga.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openAddModal}
          className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Reward
        </motion.button>
      </motion.div>

      <motion.div 
        className="glass-card rounded-3xl overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/20">
            <thead className="bg-white/40 backdrop-blur-md">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Reward</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Poin Dibutuhkan</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {rewards.map((reward, index) => (
                <motion.tr 
                  key={reward.id} 
                  variants={itemVariants}
                  className="hover:bg-white/50 transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100/50">
                        <Gift className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-slate-800">{reward.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{reward.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-yellow-100 to-amber-50 text-yellow-800 border border-yellow-200/50 shadow-sm">
                      {reward.pointsRequired} Poin
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openEditModal(reward)}
                      className="text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100 p-2.5 rounded-xl mr-2 transition-colors border border-blue-100/50 shadow-sm"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(reward.id)}
                      className="text-rose-600 hover:text-rose-700 bg-rose-50/80 hover:bg-rose-100 p-2.5 rounded-xl transition-colors border border-rose-100/50 shadow-sm"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal Add/Edit Reward */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                aria-hidden="true" 
                onClick={() => setIsModalOpen(false)}
              />
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <motion.div 
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="inline-block align-bottom glass-card rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-white/40"
              >
                <form onSubmit={handleSubmit}>
                  <div className="px-6 pt-6 pb-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800" id="modal-title">
                        {editingId ? 'Edit Reward' : 'Tambah Reward Baru'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600 bg-slate-100/50 hover:bg-slate-200/50 p-2 rounded-xl transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Reward</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 block w-full pl-4 pr-10 py-3 text-base border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 sm:text-sm rounded-2xl bg-white/50 backdrop-blur-sm border shadow-sm transition-all"
                          placeholder="Contoh: Voucher Sembako"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi</label>
                        <textarea
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="mt-1 block w-full pl-4 pr-10 py-3 text-base border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 sm:text-sm rounded-2xl bg-white/50 backdrop-blur-sm border shadow-sm transition-all resize-none"
                          placeholder="Jelaskan detail reward..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Poin Dibutuhkan</label>
                        <input
                          type="number"
                          min="1"
                          value={pointsRequired}
                          onChange={(e) => setPointsRequired(Number(e.target.value))}
                          className="mt-1 block w-full pl-4 pr-10 py-3 text-base border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 sm:text-sm rounded-2xl bg-white/50 backdrop-blur-sm border shadow-sm transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/40 backdrop-blur-md px-6 py-4 border-t border-white/20 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full inline-flex justify-center rounded-2xl border border-slate-200 shadow-sm px-5 py-2.5 bg-white text-base font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:w-auto sm:text-sm transition-all"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Batal
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full inline-flex justify-center rounded-2xl border border-transparent shadow-sm px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-base font-bold text-white hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:w-auto sm:text-sm transition-all"
                    >
                      Simpan
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};
