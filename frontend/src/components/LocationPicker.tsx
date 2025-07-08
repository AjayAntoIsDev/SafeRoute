import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import L from 'leaflet';
import { useLocation } from '../contexts/LocationContext';
import 'leaflet/dist/leaflet.css';

const markerIcon = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJjdXJyZW50Q29sb3IiPPHBhdGggZD0iTTIwIDEwYzAgNC45OTMtNS41MzkgMTAuMTkzLTcuMzk5IDExLjc5OWExIDEgMCAwIDEtMS4yMDIgMEM5LjUzOSAyMC4xOTMgNCAxNC45OTMgNCAxMGE4IDggMCAwIDEgMTYgMCIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiLz48L3N2Zz4=`;

const DefaultIcon = new Icon({
  iconUrl: markerIcon,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
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
    // @ts-expect-error - Leaflet internal API
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

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
          zoomControl={false}
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
