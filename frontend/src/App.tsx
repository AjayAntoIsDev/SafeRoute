import React from 'react';
import { LocationProvider, useLocation } from './contexts/LocationContext';
import LocationPicker from './components/LocationPicker';
import './App.css';

function AppContent() {
  const { selectedLocation, setSelectedLocation } = useLocation();

  const handleClearLocation = () => {
    setSelectedLocation(null);
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
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />{" "}
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
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />{" "}
              </svg>
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </div>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 min-h-0">
        <LocationPicker />

        {/* Overlay UI elements */}
        <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none">
          <div className="flex flex-col gap-4 pointer-events-auto">
            {/* Instructions and clear button */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="bg-base-100/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-base-content shadow-lg">
                <span className="hidden sm:inline">Click anywhere on the map to select a location</span>
                <span className="sm:hidden">Tap anywhere on the map to select a location</span>
              </div>
              {selectedLocation && (
                <button 
                  className="btn btn-sm btn-secondary shadow-lg"
                  onClick={handleClearLocation}
                >
                  Clear Location
                </button>
              )}
            </div>

            {/* Selected location info */}
            {selectedLocation && (
              <div className="bg-info/90 backdrop-blur-sm text-info-content rounded-lg p-4 shadow-lg">
                <h3 className="font-bold mb-2">Selected Location:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <p>Latitude: {selectedLocation.lat.toFixed(6)}</p>
                  <p>Longitude: {selectedLocation.lng.toFixed(6)}</p>
                </div>
                {selectedLocation.address && (
                  <p className="mt-2 text-sm">Address: {selectedLocation.address}</p>
                )}
              </div>
            )}
          </div>
        </div>
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
