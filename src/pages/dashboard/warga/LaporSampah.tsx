import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { useAppContext, WasteCategory } from "../../../store/AppContext";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Upload,
  MapPin,
  Sparkles,
  Loader2,
  CheckCircle2,
  Heart,
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { motion } from "framer-motion";

type ReportCategory = Exclude<WasteCategory, "belum terdeteksi">;

const CATEGORY_OPTIONS: Array<{ value: ReportCategory; label: string }> = [
  { value: "organik", label: "Organik" },
  { value: "anorganik", label: "Anorganik" },
  { value: "B3", label: "B3" },
];

const isValidCategory = (value: string): value is ReportCategory =>
  CATEGORY_OPTIONS.some((option) => option.value === value);

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LocationMarker = ({
  position,
  setPosition,
}: {
  position: L.LatLng | null;
  setPosition: (pos: L.LatLng) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
};

export const LaporSampah = () => {
  const { addReport } = useAppContext();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [category, setCategory] = useState<WasteCategory>("belum terdeteksi");
  const [categorySource, setCategorySource] = useState<"empty" | "ai" | "manual">(
    "empty",
  );
  const [categoryError, setCategoryError] = useState("");
  const [tip, setTip] = useState("");

  const [isDetecting, setIsDetecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    -6.2, 106.816666,
  ]);
  const [addressName, setAddressName] = useState<string>("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAddress = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      );
      const data = await response.json();
      if (data && data.display_name) {
        // Simplify the address to be more readable
        const parts = data.display_name.split(", ");
        const simplifiedAddress = parts.slice(0, 3).join(", ");
        setAddressName(simplifiedAddress);
      } else {
        setAddressName("Lokasi tidak ditemukan");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddressName("Gagal memuat alamat");
    } finally {
      setIsLoadingAddress(false);
    }
  };

  useEffect(() => {
    if (position) {
      fetchAddress(position.lat, position.lng);
    }
  }, [position]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = new L.LatLng(
            pos.coords.latitude,
            pos.coords.longitude,
          );
          setPosition(newPos);
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.error("Error getting location:", err);
          // Fallback to default center if permission denied
        },
      );
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        setCategory("belum terdeteksi"); // Reset category on new photo
        setCategorySource("empty");
        setCategoryError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    if (!selectedCategory) {
      setCategory("belum terdeteksi");
      setCategorySource("empty");
      return;
    }

    if (isValidCategory(selectedCategory)) {
      setCategory(selectedCategory);
      setCategorySource("manual");
      setCategoryError("");
    }
  };

  const detectWasteWithAI = async () => {
    if (!photoUrl) return;

    setIsDetecting(true);
    try {
      // Extract base64 data
      const base64Data = photoUrl.split(",")[1];
      const mimeType = photoUrl.split(";")[0].split(":")[1];

      const ai = new GoogleGenAI({
        apiKey:
          process.env.GEMINI_API_KEY ||
          "AIzaSyD7ky8eLMLfb3a6ljDy1lzfyNPy8dhWjxo",
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: 'Analyze this image of waste. Classify it strictly into one of these three categories: "organik", "anorganik", or "B3". Respond with ONLY the category name in lowercase. If unsure, default to "anorganik".',
            },
          ],
        },
      });

      const resultText = response.text?.trim().toLowerCase() || "";

      let detectedCategory: ReportCategory;
      if (resultText.includes("organik") && !resultText.includes("anorganik")) {
        detectedCategory = "organik";
      } else if (resultText.includes("b3")) {
        detectedCategory = "B3";
      } else {
        detectedCategory = "anorganik";
      }
      setCategory(detectedCategory);
      setCategorySource("ai");
      setCategoryError("");
    } catch (error) {
      console.error("AI Detection failed:", error);
      setCategory("belum terdeteksi");
      setCategorySource("empty");
      alert(
        "Gagal mendeteksi jenis sampah. Silakan pilih kategori secara manual.",
      );
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !photoUrl || !position) {
      alert(
        "Mohon lengkapi semua data (Judul, Deskripsi, Foto, dan Lokasi Peta).",
      );
      return;
    }
    if (!isValidCategory(category)) {
      setCategoryError("Jenis sampah wajib diisi.");
      alert("Jenis sampah wajib diisi, pilih manual atau gunakan deteksi AI.");
      return;
    }

    setIsSubmitting(true);

    // Simulate network delay
    setTimeout(() => {
      addReport({
        title,
        description,
        photoUrl,
        lat: position.lat,
        lng: position.lng,
        category,
        userTip: tip || undefined,
      });

      setIsSubmitting(false);
      setSuccess(true);

      setTimeout(() => {
        navigate("/dashboard/warga/riwayat");
      }, 2000);
    }, 1000);
  };

  if (success) {
    return (
      <DashboardLayout requiredRole="warga">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="glass-card p-12 rounded-3xl text-center max-w-2xl mx-auto mt-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-emerald-100/80 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200"
          >
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Laporan Berhasil Dikirim!
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Terima kasih atas partisipasi Anda. Laporan Anda sedang menunggu
            verifikasi. Anda mendapatkan +10 Poin!
          </p>
          <p className="text-sm text-slate-400">
            Mengarahkan ke riwayat laporan...
          </p>
        </motion.div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="warga">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-slate-900">Laporkan Sampah</h1>
        <p className="text-slate-600 mt-1">
          Isi form di bawah ini untuk melaporkan tumpukan sampah.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="glass-card rounded-3xl overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-8">
            {/* Foto Upload */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Foto Sampah
              </label>
              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-2xl transition-all duration-300 ${
                  photoUrl
                    ? "border-emerald-500 bg-emerald-50/50"
                    : "border-slate-300 hover:border-emerald-400 bg-white/50"
                }`}
              >
                <div className="space-y-1 text-center w-full">
                  {photoUrl ? (
                    <div className="relative w-full max-w-md mx-auto">
                      <img
                        src={photoUrl}
                        alt="Preview"
                        className="mx-auto h-48 w-full object-cover rounded-xl shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoUrl("");
                          setCategory("belum terdeteksi");
                          setCategorySource("empty");
                          setCategoryError("");
                        }}
                        className="absolute -top-3 -right-3 bg-red-100 text-red-600 rounded-full p-1.5 hover:bg-red-200 shadow-sm transition-colors"
                      >
                        <span className="sr-only">Hapus</span>
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="flex text-sm text-slate-600 justify-center mt-4">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white/80 px-3 py-1 rounded-lg font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500 shadow-sm border border-slate-200 transition-colors"
                        >
                          <span>Upload file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            ref={fileInputRef}
                          />
                        </label>
                        <p className="pl-2 flex items-center">
                          atau drag and drop
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              {photoUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                      <Sparkles className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Deteksi Jenis Sampah
                      </p>
                      <p className="text-xs text-slate-500">
                        {category !== "belum terdeteksi" ? (
                          <span className="text-emerald-600 font-bold uppercase">
                            {category}
                          </span>
                        ) : (
                          "Gunakan AI untuk mendeteksi otomatis"
                        )}
                      </p>
                      {categorySource === "ai" && (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200 mt-1">
                          Hasil deteksi AI
                        </span>
                      )}
                      {categorySource === "manual" && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 border border-slate-200 mt-1">
                          Diubah manual
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={detectWasteWithAI}
                    disabled={isDetecting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isDetecting ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Mendeteksi...
                      </>
                    ) : (
                      "Deteksi dengan AI"
                    )}
                  </button>
                </motion.div>
              )}

              <div className="mt-4">
                <label
                  htmlFor="category"
                  className="block text-sm font-bold text-slate-900"
                >
                  Jenis Sampah <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  Terisi otomatis setelah deteksi AI, tapi kamu bisa ubah manual
                  kapan saja.
                </p>
                <select
                  id="category"
                  name="category"
                  value={category === "belum terdeteksi" ? "" : category}
                  onChange={handleCategoryChange}
                  required
                  className="mt-2 block w-full shadow-sm sm:text-sm border-slate-200 rounded-xl px-4 py-3 border bg-white/80 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  <option value="">Pilih jenis sampah</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {categoryError && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {categoryError}
                  </p>
                )}
              </div>
            </div>

            {/* Judul & Deskripsi */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-bold text-slate-900"
                >
                  Judul Laporan
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-slate-200 rounded-xl px-4 py-3 border bg-white/50 backdrop-blur-sm transition-colors"
                  placeholder="Contoh: Tumpukan sampah di pinggir jalan"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-bold text-slate-900"
                >
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-slate-200 rounded-xl px-4 py-3 border bg-white/50 backdrop-blur-sm transition-colors"
                  placeholder="Jelaskan kondisi sampah secara detail..."
                />
              </div>
            </div>

            {/* Peta Lokasi */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />
                Tentukan Lokasi di Peta
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Lokasi kamu udah otomatis terdeteksi. Geser pin kalau kurang pas
                ya!
              </p>
              <div className="h-80 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-0 relative">
                <MapContainer
                  center={mapCenter}
                  zoom={15}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker
                    position={position}
                    setPosition={setPosition}
                  />
                </MapContainer>
              </div>
              {position && (
                <div className="mt-3 p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-xl backdrop-blur-sm flex items-start gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-emerald-100 flex-shrink-0">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Detail Lokasi
                    </h4>
                    {isLoadingAddress ? (
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Mencari alamat...
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">
                        {addressName}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tip (Opsional) */}
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/50 backdrop-blur-sm">
              <label
                htmlFor="tip"
                className="block text-sm font-bold text-emerald-900 mb-2 flex items-center gap-2"
              >
                <Heart className="h-4 w-4 text-emerald-600" />
                Tip untuk Petugas (Opsional)
              </label>
              <p className="text-xs text-emerald-700 mb-3">
                Bantu petugas kebersihan dengan ngasih tip seikhlasnya lewat
                e-wallet atau tunai saat pengangkutan.
              </p>
              <input
                type="text"
                name="tip"
                id="tip"
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                className="mt-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-emerald-200/50 rounded-xl px-4 py-3 border bg-white/80 transition-colors"
                placeholder="Contoh: Rp 10.000 (Gopay) atau Tunai"
              />
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100/50 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-bold rounded-xl shadow-sm text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Mengirim...
                </>
              ) : (
                "Kirim Laporan"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </DashboardLayout>
  );
};
