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

    const handleDisasterSelection = (disasterType: string) => {
        setSelectedDisasterType(disasterType);
        console.log(`Selected disaster type: ${disasterType} for map display`);
        // Here you can add logic to show the selected disaster on the map
        // For example, you could highlight specific areas, show risk zones, etc.
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

    const handleSelectForMap = () => {
        if (selectedDisaster) {
            handleDisasterSelection(selectedDisaster.type);
        }
        setShowDetailView(false);
        setSelectedDisaster(null);
        // Modal stays closed, user sees the map with selected disaster
    };


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
                <LocationPicker />
                <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none">
                    <div className="flex flex-col gap-4 pointer-events-auto ">
                        <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 transition-all duration-1000 ease-in-out ${
                          selectedLocation 
                            ? 'opacity-0 -translate-y-4 pointer-events-none' 
                            : 'opacity-100 translate-y-0'
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
                          <div className="bg-warning/90 backdrop-blur-sm text-warning-content rounded-lg p-4 shadow-lg mb-4">
                              <h3 className="font-bold mb-2 flex items-center gap-2">
                                  <span className="text-lg">
                                      {selectedDisasterType === 'floods' && '🌊'}
                                      {selectedDisasterType === 'cyclone' && '🌪️'}
                                      {selectedDisasterType === 'earthquakes' && '🌍'}
                                      {selectedDisasterType === 'droughts' && '🌵'}
                                      {selectedDisasterType === 'landslides' && '⛰️'}
                                  </span>
                                  Selected Disaster: {selectedDisasterType.charAt(0).toUpperCase() + selectedDisasterType.slice(1)}
                              </h3>
                              <p className="text-sm">
                                  Risk analysis is shown for this disaster type. 
                                  {selectedLocation && " Check the map overlay for affected areas."}
                              </p>
                              <button 
                                  className="btn btn-sm btn-ghost mt-2"
                                  onClick={() => setSelectedDisasterType(null)}
                              >
                                  Clear Selection
                              </button>
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
                      const response = await fetch('http://localhost:8000/predict-disaster', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        latitude: selectedLocation.lat,
                        longitude: selectedLocation.lng
                      })
                      });
                      const data = await response.json();
                      setDisasterData(data);
                      console.log(data);
                    } catch (error) {
                      console.error('Error:', error);
                    } finally {
                      setIsLoading(false);
                    }
                    }}
                  >
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
                    disaster={selectedDisaster.data}
                    disasterType={selectedDisaster.type}
                    onClose={handleCloseDetailView}
                    onSelectForMap={handleSelectForMap}
                />
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
