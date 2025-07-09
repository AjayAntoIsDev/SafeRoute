import React from 'react';

interface DisasterInfo {
  probability: number;
  risk_level: string;
  recommendations: string[];
  analysis: string;
}

interface DisasterData {
  geographic_data: {
    elevation?: number;
    terrain?: string;
    land_cover?: string;
    [key: string]: string | number | boolean | null | undefined;
  };
  analysis: {
    risk_level?: string;
    risk_score?: number;
    primary_risks?: string[];
    recommendations?: string[];
    summary?: string;
    floods?: DisasterInfo;
    cyclone?: DisasterInfo;
    earthquakes?: DisasterInfo;
    droughts?: DisasterInfo;
    landslides?: DisasterInfo;
    conclusion?: {
      risk_level?: string;
      primary_threats?: string[];
      recommendations?: string[];
      analysis?: string;
    };
    [key: string]: string | number | boolean | string[] | DisasterInfo | null | undefined;
  };
  location_info: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    [key: string]: string | number | boolean | null | undefined;
  };
}

interface DisasterResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DisasterData | null;
  isLoading: boolean;
  onDisasterSelected?: (disasterType: string) => void;
  onShowDisasterDetail?: (disaster: DisasterInfo, disasterType: string) => void;
}

const DisasterResultModal: React.FC<DisasterResultModalProps> = ({ 
  isOpen, 
  onClose, 
  data, 
  isLoading,
  onShowDisasterDetail
}) => {
  if (!isOpen) return null;

  const getRiskLevelBadge = (riskLevel?: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low':
        return 'badge-success';
      case 'medium':
        return 'badge-warning';
      case 'high':
        return 'badge-error';
      default:
        return 'badge-info';
    }
  };

  const getProgressBarColor = (probability: number) => {
    if (probability < 30) return 'progress-success';
    if (probability < 70) return 'progress-warning';
    return 'progress-error';
  };

  const getDisasterCardColor = (disasterType: string) => {
    switch (disasterType.toLowerCase()) {
      case 'floods':
        return 'bg-blue-100';
      case 'cyclone':
        return 'bg-gray-200';
      case 'earthquakes':
        return 'bg-orange-100';
      case 'droughts':
        return 'bg-yellow-100';
      case 'landslides':
        return 'bg-stone-200';
      default:
        return 'bg-base-100';
    }
  };

  const getDisasterIcon = (disasterType: string) => {
    switch (disasterType.toLowerCase()) {
      case 'floods':
        return '🌊';
      case 'cyclone':
        return '🌪️';
      case 'earthquakes':
        return '🌍';
      case 'droughts':
        return '🌵';
      case 'landslides':
        return '⛰️';
      default:
        return '⚠️';
    }
  };

  const handleDisasterClick = (disasterData: DisasterInfo, disasterType: string) => {
    if (onShowDisasterDetail) {
      onShowDisasterDetail(disasterData, disasterType);
    }
  };

  const disasters = [
    { key: 'floods', name: 'Floods' },
    { key: 'cyclone', name: 'Cyclone' },
    { key: 'earthquakes', name: 'Earthquakes' },
    { key: 'droughts', name: 'Droughts' },
    { key: 'landslides', name: 'Landslides' }
  ];

  return (
      <div className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
              {isLoading ? (
                  <div className="flex flex-col items-center gap-4 py-8">
                      <span className="loading loading-spinner loading-lg text-primary"></span>
                      <p>Analyzing disaster risks for your location...</p>
                      <p className="text-sm text-gray-500">
                          This may take a few moments...
                      </p>
                  </div>
              ) : data ? (
                  <div className="space-y-6">
                      <div className="text-center flex justify-between">
                          {data.location_info.city && (
                              <p className="text-2xl font-bold">
                                  {data.location_info.city}
                              </p>
                          )}
                          {data.location_info.state && (
                              <p className="text-2xl font-bold text-accent">
                                  {data.location_info.state}
                              </p>
                          )}
                      </div>

                      {/* Disaster Risk Cards */}
                      {data.analysis && (
                          <div className="card">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {disasters.map(({ key, name }) => {
                                          const disasterData = data.analysis[
                                              key
                                          ] as DisasterInfo;
                                          console.log(
                                              `Disaster Data for ${key}:`,
                                              disasterData
                                          );
                                          if (!disasterData) {
                                              return null;
                                          }

                                          return (
                                              <div
                                                  key={key}
                                                  className={`card ${getDisasterCardColor(key)} shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
                                                  onClick={() => handleDisasterClick(disasterData, key)}>
                                                  <div className="card-body p-4">
                                                      <div className="flex items-center gap-3 mb-3">
                                                          <span className="text-2xl">
                                                              {getDisasterIcon(
                                                                  key
                                                              )}
                                                          </span>
                                                          <h5 className="card-title text-base">
                                                              {name}
                                                          </h5>
                                                      </div>

                                                      <div className="space-y-2">
                                                          <div className="flex justify-between text-sm">
                                                              <span>
                                                                  Probability
                                                              </span>
                                                              <span className="font-semibold">
                                                                  {(
                                                                      disasterData.probability *
                                                                      100
                                                                  ).toFixed(1)}
                                                                  %
                                                              </span>
                                                          </div>

                                                          <progress
                                                              className={`progress w-full ${getProgressBarColor(
                                                                  disasterData.probability *
                                                                      100
                                                              )}`}
                                                              value={
                                                                  disasterData.probability *
                                                                  100
                                                              }
                                                              max="100"></progress>

                                                          <div className="flex justify-between items-center">
                                                              <span className="text-xs text-gray-500">
                                                                  Risk Level
                                                              </span>
                                                              <div
                                                                  className={`badge badge-xs ${getRiskLevelBadge(
                                                                      disasterData.risk_level
                                                                  )}`}>
                                                                  {
                                                                      disasterData.risk_level
                                                                  }
                                                              </div>
                                                          </div>

                                                          {disasterData.recommendations &&
                                                              disasterData
                                                                  .recommendations
                                                                  .length >
                                                                  0 && (
                                                                  <div className="mt-2">
                                                                      <p className="text-xs text-gray-600">
                                                                          {
                                                                              disasterData
                                                                                  .analysis
                                                                          }
                                                                      </p>
                                                                  </div>
                                                              )}
                                                          
                                                          <div className="mt-3 pt-2 border-t border-gray-200">
                                                              <p className="text-xs text-center text-gray-500">
                                                                  Click for details
                                                              </p>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>
                                          );
                                      })}
                                  </div>
                          </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-2 pt-4">
                          <button className="btn btn-outline" onClick={onClose}>
                              Close
                          </button>
                          <button
                              className="btn btn-primary"
                              onClick={() => {
                                  // Future: Add route planning functionality
                                  console.log(
                                      "Plan route functionality coming soon..."
                                  );
                              }}>
                              Plan Safe Route
                          </button>
                      </div>
                  </div>
              ) : (
                  <div className="text-center py-8">
                      <p>No data available</p>
                  </div>
              )}
          </div>

          {/* Backdrop */}
          {!isLoading && (
              <div className="modal-backdrop" onClick={onClose}></div>
          )}
      </div>
  );
};

export default DisasterResultModal;
