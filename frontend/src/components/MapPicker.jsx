import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';

// Fix default marker icon broken by webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ClickMarker({ onSelect }) {
  const [pos, setPos] = useState(null);
  useMapEvents({
    click(e) {
      setPos(e.latlng);
      onSelect(e.latlng);
    },
  });
  return pos ? <Marker position={pos} /> : null;
}

const MapPicker = ({ onLocationSelect }) => (
  <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-4">
    <p className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
      Click on the map to pin the event location (optional)
    </p>
    <MapContainer center={[20, 0]} zoom={2} style={{ height: '220px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickMarker onSelect={onLocationSelect} />
    </MapContainer>
  </div>
);

export default MapPicker;