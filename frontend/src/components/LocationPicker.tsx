import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import L from 'leaflet';
import { useLocation } from '../contexts/LocationContext';
import 'leaflet/dist/leaflet.css';

interface EmergencyBuilding {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  distance?: number;
}

const markerIcon = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+PHN2ZyBoZWlnaHQ9IjI0IiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAtMTAyOC40KSI+PHBhdGggZD0ibTEyLjAzMSAxMDMwLjRjLTMuODY1NyAwLTYuOTk5OCAzLjEtNi45OTk4IDcgMCAxLjMgMC40MDE3IDIuNiAxLjA5MzggMy43IDAuMDMzNCAwLjEgMC4wNTkgMC4xIDAuMDkzOCAwLjJsNC4zNDMyIDhjMC4yMDQgMC42IDAuNzgyIDEuMSAxLjQzOCAxLjFzMS4yMDItMC41IDEuNDA2LTEuMWw0Ljg0NC04LjdjMC40OTktMSAwLjc4MS0yLjEgMC43ODEtMy4yIDAtMy45LTMuMTM0LTctNy03em0tMC4wMzEgMy45YzEuOTMzIDAgMy41IDEuNiAzLjUgMy41IDAgMi0xLjU2NyAzLjUtMy41IDMuNXMtMy41LTEuNS0zLjUtMy41YzAtMS45IDEuNTY3LTMuNSAzLjUtMy41eiIgZmlsbD0iI2MwMzkyYiIvPjxwYXRoIGQ9Im0xMi4wMzEgMS4wMzEyYy0zLjg2NTcgMC02Ljk5OTggMy4xMzQtNi45OTk4IDcgMCAxLjM4MyAwLjQwMTcgMi42NjQ4IDEuMDkzOCAzLjc0OTggMC4wMzM0IDAuMDUzIDAuMDU5IDAuMTA1IDAuMDkzOCAwLjE1N2w0LjM0MzIgOC4wNjJjMC4yMDQgMC41ODYgMC43ODIgMS4wMzEgMS40MzggMS4wMzFzMS4yMDItMC40NDUgMS40MDYtMS4wMzFsNC44NDQtOC43NWMwLjQ5OS0wLjk2MyAwLjc4MS0yLjA2IDAuNzgxLTMuMjE4OCAwLTMuODY2LTMuMTM0LTctNy03em0tMC4wMzEgMy45Njg4YzEuOTMzIDAgMy41IDEuNTY3IDMuNSAzLjVzLTEuNTY3IDMuNS0zLjUgMy41LTMuNS0xLjU2Ny0zLjUtMy41IDEuNTY3LTMuNSAzLjUtMy41eiIgZmlsbD0iI2U3NGMzYyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxMDI4LjQpIi8+PC9nPjwvc3ZnPg==`;

const DefaultIcon = new Icon({
  iconUrl: markerIcon,
  iconSize: [36, 36],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

// Emergency building icons
const createEmergencyIcon = (type: string) => {
  const colorMap: Record<string, string> = {
    hospital: '#dc2626', // red
    clinic: '#059669', // green
    pharmacy: '#2563eb', // blue
    fire_station: '#ea580c', // orange
    police_station: '#1d4ed8', // blue
    emergency_shelter: '#6b7280', // gray
    default: '#6b7280' // gray
  };
  
  const color = colorMap[type] || colorMap.default;
  
  const svgIcon = `
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="#ffffff"/>
    </svg>
  `;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgIcon)}`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

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
  emergencyBuildings?: EmergencyBuilding[];
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  className = '',
  emergencyBuildings = []
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
          
          {/* Emergency buildings markers */}
          {emergencyBuildings.map((building) => (
            <Marker 
              key={building.id} 
              position={[building.latitude, building.longitude]}
              icon={createEmergencyIcon(building.type)}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{building.name}</strong><br />
                  <span className="capitalize">{building.type.replace('_', ' ')}</span><br />
                  {building.distance && (
                    <>Distance: {(building.distance / 1000).toFixed(1)} km<br /></>
                  )}
                  {building.address && (
                    <>Address: {building.address}<br /></>
                  )}
                  {building.phone && (
                    <>Phone: {building.phone}<br /></>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default LocationPicker;
