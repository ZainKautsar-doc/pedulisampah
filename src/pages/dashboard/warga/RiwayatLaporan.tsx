import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { useAppContext } from "../../../store/AppContext";
import type { Report } from "../../../store/AppContext";
import { format, isValid } from "date-fns";
import { id } from "date-fns/locale";
import { MapPin, Info, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { AddressDisplay } from "@/src/components/AddressDisplay";
import { useEffect, useMemo, useState } from "react";

const isValidReport = (report: unknown): report is Report => {
  if (!report || typeof report !== "object") return false;
  const item = report as Partial<Report>;
  return (
    typeof item.id === "string" &&
    typeof item.userId === "string" &&
    typeof item.title === "string" &&
    typeof item.description === "string" &&
    typeof item.photoUrl === "string" &&
    typeof item.createdAt === "string" &&
    typeof item.status === "string" &&
    typeof item.category === "string" &&
    typeof item.lat === "number" &&
    typeof item.lng === "number"
  );
};

const formatReportDate = (rawDate: string) => {
  const parsedDate = new Date(rawDate);
  if (!isValid(parsedDate)) return "Tanggal tidak valid";
  return format(parsedDate, "dd MMM yyyy", { locale: id });
};

export const RiwayatLaporan = () => {
  const { currentUser, reports } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const safeReports = useMemo(() => {
    if (!currentUser || !Array.isArray(reports)) return [];
    return reports
      .filter(isValidReport)
      .filter((report) => report.userId === currentUser.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [currentUser, reports]);

  useEffect(() => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (!Array.isArray(reports)) {
        throw new Error("Format data laporan tidak valid.");
      }
    } catch (error) {
      console.error("RiwayatLaporan error:", error);
      setErrorMessage("Gagal memuat data riwayat laporan.");
    } finally {
      setIsLoading(false);
    }
  }, [reports, currentUser]);

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
        className="glass-card rounded-3xl overflow-hidden w-full"
      >
        <div className="p-4 sm:p-6 overflow-x-hidden">
          {isLoading ? (
            <div className="py-10 text-center text-slate-500">
              Memuat riwayat laporan...
            </div>
          ) : errorMessage ? (
            <div className="py-10 text-center text-red-600 font-medium">
              {errorMessage}
            </div>
          ) : safeReports.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5"
            >
              {safeReports.map((report) => (
                <motion.article
                  variants={itemVariants}
                  key={report.id}
                  className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 sm:p-5 shadow-sm hover:bg-slate-50/80 transition-colors overflow-hidden"
                >
                  <div className="flex items-start gap-3">
                    <img
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover shadow-sm flex-shrink-0"
                      src={report.photoUrl}
                      alt={report.title}
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {report.title}
                      </h3>
                      <span className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-slate-100 text-slate-700 border border-slate-200">
                        {report.category}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center text-slate-600 min-w-0">
                      <MapPin className="h-4 w-4 mr-1.5 text-slate-400 flex-shrink-0" />
                      {Number.isFinite(report.lat) && Number.isFinite(report.lng) ? (
                        <AddressDisplay
                          lat={report.lat}
                          lng={report.lng}
                          className="truncate max-w-full"
                        />
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs sm:text-sm">
                      {formatReportDate(report.createdAt)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
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
                    {report.userTip && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50/80 text-emerald-700 px-2 py-1 rounded-md text-xs font-medium border border-emerald-100/50">
                        <Heart className="h-3 w-3" />
                        Tip Anda
                      </span>
                    )}
                  </div>

                  {report.tips && (
                    <div className="mt-3 bg-blue-50/80 p-3 rounded-xl flex items-start gap-2 border border-blue-100/50">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-800 leading-relaxed line-clamp-2">
                        <span className="font-bold">Tips Petugas:</span>{" "}
                        {report.tips}
                      </p>
                    </div>
                  )}
                </motion.article>
              ))}
            </motion.div>
          ) : (
            <div className="py-10 text-center text-slate-500">
              Belum ada riwayat laporan.
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};
