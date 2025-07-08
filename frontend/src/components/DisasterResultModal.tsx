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
}

const DisasterResultModal: React.FC<DisasterResultModalProps> = ({ 
  isOpen, 
  onClose, 
  data, 
  isLoading 
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
    if (probability < 20) return 'progress-success';
    if (probability < 50) return 'progress-warning';
    return 'progress-error';
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
            <p className="text-sm text-gray-500">This may take a few moments...</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Location Information */}
            {data.location_info && (
              <div className="card bg-base-200">
                
                <div className="card-body">
                  <h4 className="card-title text-lg">📍 Location Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {data.location_info.address && (
                      <p><span className="font-semibold">Address:</span> {data.location_info.address}</p>
                    )}

                    {data.location_info.state && (
                      <p><span className="font-semibold">State:</span> {data.location_info.state}</p>
                    )}
                    {data.location_info.country && (
                      <p><span className="font-semibold">Country:</span> {data.location_info.country}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Disaster Risk Cards */}
            {data.analysis && (
              <div className="card bg-base-200">
                <div className="card-body">
                  <h4 className="card-title text-lg">🎯 Disaster Risk Assessment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {disasters.map(({ key, name }) => {
                      const disasterData = data.analysis[key] as DisasterInfo;
                      console.log(`Disaster Data for ${key}:`, disasterData);
                      // Only show card if probability is not very low (>= 10%)
                      if (!disasterData) {
                        return null;
                      }

                      return (
                        <div key={key} className="card bg-base-100 shadow-sm">
                          <div className="card-body p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-2xl">{getDisasterIcon(key)}</span>
                              <h5 className="card-title text-base">{name}</h5>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Probability</span>
                                <span className="font-semibold">{(disasterData.probability * 100).toFixed(1)}%</span>
                              </div>
                              
                              <progress 
                                className={`progress w-full ${getProgressBarColor(disasterData.probability * 100)}`} 
                                value={disasterData.probability * 100} 
                                max="100"
                              ></progress>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Risk Level</span>
                                <div className={`badge badge-xs ${getRiskLevelBadge(disasterData.risk_level)}`}>
                                  {disasterData.risk_level}
                                </div>
                              </div>
                              
                              {disasterData.recommendations && disasterData.recommendations.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-600">
                                    {disasterData.recommendations[0]}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Risk Analysis */}
            {data.analysis && (
              <div className="card bg-base-200">
                <div className="card-body">
                  <h4 className="card-title text-lg">⚠️ Risk Analysis</h4>
                  
                  {data.analysis.risk_level && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="font-semibold">Risk Level:</span>
                      <div className={`badge badge-lg ${getRiskLevelBadge(data.analysis.risk_level)}`}>
                        {data.analysis.risk_level.toUpperCase()}
                      </div>
                      {data.analysis.risk_score && (
                        <span className="text-sm">({data.analysis.risk_score}/10)</span>
                      )}
                    </div>
                  )}

                  {data.analysis.summary && (
                    <div className="mb-4">
                      <h5 className="font-semibold mb-2">Summary:</h5>
                      <p className="text-sm">{data.analysis.summary}</p>
                    </div>
                  )}

                  {data.analysis.primary_risks && data.analysis.primary_risks.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-semibold mb-2">Primary Risks:</h5>
                      <div className="flex flex-wrap gap-2">
                        {data.analysis.primary_risks.map((risk, index) => (
                          <span key={index} className="badge badge-outline">
                            {risk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.analysis.recommendations && data.analysis.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-semibold mb-2">Recommendations:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {data.analysis.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Weather Data */}
            {data.weather_data && (
              <div className="card bg-base-200">
                <div className="card-body">
                  <h4 className="card-title text-lg">🌤️ Weather Conditions</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {data.weather_data.temperature && (
                      <div className="stat bg-base-100 rounded-lg">
                        <div className="stat-title text-xs">Temperature</div>
                        <div className="stat-value text-lg">{data.weather_data.temperature}°C</div>
                      </div>
                    )}
                    {data.weather_data.humidity && (
                      <div className="stat bg-base-100 rounded-lg">
                        <div className="stat-title text-xs">Humidity</div>
                        <div className="stat-value text-lg">{data.weather_data.humidity}%</div>
                      </div>
                    )}
                    {data.weather_data.pressure && (
                      <div className="stat bg-base-100 rounded-lg">
                        <div className="stat-title text-xs">Pressure</div>
                        <div className="stat-value text-lg">{data.weather_data.pressure} hPa</div>
                      </div>
                    )}
                    {data.weather_data.wind_speed && (
                      <div className="stat bg-base-100 rounded-lg">
                        <div className="stat-title text-xs">Wind Speed</div>
                        <div className="stat-value text-lg">{data.weather_data.wind_speed} m/s</div>
                      </div>
                    )}
                  </div>
                  {data.weather_data.description && (
                    <p className="mt-2"><span className="font-semibold">Conditions:</span> {data.weather_data.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Geographic Data */}
            {data.geographic_data && (
              <div className="card bg-base-200">
                <div className="card-body">
                  <h4 className="card-title text-lg">🗺️ Geographic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.geographic_data.elevation && (
                      <div className="stat bg-base-100 rounded-lg">
                        <div className="stat-title text-xs">Elevation</div>
                        <div className="stat-value text-lg">{data.geographic_data.elevation}m</div>
                      </div>
                    )}
                    {data.geographic_data.terrain && (
                      <p><span className="font-semibold">Terrain:</span> {data.geographic_data.terrain}</p>
                    )}
                    {data.geographic_data.land_cover && (
                      <p><span className="font-semibold">Land Cover:</span> {data.geographic_data.land_cover}</p>
                    )}
                  </div>
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
                  console.log('Plan route functionality coming soon...');
                }}
              >
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
