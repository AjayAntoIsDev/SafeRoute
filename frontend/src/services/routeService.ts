import { config } from '../config';

type RouteProfile = 'driving-car' | 'walking' | 'cycling';

interface MatrixResponse {
  durations: number[][];
  distances: number[][];
  sources: Array<{
    location: number[];
  }>;
  destinations: Array<{
    location: number[];
  }>;
}

interface DistanceResult {
  distance: number; // in meters
  duration: number; // in seconds
  success: boolean;
  error?: string;
  isEstimated: boolean;
}

class RouteService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = config.openRouteService.apiKey;
    this.baseUrl = config.openRouteService.baseUrl;
  }

  /**
   * Calculate actual road distance using Matrix API (more efficient for free tier)
   */
  async calculateDistance(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
    profile: RouteProfile = 'driving-car'
  ): Promise<DistanceResult> {
    try {
      const locations = [
        [startLng, startLat],
        [endLng, endLat]
      ];

      const response = await fetch(`${this.baseUrl}/matrix/${profile}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locations: locations,
          sources: [0],
          destinations: [1],
          metrics: ['distance', 'duration']
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MatrixResponse = await response.json();
      
      if (data.distances && data.distances[0] && data.durations && data.durations[0]) {
        return {
          distance: data.distances[0][0],
          duration: data.durations[0][0],
          success: true,
          isEstimated: false
        };
      } else {
        throw new Error('No route found in matrix response');
      }
    } catch (error) {
      console.error('Error calculating matrix distance:', error);
      
      // Fallback to straight-line distance if API fails
      const straightLineDistance = this.calculateStraightLineDistance(
        startLat, startLng, endLat, endLng
      );
      
      return {
        distance: straightLineDistance,
        duration: this.estimateTravelTime(straightLineDistance, profile),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        isEstimated: true
      };
    }
  }

  /**
   * Calculate distances for multiple destinations efficiently using Matrix API
   * This is much more efficient than individual requests
   */
  async calculateMultipleDistances(
    originLat: number,
    originLng: number,
    destinations: Array<{ lat: number; lng: number; id: string }>,
    profile: RouteProfile = 'driving-car'
  ): Promise<Map<string, DistanceResult>> {
    const results = new Map<string, DistanceResult>();
    
    if (destinations.length === 0) {
      return results;
    }

    try {
      // Prepare locations array: origin first, then all destinations
      const locations = [
        [originLng, originLat], // Source
        ...destinations.map(dest => [dest.lng, dest.lat]) // Destinations
      ];

      // Matrix API can handle many destinations at once (much more efficient)
      const response = await fetch(`${this.baseUrl}/matrix/${profile}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locations: locations,
          sources: [0], // Only origin as source
          destinations: Array.from({ length: destinations.length }, (_, i) => i + 1), // All destinations
          metrics: ['distance', 'duration']
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MatrixResponse = await response.json();
      
      if (data.distances && data.distances[0] && data.durations && data.durations[0]) {
        // Map results back to destination IDs
        destinations.forEach((dest, index) => {
          const distance = data.distances[0][index];
          const duration = data.durations[0][index];
          
          if (distance !== null && duration !== null) {
            results.set(dest.id, {
              distance: distance,
              duration: duration,
              success: true,
              isEstimated: false
            });
          } else {
            // Fallback for failed individual calculations
            const straightLineDistance = this.calculateStraightLineDistance(
              originLat, originLng, dest.lat, dest.lng
            );
            results.set(dest.id, {
              distance: straightLineDistance,
              duration: this.estimateTravelTime(straightLineDistance, profile),
              success: false,
              error: 'Matrix calculation failed for this destination',
              isEstimated: true
            });
          }
        });
      } else {
        throw new Error('Invalid matrix response structure');
      }
    } catch (error) {
      console.error('Error calculating matrix distances:', error);
      
      // Fallback: calculate straight-line distances for all destinations
      destinations.forEach(dest => {
        const straightLineDistance = this.calculateStraightLineDistance(
          originLat, originLng, dest.lat, dest.lng
        );
        results.set(dest.id, {
          distance: straightLineDistance,
          duration: this.estimateTravelTime(straightLineDistance, profile),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          isEstimated: true
        });
      });
    }
    
    return results;
  }

  /**
   * Estimate travel time based on distance and transport mode
   */
  private estimateTravelTime(distance: number, profile: RouteProfile): number {
    const speeds = {
      'driving-car': 13.89,  // ~50 km/h
      'walking': 1.39,       // ~5 km/h
      'cycling': 4.17        // ~15 km/h
    };
    return distance / speeds[profile];
  }

  /**
   * Calculate straight-line distance between two points
   */
  private calculateStraightLineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

export const routeService = new RouteService();
export type { DistanceResult };
