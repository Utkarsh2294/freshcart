import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useOrderStore } from '../store/orderStore';
import * as socketService from '../services/socketService';
import { useAuth } from '../hooks/useAuth';

// Fix for leaflet markers
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function OrderTracking() {
  const { id } = useParams();
  const { tracking, fetchTracking } = useOrderStore();
  const { token } = useAuth();
  
  const [riderLocation, setRiderLocation] = useState(null);

  useEffect(() => {
    fetchTracking(id);
    
    if (token) {
      socketService.connect(token);
      socketService.joinOrderRoom(id);
      
      const unsubscribe = socketService.onTrackingUpdate((update) => {
        if (update.orderId === id && update.location) {
          setRiderLocation([update.location.lat, update.location.lng]);
        }
      });
      
      return () => {
        unsubscribe();
        socketService.disconnect();
      };
    }
  }, [id, fetchTracking, token]);

  if (!tracking) return <div className="p-8 text-center">Loading tracking details...</div>;

  const defaultCenter = [19.0760, 72.8777]; // Mumbai center
  const currentLoc = riderLocation || tracking.storeLocation || defaultCenter;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Track Order #{id.slice(-6).toUpperCase()}</h1>
      
      <div className="bg-white dark:bg-[#1A1C24] p-6 lg:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/50">
        <div className="flex justify-between items-center mb-2">
          <div className="text-center relative z-10">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] shadow-lg`}>1</div>
            <p className="text-xs mt-3 font-semibold text-gray-900 dark:text-white">Confirmed</p>
          </div>
          <div className="flex-1 h-1 bg-gradient-to-r from-[#EC4899] to-[#F97316] mx-2 opacity-50" />
          <div className="text-center relative z-10">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white ${['OUT_FOR_DELIVERY', 'DELIVERED'].includes(tracking.status) ? 'bg-gradient-to-br from-[#EC4899] to-[#F97316] shadow-lg' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>2</div>
            <p className={`text-xs mt-3 font-semibold ${['OUT_FOR_DELIVERY', 'DELIVERED'].includes(tracking.status) ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>Packed</p>
          </div>
          <div className={`flex-1 h-1 mx-2 ${['OUT_FOR_DELIVERY', 'DELIVERED'].includes(tracking.status) ? 'bg-gradient-to-r from-[#F97316] to-[#F97316] opacity-50' : 'bg-gray-200 dark:bg-gray-800'}`} />
          <div className="text-center relative z-10">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white ${tracking.status === 'DELIVERED' ? 'bg-[#F97316] shadow-lg' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>3</div>
            <p className={`text-xs mt-3 font-semibold ${tracking.status === 'DELIVERED' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>Delivered</p>
          </div>
        </div>
      </div>

      <div className="h-[400px] rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800/50 z-0 relative bg-gray-100 dark:bg-[#0F111A]">
        <MapContainer center={currentLoc} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {tracking.storeLocation && (
            <Marker position={tracking.storeLocation}>
              <Popup>Store Location</Popup>
            </Marker>
          )}
          {tracking.deliveryLocation && (
            <Marker position={tracking.deliveryLocation}>
              <Popup>Delivery Address</Popup>
            </Marker>
          )}
          {currentLoc && (
            <Marker position={currentLoc}>
              <Popup>Rider is here</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      
      <div className="bg-white dark:bg-[#1A1C24] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/50 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl">⏱️</div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest relative z-10">Estimated Delivery</p>
        <p className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#F97316] mt-2 relative z-10">12 Mins</p>
      </div>
    </div>
  );
}
