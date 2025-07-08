import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import L from 'leaflet';
import { useLocation } from '../contexts/LocationContext';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconRetinaUrl: markerIconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapClickHandler: React.FC = () => {
  const { setSelectedLocation } = useLocation();
  
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      setSelectedLocation({ lat, lng });
    },
  });
  
  return null;
};

interface LocationPickerProps {
  className?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  className = ''
}) => {
  const { selectedLocation } = useLocation();
  const mapRef = useRef<L.Map | null>(null);

  const defaultCenter: [number, number] = [9.9177, 78.1125];

  useEffect(() => {
    // Set default icon for all markers
    // @ts-expect-error - Leaflet internal API
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  // Force map refresh after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`location-picker relative h-full w-full ${className}`} style={{ minHeight: '300px' }}>
      {/* Full screen map */}
      <div className="absolute inset-0">
        <MapContainer
          center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : defaultCenter}
          zoom={selectedLocation ? 15 : 10}
          style={{ height: '100%', width: '100%', minHeight: '300px' }}
          ref={mapRef}
          scrollWheelZoom={true}
          touchZoom={true}
          doubleClickZoom={true}
          dragging={true}
          tap={true}
          tapTolerance={15}
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler />
          
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
              <Popup>
                <div className="text-sm">
                  <strong>Selected Location</strong><br />
                  Lat: {selectedLocation.lat.toFixed(6)}<br />
                  Lng: {selectedLocation.lng.toFixed(6)}
                  {selectedLocation.address && (
                    <>
                      <br />
                      Address: {selectedLocation.address}
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default LocationPicker;
