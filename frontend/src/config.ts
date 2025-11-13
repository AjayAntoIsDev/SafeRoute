// Configuration for the SafeRoute application

export const config = {
    // OpenRouteService API configuration
    // Get your free API key at https://openrouteservice.org/
    openRouteService: {
        apiKey: "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImEwZTY1ZWJjNWY3OTQ2ZDRhYjJhNmZjM2Q4ZWNkOTc5IiwiaCI6Im11cm11cjY0In0=",
        baseUrl: "https://api.openrouteservice.org/v2",
    },

    // Backend API configuration
    backend: {
        baseUrl: "https://saferoutebackend.ajayanto.me",
    },

    // Map and distance calculation settings
    map: {
        defaultZoom: 13,
        emergencyBuildingsRadius: 1500, // meters
        maxEmergencyBuildings: 20,
        routingProfile: "driving-car" as const, // 'driving-car' | 'walking' | 'cycling'
    },
};
