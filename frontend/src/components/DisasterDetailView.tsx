import React from 'react';

interface DisasterInfo {
  probability: number;
  risk_level: string;
  recommendations: string[];
  analysis: string;
}

interface DisasterDetailViewProps {
  disaster: DisasterInfo;
  disasterType: string;
  onClose: () => void;
  onSelectForMap: () => void;
}

const DisasterDetailView: React.FC<DisasterDetailViewProps> = ({
  disaster,
  disasterType,
  onClose,
  onSelectForMap
}) => {
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

  const getDisasterDescription = (disasterType: string) => {
    switch (disasterType.toLowerCase()) {
      case 'floods':
        return 'Floods are among the most common and devastating natural disasters. They can occur due to heavy rainfall, storm surges, or dam failures, causing significant damage to infrastructure and posing risks to human life.';
      case 'cyclone':
        return 'Cyclones are intense circular storms that originate over warm tropical oceans. They bring strong winds, heavy rainfall, and can cause storm surges, leading to widespread destruction along coastal areas.';
      case 'earthquakes':
        return 'Earthquakes are sudden movements of the Earth\'s crust caused by the release of stored energy. They can cause ground shaking, surface rupture, and secondary hazards like landslides and tsunamis.';
      case 'droughts':
        return 'Droughts are prolonged periods of abnormally low rainfall, leading to water scarcity. They can severely impact agriculture, water supplies, and ecosystems, often lasting for months or years.';
      case 'landslides':
        return 'Landslides involve the movement of rock, debris, or earth down a slope. They can be triggered by heavy rainfall, earthquakes, or human activities, posing significant risks to communities in mountainous areas.';
      default:
        return 'Natural disasters can have significant impacts on communities and infrastructure.';
    }
  };

  const getSafetyTips = (disasterType: string) => {
    switch (disasterType.toLowerCase()) {
      case 'floods':
        return [
          'Stay informed about weather conditions and flood warnings',
          'Avoid walking or driving through flood waters',
          'Move to higher ground if flooding is imminent',
          'Keep emergency supplies and evacuation kit ready',
          'Know your evacuation routes and shelter locations'
        ];
      case 'cyclone':
        return [
          'Monitor weather updates and evacuation orders',
          'Secure outdoor items and board up windows',
          'Stay indoors during the storm',
          'Have emergency supplies for at least 3 days',
          'Avoid using electrical appliances during the storm'
        ];
      case 'earthquakes':
        return [
          'Drop, Cover, and Hold On during shaking',
          'Stay away from windows and heavy objects',
          'Have an emergency kit and family communication plan',
          'Know safe spots in each room of your home',
          'Practice earthquake drills regularly'
        ];
      case 'droughts':
        return [
          'Conserve water through efficient usage',
          'Store emergency water supplies',
          'Protect crops and livestock if applicable',
          'Monitor water quality and availability',
          'Follow local water restrictions and guidelines'
        ];
      case 'landslides':
        return [
          'Be aware of landslide warning signs',
          'Avoid building in landslide-prone areas',
          'Plant ground cover on slopes to reduce erosion',
          'Install proper drainage systems',
          'Have evacuation plans for steep terrain areas'
        ];
      default:
        return ['Stay informed about local emergency procedures'];
    }
  };

  return (
    <div className="fixed inset-0 bg-base-100 z-[9999] overflow-y-auto animate-fade-in">
      <div className="min-h-screen w-full p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button 
              className="btn btn-ghost btn-circle"
              onClick={onClose}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl">{getDisasterIcon(disasterType)}</span>
              <h1 className="text-2xl sm:text-3xl font-bold capitalize">{disasterType}</h1>
            </div>
          </div>
          <div className={`badge badge-lg ${getRiskLevelBadge(disaster.risk_level)}`}>
            {disaster.risk_level} Risk
          </div>
        </div>

        {/* Risk Overview */}
        <div className="card bg-base-200 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">Risk Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Probability</span>
                  <span className="text-lg font-bold">
                    {(disaster.probability * 100).toFixed(1)}%
                  </span>
                </div>
                <progress
                  className={`progress w-full ${getProgressBarColor(disaster.probability * 100)}`}
                  value={disaster.probability * 100}
                  max="100"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Risk Level</span>
                  <div className={`badge ${getRiskLevelBadge(disaster.risk_level)}`}>
                    {disaster.risk_level}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Based on historical data and current conditions
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div className="card bg-base-200 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">Analysis</h2>
            <p className="text-gray-700 leading-relaxed">{disaster.analysis}</p>
          </div>
        </div>

        {/* Description */}
        <div className="card bg-base-200 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">About {disasterType}</h2>
            <p className="text-gray-700 leading-relaxed">{getDisasterDescription(disasterType)}</p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="card bg-base-200 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">Recommendations</h2>
            <ul className="space-y-2">
              {disaster.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="card bg-base-200 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">Safety Tips</h2>
            <ul className="space-y-2">
              {getSafetyTips(disasterType).map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-warning">⚠️</span>
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <button 
            className="btn btn-outline w-full sm:w-auto" 
            onClick={onClose}
          >
            Back to Overview
          </button>
          <button 
            className="btn btn-primary w-full sm:w-auto"
            onClick={onSelectForMap}
          >
            Show on Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisasterDetailView;
