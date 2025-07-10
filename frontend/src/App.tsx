import React, { useState } from "react";
import { LocationProvider, useLocation } from "./contexts/LocationContext";
import LocationPicker from "./components/LocationPicker";
import DisasterResultModal from "./components/DisasterResultModal";
import DisasterDetailView from "./components/DisasterDetailView";
import "./App.css";

interface DisasterInfo {
  probability: number;
  risk_level: string;
  recommendations: string[];
  analysis: string;
}

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

interface OSMElement {
  type: string;
  id?: number;
  lat?: number;
  lon?: number;
  bounds?: {
    minlat: number;
    maxlat: number;
    minlon: number;
    maxlon: number;
  };
  tags?: {
    amenity?: string;
    name?: string;
    phone?: string;
    'addr:full'?: string;
    'addr:street'?: string;
    [key: string]: string | undefined;
  };
}

interface OSMResponse {
  data?: {
    elements?: OSMElement[];
  };
}

function AppContent() {
    const { selectedLocation } = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [disasterData, setDisasterData] = useState(null);
    const [selectedDisasterType, setSelectedDisasterType] = useState<string | null>(null);
    const [showDetailView, setShowDetailView] = useState(false);
    const [selectedDisaster, setSelectedDisaster] = useState<{
        data: DisasterInfo;
        type: string;
    } | null>(null);
    const [emergencyBuildings, setEmergencyBuildings] = useState<EmergencyBuilding[]>([]);
    const [isLoadingBuildings, setIsLoadingBuildings] = useState(false);
    const [isLoadingMapSelection, setIsLoadingMapSelection] = useState(false);

    const fetchEmergencyBuildings = async (lat: number, lng: number) => {
        setIsLoadingBuildings(true);
        try {
            const response = await fetch('http://localhost:8000/buildings-emergency?radius=1500', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    latitude: lat,
                    longitude: lng
                })
            });
            const osmData: OSMResponse = await response.json();
            
            // Process OSM data into EmergencyBuilding format
            const buildings: EmergencyBuilding[] = [];
            
            if (osmData.data && osmData.data.elements) {
                osmData.data.elements.forEach((element: OSMElement, index: number) => {
                    if (element.tags && element.tags.amenity) {
                        const amenity = element.tags.amenity;
                        
                        // Only include medical/emergency facilities
                        if (['hospital', 'clinic', 'doctors', 'pharmacy', 'emergency'].includes(amenity)) {
                            const building: EmergencyBuilding = {
                                id: `${element.type}_${element.id || index}`,
                                name: element.tags.name || `${amenity.charAt(0).toUpperCase() + amenity.slice(1)}`,
                                type: amenity === 'doctors' ? 'clinic' : amenity,
                                latitude: element.lat || (element.bounds ? (element.bounds.minlat + element.bounds.maxlat) / 2 : lat),
                                longitude: element.lon || (element.bounds ? (element.bounds.minlon + element.bounds.maxlon) / 2 : lng),
                                address: element.tags['addr:full'] || element.tags['addr:street'] || undefined,
                                phone: element.tags.phone || undefined
                            };
                            
                            // Calculate distance from selected location
                            const distance = calculateDistance(
                                lat, lng,
                                building.latitude, building.longitude
                            );
                            building.distance = distance;
                            
                            buildings.push(building);
                        }
                    }
                });
            }
            
            // Sort by distance and limit to closest 20
            buildings.sort((a, b) => (a.distance || 0) - (b.distance || 0));
            const limitedBuildings = buildings.slice(0, 20);
            
            setEmergencyBuildings(limitedBuildings);
            console.log('Processed emergency buildings:', limitedBuildings);
        } catch (error) {
            console.error('Error fetching emergency buildings:', error);
            setEmergencyBuildings([]);
        } finally {
            setIsLoadingBuildings(false);
        }
    };

    // Helper function to calculate distance between two coordinates
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371000; // Earth's radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const handleDisasterSelection = async (disasterType: string) => {
        setSelectedDisasterType(disasterType);
        console.log(`Selected disaster type: ${disasterType} for map display`);
        
        // Fetch emergency buildings when a disaster type is selected
        if (selectedLocation) {
            await fetchEmergencyBuildings(selectedLocation.lat, selectedLocation.lng);
        }
    };

    const handleShowDisasterDetail = (disaster: DisasterInfo, disasterType: string) => {
        setSelectedDisaster({ data: disaster, type: disasterType });
        setShowModal(false); // Close the modal
        setShowDetailView(true); // Show the detail view
    };

    const handleCloseDetailView = () => {
        setShowDetailView(false);
        setSelectedDisaster(null);
        setShowModal(true); // Go back to the modal
    };

    const handleSelectForMap = async () => {
        if (selectedDisaster) {
            setIsLoadingMapSelection(true);
            try {
                await handleDisasterSelection(selectedDisaster.type);
            } finally {
                setIsLoadingMapSelection(false);
            }
        }
        setShowDetailView(false);
        setSelectedDisaster(null);
        // Modal stays closed, user sees the map with selected disaster
    };
    console.log("Selected Location:", disasterData);


    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col">
            <div className="navbar bg-base-100 shadow-sm">
                <div className="navbar-start">
                    <div className="dropdown hidden">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-ghost btn-circle">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h7"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="navbar-center">
                    <span className="font-semibold text-xl pr-0">Safe</span>
                    <span className="font-semibold text-xl text-accent pl-0">
                        Route
                    </span>
                </div>
                <div className="navbar-end">
                    <button className="btn btn-ghost btn-circle">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </button>
                    <button className="btn btn-ghost btn-circle">
                        <div className="indicator">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                            <span className="badge badge-xs badge-primary indicator-item"></span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="relative flex-1 min-h-0">
                <LocationPicker
                    emergencyBuildings={emergencyBuildings}
                    selectedDisasterType={selectedDisasterType}
                    disasterInfo={disasterData || undefined}
                />
                <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none">
                    <div className="flex flex-col gap-4 pointer-events-auto ">
                        <div
                            className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 transition-all duration-1000 ease-in-out ${
                                selectedLocation
                                    ? "opacity-0 -translate-y-4 pointer-events-none"
                                    : "opacity-100 translate-y-0"
                            }`}>
                            <div role="alert" className="alert alert-info">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    className="h-6 w-6 shrink-0 stroke-current">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span>
                                    Tap anywhere to select your location
                                </span>
                            </div>
                        </div>

                        {/* Selected location info 
                      {selectedLocation && (
                          <div className="bg-info/90 backdrop-blur-sm text-info-content rounded-lg p-4 shadow-lg">
                              <h3 className="font-bold mb-2">
                                  Selected Location:
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                  <p>
                                      Latitude:
                                      {selectedLocation.lat.toFixed(6)}
                                  </p>
                                  <p>
                                      Longitude:{" "}
                                      {selectedLocation.lng.toFixed(6)}
                                  </p>
                              </div>
                              {selectedLocation.address && (
                                  <p className="mt-2 text-sm">
                                      Address: {selectedLocation.address}
                                  </p>
                              )}
                          </div>
                      )}*/}

                        {/* Selected disaster type indicator */}
                        {selectedDisasterType && (
                            <div
                                className={`absolute rounded-lg p-4 mb-4 badge ${
                                    disasterData &&
                                    disasterData.analysis[selectedDisasterType]
                                        ?.probability >= 0.7
                                        ? "badge-error"
                                        : disasterData &&
                                          disasterData.analysis[
                                              selectedDisasterType
                                          ]?.probability >= 0.4
                                        ? "badge-warning"
                                        : "badge-success"
                                }`}>
                                <h3 className="font-bold flex items-center gap-2">
                                    <span className="text-lg">
                                        {selectedDisasterType === "floods" &&
                                            "🌊"}
                                        {selectedDisasterType === "cyclone" &&
                                            "🌪️"}
                                        {selectedDisasterType ===
                                            "earthquakes" && "🌍"}
                                        {selectedDisasterType === "droughts" &&
                                            "🌵"}
                                        {selectedDisasterType ===
                                            "landslides" && "⛰️"}
                                    </span>

                                    {selectedDisasterType
                                        .charAt(0)
                                        .toUpperCase() +
                                        selectedDisasterType.slice(1)}
                                </h3>
                                {/*
                                <button
                                    className="btn btn-sm btn-ghost mt-2"
                                    onClick={() => {
                                        setSelectedDisasterType(null);
                                        setEmergencyBuildings([]);
                                    }}>
                                    Clear Selection
                                </button> */}
                            </div>
                        )}

                        {/* Emergency buildings list */}
                        {selectedDisasterType &&
                            emergencyBuildings.length > 0 && (
                                <div className="bg-success/90 backdrop-blur-sm text-success-content rounded-lg p-4 shadow-lg mb-4 max-h-64 overflow-y-auto">
                                    <h3 className="font-bold mb-2 flex items-center gap-2">
                                        <span className="text-lg">🏥</span>
                                        Emergency Buildings Nearby (
                                        {emergencyBuildings.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {emergencyBuildings.map((building) => (
                                            <div
                                                key={building.id}
                                                className="bg-base-100/20 rounded p-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">
                                                        {building.type ===
                                                            "hospital" && "🏥"}
                                                        {building.type ===
                                                            "clinic" && "🩺"}
                                                        {building.type ===
                                                            "pharmacy" && "�"}
                                                        {building.type ===
                                                            "emergency" && "🚨"}
                                                        {![
                                                            "hospital",
                                                            "clinic",
                                                            "pharmacy",
                                                            "emergency",
                                                        ].includes(
                                                            building.type
                                                        ) && "🏢"}
                                                    </span>
                                                    <span className="font-semibold">
                                                        {building.name}
                                                    </span>
                                                    {building.distance && (
                                                        <span className="text-xs bg-base-100/30 px-2 py-1 rounded">
                                                            {(
                                                                building.distance /
                                                                1000
                                                            ).toFixed(1)}{" "}
                                                            km
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs mt-1 capitalize">
                                                    {building.type.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </p>
                                                {building.address && (
                                                    <p className="text-xs mt-1 opacity-80">
                                                        {building.address}
                                                    </p>
                                                )}
                                                {building.phone && (
                                                    <p className="text-xs mt-1 opacity-80">
                                                        📞 {building.phone}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* Loading indicator for buildings */}
                        {isLoadingBuildings && (
                            <div className="bg-info/90 backdrop-blur-sm text-info-content rounded-lg p-4 shadow-lg mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="loading loading-spinner loading-sm"></span>
                                    <span>Loading emergency buildings...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {selectedLocation && !showModal && (
                    <button
                        className="btn btn-primary mb-4 absolute bottom-4 left-4 right-4 z-[1000]"
                        onClick={async () => {
                            setShowModal(true);
                            setIsLoading(true);
                            setDisasterData(null);

                            try {
                                const response = await fetch(
                                    "http://localhost:8000/predict-disaster",
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            latitude: selectedLocation.lat,
                                            longitude: selectedLocation.lng,
                                        }),
                                    }
                                );
                                const data = await response.json();
                                setDisasterData(data);
                                console.log(data);
                            } catch (error) {
                                console.error("Error:", error);
                            } finally {
                                setIsLoading(false);
                            }
                        }}>
                        Confirm Location
                    </button>
                )}

                <DisasterResultModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    data={disasterData}
                    isLoading={isLoading}
                    onDisasterSelected={handleDisasterSelection}
                    onShowDisasterDetail={handleShowDisasterDetail}
                />

                {/* Full-screen disaster detail view */}
                {showDetailView && selectedDisaster && (
                    <DisasterDetailView
                        allData={disasterData}
                        disaster={selectedDisaster.data}
                        disasterType={selectedDisaster.type}
                        onClose={handleCloseDetailView}
                        onSelectForMap={handleSelectForMap}
                    />
                )}

                {/* Loading overlay for map selection */}
                {isLoadingMapSelection && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000]">
                        <div className="bg-base-100 rounded-lg p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                            <div className="text-center">
                                <h3 className="font-bold text-lg mb-2">Loading Map View</h3>
                                <p className="text-sm opacity-70">
                                    Preparing disaster visualization and finding nearby emergency facilities...
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function App() {
    return (
        <LocationProvider>
            <AppContent />
        </LocationProvider>
    );
}

export default App;
