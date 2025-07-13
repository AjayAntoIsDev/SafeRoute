// Configuration for the SafeRoute application

export const config = {
  // OpenRouteService API configuration
  // Get your free API key at https://openrouteservice.org/
  openRouteService: {
    apiKey: '5b3ce3597851110001cf6248b8b0e5d8c8c04d1ca5d947b8a78e4b8f',
    baseUrl: 'https://api.openrouteservice.org/v2'
  },
  
  // Backend API configuration
  backend: {
    baseUrl: 'http://localhost:8000'
  },
  
  // Map and distance calculation settings
  map: {
    defaultZoom: 13,
    emergencyBuildingsRadius: 1500, // meters
    maxEmergencyBuildings: 20,
    routingProfile: 'driving-car' as const // 'driving-car' | 'walking' | 'cycling'
  }
};
