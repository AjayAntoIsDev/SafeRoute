# Road Distance Calculation Setup

This document explains how the SafeRoute application calculates actual road distances instead of straight-line distances for emergency buildings.

## What Changed

Previously, the application used straight-line (Haversine) distance calculations, which don't account for actual roads, terrain, or travel routes. Now it uses the OpenRouteService API to calculate real driving distances.

## Features

- **Real Road Distances**: Uses actual road networks and routing algorithms
- **Multiple Transport Modes**: Supports driving, walking, and cycling routes
- **Batch Processing**: Efficiently calculates distances to multiple emergency buildings
- **Fallback System**: Falls back to straight-line distance if the routing service fails
- **Configurable**: Easy to change API keys and routing preferences

## Setup Instructions

### 1. Get an OpenRouteService API Key

1. Visit [OpenRouteService](https://openrouteservice.org/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. The free tier includes 2,000 requests per day

### 2. Configure Your API Key

#### Option 1: Environment Variable (Recommended)
1. Copy `.env.example` to `.env.local`
2. Add your API key:
   ```
   REACT_APP_OPENROUTE_API_KEY=your_actual_api_key_here
   ```

#### Option 2: Direct Configuration
1. Edit `src/config.ts`
2. Replace the demo API key with your own

### 3. Customize Settings (Optional)

You can modify these settings in `src/config.ts`:

```typescript
map: {
  emergencyBuildingsRadius: 1500, // Search radius in meters
  maxEmergencyBuildings: 20,      // Maximum buildings to show
  routingProfile: 'driving-car'   // 'driving-car' | 'walking' | 'cycling'
}
```

## How It Works

1. **Building Discovery**: The app finds emergency buildings within a radius using OpenStreetMap data
2. **Distance Calculation**: For each building, it calculates the actual road distance using OpenRouteService
3. **Batch Processing**: Multiple distance calculations are batched to avoid overwhelming the API
4. **Sorting & Filtering**: Buildings are sorted by actual road distance and limited to the closest ones
5. **Fallback**: If routing fails for any building, it falls back to straight-line distance

## API Usage Considerations

- **Rate Limits**: The free tier has daily limits, so batch processing helps manage usage
- **Response Time**: Road distance calculations take longer than straight-line distance
- **Error Handling**: The app gracefully handles API failures and network issues

## Troubleshooting

### Common Issues

1. **Slow Loading**: Road distance calculations take more time than straight-line distance
   - This is normal and provides more accurate results
   - Loading indicators show progress

2. **API Key Errors**: Make sure your API key is correctly set
   - Check your environment variables
   - Verify the key is active on OpenRouteService

3. **No Results**: If no emergency buildings appear
   - The routing service might be down (app will use fallback)
   - Check browser console for error messages

### Performance Tips

- The app batches requests in groups of 5 to balance speed and API limits
- Buildings without successful route calculations are filtered out
- Consider increasing the radius if few buildings are found in rural areas

## Technical Details

### Files Modified

- `src/services/routeService.ts` - New routing service implementation
- `src/config.ts` - Configuration management
- `src/App.tsx` - Updated distance calculation logic
- `.env.example` - Added OpenRouteService API key configuration

### API Endpoints Used

- `POST /v2/directions/{profile}` - Calculate route between two points
- Supports different profiles: driving-car, walking, cycling

### Data Flow

```
User selects location
→ App fetches emergency buildings from backend
→ App calculates road distances using OpenRouteService
→ Buildings sorted by actual road distance
→ Closest buildings displayed on map
```
