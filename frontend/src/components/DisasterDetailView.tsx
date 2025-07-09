import React, { useState } from 'react';
import DisasterChatbot from './DisasterChatbot';

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
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

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


  return (
      <div className="fixed inset-0 bg-base-100 z-[9999] overflow-y-auto animate-fade-in">
          <div className="min-h-screen w-full p-4 md:p-6 max-w-6xl mx-auto">
              <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                      <button
                          className="btn btn-ghost btn-circle"
                          onClick={onClose}>
                          <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 19l-7-7 7-7"
                              />
                          </svg>
                      </button>
                      <div className="flex items-center gap-3">
                          <span className="text-3xl sm:text-4xl">
                              {getDisasterIcon(disasterType)}
                          </span>
                          <h1 className="text-2xl sm:text-3xl font-bold capitalize">
                              {disasterType}
                          </h1>
                      </div>
                  </div>
                  <div
                      className={`badge badge-lg ${getRiskLevelBadge(
                          disaster.risk_level
                      )}`}>
                      {disaster.risk_level} Risk
                  </div>
              </div>
              {/* Analysis 
        <div className="card bg-base-200 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4 ">Analysis</h2>
            <p className="text-gray-700 leading-relaxed">{disaster.analysis}</p>
          </div>
        </div>*/}
              {/* Recommendations */}
              <div className="card bg-base-200 shadow-lg mb-6">
                  <div className="card-body">
                      <h2 className="card-title text-xl mb-4">
                          Recommendations
                      </h2>
                      <ul className="space-y-2">
                          {disaster.recommendations.map((rec, index) => (
                              <li
                                  key={index}
                                  className="flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  <span className="text-gray-700">{rec}</span>
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <button
                      className="btn btn-ghost w-full sm:w-auto"
                      onClick={() => setIsChatbotOpen(true)}>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Ask AI Assistant
                  </button>
                  <button
                      className="btn btn-outline w-full sm:w-auto"
                      onClick={onClose}>
                      Back to Overview
                  </button>
                  <button
                      className="btn btn-primary w-full sm:w-auto"
                      onClick={onSelectForMap}>
                      Show on Map
                  </button>
              </div>

              {/* Chatbot */}
              <DisasterChatbot
                  disaster={disaster}
                  disasterType={disasterType}
                  isOpen={isChatbotOpen}
                  onClose={() => setIsChatbotOpen(false)}
              />
          </div>
      </div>
  );
};

export default DisasterDetailView;
