import { PublicLayout } from '../../components/layout/PublicLayout';
import { useAppContext } from '../../store/AppContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { AddressDisplay } from '../../components/AddressDisplay';
import { MapPin } from 'lucide-react';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getMarkerIcon = (status: string) => {
  let color = 'red';
  if (status === 'Diproses' || status === 'Dijadwalkan') color = 'orange';
  if (status === 'Selesai') color = 'green';

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

export const MapPage = () => {
  const { reports } = useAppContext();

  return (
    <PublicLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col relative">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md p-4 border-b border-slate-200/50 shadow-sm z-10 sticky top-0"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Peta Sebaran Sampah</h1>
            <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-600">
              <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                <span>Belum Ditangani</span>
              </div>
              <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
                <span>Diproses/Dijadwalkan</span>
              </div>
              <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                <span>Selesai</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 relative z-0"
        >
          <MapContainer 
            center={[-6.200000, 106.816666]} 
            zoom={13} 
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {reports.map((report) => (
              <Marker 
                key={report.id} 
                position={[report.lat, report.lng]}
                icon={getMarkerIcon(report.status)}
              >
                <Popup className="rounded-2xl overflow-hidden shadow-xl border-0">
                  <div className="w-56">
                    <div className="relative h-36 -mt-4 -mx-5 max-w-[calc(100%+40px)]">
                      <img 
                        src={report.photoUrl} 
                        alt={report.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3">
                        <h3 className="font-bold text-white leading-tight drop-shadow-md line-clamp-2">{report.title}</h3>
                      </div>
                    </div>
                    
                    <div className="mt-4 px-1 pb-1">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-xs text-slate-500 font-medium">
                          {format(new Date(report.createdAt), 'dd MMM yyyy', { locale: id })}
                        </p>
                        <div className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                          {report.category}
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-slate-100">
                        <div className="flex items-start gap-1.5 mb-2 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
                          <AddressDisplay lat={report.lat} lng={report.lng} className="line-clamp-2 leading-tight" />
                        </div>
                        <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            report.status === 'Selesai' ? 'bg-emerald-500' : 
                            report.status === 'Menunggu Verifikasi' ? 'bg-red-500' : 'bg-orange-500'
                          }`} />
                          {report.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </motion.div>
      </div>
    </PublicLayout>
  );
};
