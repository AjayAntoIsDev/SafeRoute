import Groq from 'groq-sdk';

export interface EmergencyBuilding {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  distance?: number;
}

export interface DisasterInfo {
  probability: number;
  risk_level: string;
  recommendations: string[];
  analysis: string;
}

export interface FacilityRecommendation {
  buildingId: string;
  score: number;
  reasoning: string;
  priority: 'highest' | 'high' | 'medium' | 'low';
}

interface GroqResponse {
  recommendedFacility: string;
  score: number;
  reasoning: string;
  priority: 'highest' | 'high' | 'medium' | 'low';
  alternativeFacilities: Array<{
    buildingId: string;
    score: number;
    reasoning: string;
  }>;
}

export class IntelligentFacilityService {
  private groq: Groq | null = null;
  private apiKey: string;

  constructor() {
    // You'll need to add your Groq API key here or via environment variables
    this.apiKey =
        "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";
    
    if (
        this.apiKey
    ) {
        try {
            this.groq = new Groq({
                apiKey: this.apiKey,
                dangerouslyAllowBrowser: true, // Note: In production, this should be done on the backend
            });
        } catch (error) {
            console.warn("Failed to initialize Groq client:", error);
            this.groq = null;
        }
    }
  }

  /**
   * Use Groq AI to intelligently select the best emergency facility
   * based on disaster type, building information, and proximity
   */
  async selectBestFacility(
    disasterType: string,
    disasterInfo: DisasterInfo,
    emergencyBuildings: EmergencyBuilding[]
  ): Promise<FacilityRecommendation | null> {
    try {
      if (
          !this.groq ||
          !this.apiKey
      ) {
          console.warn(
              "Groq API key not configured, falling back to distance-based selection"
          );
          return this.fallbackSelection(emergencyBuildings);
      }

      const prompt = this.createFacilitySelectionPrompt(disasterType, disasterInfo, emergencyBuildings);
      
      const chatCompletion = await this.groq.chat.completions.create({
          messages: [
              {
                  role: "system",
                  content: `You are an expert emergency response coordinator with deep knowledge of natural disasters and emergency facility capabilities in India. Your task is to analyze the given disaster scenario and emergency facilities to recommend the most appropriate facility for immediate assistance.

Consider these factors:
1. Disaster type and severity
2. Facility type and likely capabilities
3. Distance from the incident location
4. Facility capacity based on type (hospitals > clinics > pharmacies)
5. Appropriateness for the specific disaster (e.g., flood victims need hospitals with evacuation capabilities)

Respond ONLY with valid JSON in this exact format:
{
  "recommendedFacility": "building_id",
  "score": 95,
  "reasoning": "Clear explanation of why this facility is best",
  "priority": "highest"
}`,
              },
              {
                  role: "user",
                  content: prompt,
              },
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.4,
          max_tokens: 1500,
      });

      const response = chatCompletion.choices[0]?.message?.content;
      if (!response) {
        console.error('No response from Groq');
        return this.fallbackSelection(emergencyBuildings);
      }

      try {
        const parsedResponse: GroqResponse = JSON.parse(response);
        
        // Find the recommended building
        const recommendedBuilding = emergencyBuildings.find(
          building => building.id === parsedResponse.recommendedFacility
        );

        if (!recommendedBuilding) {
          console.error('Recommended facility not found in building list');
          return this.fallbackSelection(emergencyBuildings);
        }

        return {
          buildingId: parsedResponse.recommendedFacility,
          score: parsedResponse.score,
          reasoning: parsedResponse.reasoning,
          priority: parsedResponse.priority
        };

      } catch (parseError) {
        console.error('Error parsing Groq response:', parseError);
        console.log('Raw response:', response);
        return this.fallbackSelection(emergencyBuildings);
      }

    } catch (error) {
      console.error('Error calling Groq API:', error);
      return this.fallbackSelection(emergencyBuildings);
    }
  }

  private createFacilitySelectionPrompt(
    disasterType: string,
    disasterInfo: DisasterInfo,
    emergencyBuildings: EmergencyBuilding[]
  ): string {
    return `
DISASTER SCENARIO:
- Type: ${disasterType}
- Risk Level: ${disasterInfo.analysis[disasterType].risk_level}
- Probability: ${disasterInfo.analysis[disasterType].probability}%
- Analysis: ${disasterInfo.analysis[disasterType].analysis}
- Recommendations: ${disasterInfo.analysis[disasterType].recommendations.join(', ')}

AVAILABLE EMERGENCY FACILITIES:
${emergencyBuildings.map((building, index) => `
${index + 1}. ID: ${building.id}
   Name: ${building.name}
   Type: ${building.type}
   Distance: ${building.distance ? (building.distance / 1000).toFixed(2) + ' km' : 'Unknown'}
   Address: ${building.address || 'Not provided'}
   Phone: ${building.phone || 'Not provided'}
`).join('')}

Based on the disaster type "${disasterType}" and the facilities available, which facility would be most appropriate for immediate emergency response? Consider:
- Facility capabilities for this specific disaster type
- Distance and accessibility
- Likely resources and capacity
- Appropriateness for the emergency (e.g., hospitals for severe injuries, clinics for minor issues, pharmacies for medication needs)

Provide your recommendation with a detailed reasoning.
`;
  }

  private fallbackSelection(emergencyBuildings: EmergencyBuilding[]): FacilityRecommendation | null {
    if (emergencyBuildings.length === 0) return null;

    // Simple fallback: prefer hospitals, then by distance
    const sortedBuildings = [...emergencyBuildings].sort((a, b) => {
      // Prioritize hospitals
      if (a.type === 'hospital' && b.type !== 'hospital') return -1;
      if (b.type === 'hospital' && a.type !== 'hospital') return 1;
      
      // Then by distance
      return (a.distance || Infinity) - (b.distance || Infinity);
    });

    const best = sortedBuildings[0];
    return {
      buildingId: best.id,
      score: 75, // Default score for fallback
      reasoning: `Selected ${best.name} as the closest ${best.type} facility (${best.distance ? (best.distance / 1000).toFixed(2) + ' km' : 'unknown distance'} away).`,
      priority: best.type === 'hospital' ? 'high' : 'medium'
    };
  }
}

export default IntelligentFacilityService;
