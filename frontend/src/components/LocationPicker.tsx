import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import L from 'leaflet';
import { useLocation } from '../contexts/LocationContext';
import polyline from '@mapbox/polyline';
import IntelligentFacilityService from '../services/intelligentFacilityService';
import FacilityRecommendation from '../services/intelligentFacilityService';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
  className?: string;
  emergencyBuildings: EmergencyBuilding[];
  selectedDisasterType?: string | null;
  disasterInfo?: Record<string, unknown>;
  isLocationLocked?: boolean;
  facilityRecommendation?: FacilityRecommendation | null;
  onFacilityRecommendationChange?: (recommendation: FacilityRecommendation | null) => void;
}

interface RouteCoordinate {
  lat: number;
  lng: number;
}

const markerIcon = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+PHN2ZyBoZWlnaHQ9IjI0IiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAtMTAyOC40KSI+PHBhdGggZD0ibTEyLjAzMSAxMDMwLjRjLTMuODY1NyAwLTYuOTk5OCAzLjEtNi45OTk4IDcgMCAxLjMgMC40MDE3IDIuNiAxLjA5MzggMy43IDAuMDMzNCAwLjEgMC4wNTkgMC4xIDAuMDkzOCAwLjJsNC4zNDMyIDhjMC4yMDQgMC42IDAuNzgyIDEuMSAxLjQzOCAxLjFzMS4yMDItMC41IDEuNDA2LTEuMWw0Ljg0NC04LjdjMC40OTktMSAwLjc4MS0yLjEgMC43ODEtMy4yIDAtMy45LTMuMTM0LTctNy03em0tMC4wMzEgMy45YzEuOTMzIDAgMy41IDEuNiAzLjUgMy41IDAgMi0xLjU2NyAzLjUtMy41IDMuNXMtMy41LTEuNS0zLjUtMy41YzAtMS45IDEuNTY3LTMuNSAzLjUtMy41eiIgZmlsbD0iI2MwMzkyYiIvPjxwYXRoIGQ9Im0xMi4wMzEgMS4wMzEyYy0zLjg2NTcgMC02Ljk5OTggMy4xMzQtNi45OTk4IDcgMCAxLjM4MyAwLjQwMTcgMi42NjQ4IDEuMDkzOCAzLjc0OTggMC4wMzM0IDAuMDUzIDAuMDU5IDAuMTA1IDAuMDkzOCAwLjE1N2w0LjM0MzIgOC4wNjJjMC4yMDQgMC41ODYgMC43ODIgMS4wMzEgMS40MzggMS4wMzFzMS4yMDItMC40NDUgMS40MDYtMS4wMzFsNC44NDQtOC43NWMwLjQ5OS0wLjk2MyAwLjc4MS0yLjA2IDAuNzgxLTMuMjE4OCAwLTMuODY2LTMuMTM0LTctNy03em0tMC4wMzEgMy45Njg4YzEuOTMzIDAgMy41IDEuNTY3IDMuNSAzLjVzLTEuNTY3IDMuNS0zLjUgMy41LTMuNS0xLjU2Ny0zLjUtMy41IDEuNTY3LTMuNSAzLjUtMy41eiIgZmlsbD0iI2U3NGMzYyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxMDI4LjQpIi8+PC9nPjwvc3ZnPg==`;

const DefaultIcon = new Icon({
  iconUrl: markerIcon,
  iconSize: [36, 36],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

// Emergency building icons
const createEmergencyIcon = (type: string, isClosest: boolean = false) => {
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
  const size = isClosest ? 32 : 24;
  const strokeWidth = isClosest ? 3 : 2;
  const innerRadius = isClosest ? 6 : 4;
  
  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" stroke="#ffffff" stroke-width="${strokeWidth}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${innerRadius}" fill="#ffffff"/>
      ${isClosest ? `<circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="4,2"/>` : ''}
    </svg>
  `;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgIcon)}`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2],
  });
};

const MapClickHandler: React.FC<{ isLocationLocked?: boolean }> = ({ isLocationLocked = false }) => {
  const { setSelectedLocation } = useLocation();
  
  useMapEvents({
    click: (e) => {
      // Don't allow location changes if locked
      if (isLocationLocked) {
        return;
      }
      
      const { lat, lng } = e.latlng;
      setSelectedLocation({ lat, lng });
    },
  });
  
  return null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  className = '',
  emergencyBuildings = [],
  selectedDisasterType,
  disasterInfo,
  isLocationLocked = false,
  facilityRecommendation = null,
  onFacilityRecommendationChange
}) => {
  const { selectedLocation, setSelectedLocation } = useLocation();
  const mapRef = useRef<L.Map | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<RouteCoordinate[]>([]);
  const [closestBuilding, setClosestBuilding] = useState<EmergencyBuilding | null>(null);
  const [intelligentFacilityService] = useState(() => new IntelligentFacilityService());
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  const defaultCenter: [number, number] = [9.9177, 78.1125];

  // Function to get user's current GPS location
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    setGpsError(null);

    try {
      // Check if we're running in a Capacitor environment
      if (Capacitor.isNativePlatform()) {
        console.log('Using Capacitor Geolocation for native platform');
        
        // Request permissions first
        const permissions = await Geolocation.requestPermissions();
        if (permissions.location !== 'granted') {
          setGpsError('Location permission denied');
          setIsGettingLocation(false);
          return;
        }

        // Get current position using Capacitor plugin
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000
        });

        const { latitude, longitude } = position.coords;
        console.log('GPS location obtained (Capacitor):', latitude, longitude);
        
        // Set the location in the context
        setSelectedLocation({
          lat: latitude,
          lng: longitude,
          address: `GPS Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        });

        // Center the map on the new location
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 15);
        }

        setIsGettingLocation(false);
        setGpsSuccess(true);
        
        // Clear success message after 3 seconds
        setTimeout(() => setGpsSuccess(false), 3000);
      } else {
        // Fall back to web geolocation for browser environments
        console.log('Using web geolocation for browser');
        
        if (!navigator.geolocation) {
          setGpsError('Geolocation is not supported by this browser');
          setIsGettingLocation(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log('GPS location obtained (Web):', latitude, longitude);
            
            // Set the location in the context
            setSelectedLocation({
              lat: latitude,
              lng: longitude,
              address: `GPS Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            });

            // Center the map on the new location
            if (mapRef.current) {
              mapRef.current.setView([latitude, longitude], 15);
            }

            setIsGettingLocation(false);
            setGpsSuccess(true);
            
            // Clear success message after 3 seconds
            setTimeout(() => setGpsSuccess(false), 3000);
          },
          (error) => {
            console.error('GPS error:', error);
            let errorMessage = 'Unable to get your location';
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied by user';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information unavailable';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out';
                break;
            }
            
            setGpsError(errorMessage);
            setIsGettingLocation(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      setGpsError('Failed to get location. Please try again.');
      setIsGettingLocation(false);
    }
  };

  // OpenRouteService API key (you'll need to get this from https://openrouteservice.org/)
  const ORS_API_KEY =
      "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImEwZTY1ZWJjNWY3OTQ2ZDRhYjJhNmZjM2Q4ZWNkOTc5IiwiaCI6Im11cm11cjY0In0=";

  // Function to fetch route from OpenRouteService
  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    console.log('Fetching route from:', start, 'to:', end);
    try {
      const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
        method: 'POST',
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: [[start[1], start[0]], [end[1], end[0]]], // Note: ORS uses [lng, lat]
          format: 'json', // Use JSON format to get encoded polyline geometry
        }),
      });

      if (!response.ok) {
        console.error('ORS API error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('ORS Response:', data);
      
      // OpenRouteService returns routes array with encoded polyline geometry
      if (data.routes && data.routes[0] && data.routes[0].geometry) {
        let routeCoords: RouteCoordinate[] = [];
        
        // Check if geometry is a string (encoded polyline) or coordinates array
        if (typeof data.routes[0].geometry === 'string') {
          console.log('Decoding polyline geometry:', data.routes[0].geometry);
          // Decode the polyline string
          const decoded = polyline.decode(data.routes[0].geometry);
          routeCoords = decoded.map((coord: [number, number]) => ({
            lat: coord[0],
            lng: coord[1]
          }));
          console.log('Decoded route coordinates:', routeCoords.length, 'points');
        } else if (data.routes[0].geometry.coordinates) {
          // Handle coordinate array format (fallback)
          const coordinates = data.routes[0].geometry.coordinates;
          console.log('Raw coordinates:', coordinates.length, 'points');
          routeCoords = coordinates.map((coord: [number, number]) => ({
            lat: coord[1],
            lng: coord[0]
          }));
          console.log('Converted route coordinates:', routeCoords.length, 'points');
        }
        
        setRouteCoordinates(routeCoords);
      } else {
        console.warn('No route geometry found in response');
        setRouteCoordinates([]);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      setRouteCoordinates([]);
    }
  };

  // Find best emergency building using AI and fetch route
  useEffect(() => {
    console.log('useEffect triggered - selectedLocation:', selectedLocation, 'buildings:', emergencyBuildings.length);
    if (selectedLocation && emergencyBuildings.length > 0) {
      
      const selectBestFacility = async () => {
        let selectedBuilding: EmergencyBuilding;
        
        // Use AI to select best facility if disaster info is available
        console.log('Selected disaster type:', selectedDisasterType);
        console.log('Disaster info:', disasterInfo);
        if (selectedDisasterType && disasterInfo) {
          console.log('Using AI to select best facility for disaster:', selectedDisasterType);
          try {
            const recommendation = await intelligentFacilityService.selectBestFacility(
              selectedDisasterType,
              disasterInfo,
              emergencyBuildings
            );
            
            if (recommendation) {
              onFacilityRecommendationChange?.(recommendation);
              const recommendedBuilding = emergencyBuildings.find(b => b.id === recommendation.buildingId);
              if (recommendedBuilding) {
                selectedBuilding = recommendedBuilding;
                console.log('AI selected facility:', recommendedBuilding.name, 'Score:', recommendation.score);
                console.log('AI reasoning:', recommendation.reasoning);
              } else {
                // Fallback to closest if AI selection fails
                selectedBuilding = emergencyBuildings.reduce((prev, current) => 
                  (prev.distance || Infinity) < (current.distance || Infinity) ? prev : current
                );
              }
            } else {
              // Fallback to closest if AI fails
              selectedBuilding = emergencyBuildings.reduce((prev, current) => 
                (prev.distance || Infinity) < (current.distance || Infinity) ? prev : current
              );
            }
          } catch (error) {
            console.error('Error in AI facility selection:', error);
            // Fallback to closest
            selectedBuilding = emergencyBuildings.reduce((prev, current) => 
              (prev.distance || Infinity) < (current.distance || Infinity) ? prev : current
            );
          }
        } else {
          // Fallback to closest building if no disaster info
          selectedBuilding = emergencyBuildings.reduce((prev, current) => 
            (prev.distance || Infinity) < (current.distance || Infinity) ? prev : current
          );
          console.log('No disaster info available, using closest building:', selectedBuilding.name);
        }
        
        console.log('Selected building:', selectedBuilding.name, 'at', selectedBuilding.latitude, selectedBuilding.longitude);
        setClosestBuilding(selectedBuilding);
        
        // Fetch route to selected building
        fetchRoute(
          [selectedLocation.lat, selectedLocation.lng],
          [selectedBuilding.latitude, selectedBuilding.longitude]
        );
      };
      
      selectBestFacility();
    } else {
      console.log('Clearing route - no location or buildings');
      setRouteCoordinates([]);
      setClosestBuilding(null);
      onFacilityRecommendationChange?.(null);
    }
  }, [selectedLocation, emergencyBuildings, selectedDisasterType, disasterInfo, intelligentFacilityService, onFacilityRecommendationChange]);

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
      {isLocationLocked && (
        <div className="absolute top-4 left-4 z-[500] pointer-events-none">
          <div className="bg-white/90 rounded-lg p-3 shadow-lg">
            <p className="text-sm font-medium text-gray-700">🔒 Location Locked</p>
            <p className="text-xs text-gray-500">You can still explore the map</p>
          </div>
        </div>
      )}
      
      {/* GPS Location Button */}
      <div className="absolute bottom-24 right-4 z-[500]">
        <button
          onClick={getCurrentLocation}
          disabled={isGettingLocation || isLocationLocked}
          className={`btn btn-circle shadow-lg transition-all duration-200 ${
            isGettingLocation 
              ? 'btn-disabled' 
              : isLocationLocked 
                ? 'btn-neutral' 
                : 'btn-primary hover:btn-primary-focus'
          }`}
          title={isLocationLocked ? "Location is locked" : "Get my current location"}
        >
          {isGettingLocation ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </button>
        
        {/* GPS Error Toast */}
        {gpsError && (
          <div className="alert alert-error mt-2 text-xs max-w-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{gpsError}</span>
            <button
              onClick={() => setGpsError(null)}
              className="btn btn-xs btn-ghost"
            >
              ×
            </button>
          </div>
        )}
        
        {/* GPS Success Toast */}
        {gpsSuccess && (
          <div className="alert alert-success mt-2 text-xs max-w-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Location found!</span>
          </div>
        )}
      </div>
      
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
          
          <MapClickHandler isLocationLocked={isLocationLocked} />
          
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
          
          {/* Route to closest emergency building */}
          {routeCoordinates.length > 0 && (
            <>
              {console.log('Rendering route with', routeCoordinates.length, 'coordinates')}
              <Polyline 
                positions={routeCoordinates.map(coord => [coord.lat, coord.lng])}
                color="#dc2626"
                weight={4}
                opacity={0.8}
              />
            </>
          )}
          
          {/* Emergency buildings markers */}
          {emergencyBuildings.map((building) => {
            const isClosest = closestBuilding && building.id === closestBuilding.id;
            const isAIRecommended = facilityRecommendation && building.id === facilityRecommendation.buildingId;
            return (
              <Marker 
                key={building.id} 
                position={[building.latitude, building.longitude]}
                icon={createEmergencyIcon(building.type, isClosest)}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{building.name}</strong>
                    {isClosest && (
                      <span className="ml-2 badge badge-error badge-xs">
                        {isAIRecommended ? 'AI RECOMMENDED' : 'CLOSEST'}
                      </span>
                    )}
                    <br />
                    <span className="capitalize">{building.type.replace('_', ' ')}</span><br />
                    {building.distance && (
                      <>Distance: {(building.distance / 1000).toFixed(1)} km<br /></>
                    )}
                    {isAIRecommended && facilityRecommendation && (
                      <>
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                          <strong>AI Score: {facilityRecommendation.score}/100</strong><br />
                          <strong>Priority: {facilityRecommendation.priority.toUpperCase()}</strong><br />
                          {facilityRecommendation.reasoning}
                        </div>
                      </>
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
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default LocationPicker;
