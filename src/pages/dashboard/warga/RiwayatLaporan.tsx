import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { useAppContext } from "../../../store/AppContext";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { MapPin, Info, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { AddressDisplay } from "@/src/components/AddressDisplay";

export const RiwayatLaporan = () => {
  const { currentUser, reports } = useAppContext();

  if (!currentUser) return null;

  const myReports = reports.filter((r) => r.userId === currentUser.id);

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
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <DashboardLayout requiredRole="warga">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-slate-900">Riwayat Laporan</h1>
        <p className="text-slate-600 mt-1">
          Daftar semua laporan sampah yang pernah Anda buat.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="glass-card rounded-3xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/60">
            <thead className="bg-slate-50/50 backdrop-blur-sm">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  Info Laporan
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  Lokasi
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  Tanggal
                </th>
              </tr>
            </thead>
            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/40 divide-y divide-slate-200/60"
            >
              {myReports.length > 0 ? (
                myReports.map((report) => (
                  <motion.tr
                    variants={itemVariants}
                    key={report.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16">
                          <img
                            className="h-16 w-16 rounded-xl object-cover shadow-sm"
                            src={report.photoUrl}
                            alt=""
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">
                            {report.title}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">
                            {report.category}
                          </div>
                        </div>
                      </div>
                      {report.userTip && (
                        <div className="mt-2 inline-flex items-center gap-1 bg-emerald-50/80 text-emerald-700 px-2 py-1 rounded-md text-xs font-medium border border-emerald-100/50 shadow-sm">
                          <Heart className="h-3 w-3" />
                          Tip Anda: {report.userTip}
                        </div>
                      )}
                      {report.tips && (
                        <div className="mt-3 bg-blue-50/80 p-3 rounded-xl flex items-start gap-2 border border-blue-100/50 shadow-sm">
                          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-blue-800 leading-relaxed">
                            <span className="font-bold">Tips Petugas:</span>{" "}
                            {report.tips}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-500">
                        <MapPin className="h-4 w-4 mr-1 text-slate-400 flex-shrink-0" />
                        <AddressDisplay
                          lat={report.lat}
                          lng={report.lng}
                          className="truncate max-w-[150px] sm:max-w-[250px]"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          report.status === "Selesai"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : report.status === "Ditolak"
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : report.status === "Menunggu Verifikasi"
                                ? "bg-slate-100 text-slate-800 border border-slate-200"
                                : "bg-orange-100 text-orange-800 border border-orange-200"
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                      {format(new Date(report.createdAt), "dd MMM yyyy", {
                        locale: id,
                      })}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    Belum ada riwayat laporan.
                  </td>
                </tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};
