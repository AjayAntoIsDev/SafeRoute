# Intelligent Facility Selection Setup

## Getting a Groq API Key

1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the API key

## Setting up the API Key

1. Open `/workspaces/SafeRoute/frontend/.env`
2. Replace `your_groq_api_key_here` with your actual Groq API key:
   ```
   VITE_GROQ_API_KEY=gsk_your_actual_api_key_here
   ```

## How it Works

When a disaster type is selected and emergency buildings are found:

1. **AI Analysis**: The system sends disaster information (type, risk level, analysis) and available emergency facilities to Groq AI
2. **Smart Selection**: Groq AI considers:
   - Disaster type and severity
   - Facility capabilities (hospitals vs clinics vs pharmacies)
   - Distance from the incident
   - Appropriateness for the specific emergency
3. **Fallback**: If AI fails, it falls back to selecting the closest hospital or medical facility
4. **Route Display**: Shows the route to the AI-recommended facility (or closest as fallback)

## Example AI Reasoning

For a flood disaster, the AI might:
- Prioritize hospitals over clinics (for potential injuries/evacuation)
- Consider accessibility (avoid facilities in flood-prone areas)
- Factor in capacity for handling multiple victims
- Provide detailed reasoning like: "Selected City Hospital due to its elevated location above flood level, emergency department capable of handling flood-related injuries, and proximity (2.3 km) for quick access."

## Testing

1. Start the development server: `npm run dev`
2. Select a location on the map
3. Click "Analyze Disasters" 
4. Choose a disaster type from the results
5. Watch as the AI selects the most appropriate facility and displays the route

Note: Without a Groq API key, the system will fall back to distance-based selection.
