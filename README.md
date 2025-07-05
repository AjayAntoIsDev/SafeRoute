# SafeRoute - Hackathon Edition (India Focus)

A streamlined disaster preparedness and response web application that provides AI-powered guidance for natural disaster scenarios in India. Built for rapid development while maintaining essential life-saving features using IMD and other Indian data sources.

## Overview

SafeRoute helps users quickly assess disaster risks for their location in India and receive AI-generated emergency guidance. Perfect for hackathon development with a focus on core functionality using Indian Meteorological Department (IMD) data and other local sources.

### Core Features (2-Day Scope)

1. **Simple Location Input**: Users enter their Indian city/coordinates
2. **AI-Powered Risk Assessment**: Uses machine learning to analyze IMD data, historical patterns, and real-time conditions
3. **AI-Generated Emergency Guidance**: Alternative AI providers for personalized disaster response advice
4. **Smart Evacuation Routes**: AI-powered safe path recommendations based on OpenStreetMap building data
5. **Essential Information Display**: What to do, where to go, what to pack, what to avoid (India-specific)

### How It Works

1. **Location Input**: User types in their Indian city or allows location access
2. **AI Risk Analysis**: AI processes IMD weather data, historical disaster data, seasonal patterns, and geographical factors
3. **Risk Display**: Show AI-calculated risk levels for major Indian disasters (monsoon floods, cyclones, earthquakes, heatwaves)
4. **Disaster Selection**: User clicks on a disaster type
5. **AI Guidance & Routing**: Display AI-generated advice with:
   - Safest evacuation routes
   - Buildings/areas to avoid
   - Essential items to bring
   - Real-time safety recommendations

## Technology Stack (India-Focused)

- **Frontend**: React.js with Vite (fast setup)
- **Backend**: Python/FastAPI or Flask
- **Database**: TinyDB (JSON-based) or simple JSON files
- **AI**: Groq/Llama, Anthropic Claude, or Google Gemini API
- **Weather Data**: IMD API, OpenWeatherMap API
- **Maps**: OpenStreetMap with Leaflet.js
- **Building Data**: OpenStreetMap Overpass API
- **Routing**: OpenRouteService or OSRM (Open Source Routing Machine)
- **Additional Data**: ISRO satellite data, NDMA guidelines
- **Deployment**: Vercel/Netlify (frontend) + Railway/Render (backend)

## Hackathon Todo List (Priority Order)

### Day 1 - Core Setup & AI Backend (8 hours)

#### Morning (4 hours)
- [ ] **Project Setup** (30 min)
  - [ ] Create React app with Vite
  - [ ] Set up Python FastAPI/Flask backend
  - [ ] Initialize git repository
  - [ ] Set up TinyDB or JSON file structure
  
- [ ] **Data Integration & AI Setup** (3.5 hours)
  - [ ] Set up IMD API integration (weather data)
  - [ ] Set up OpenStreetMap Overpass API for building data
  - [ ] Create historical disaster data (JSON) for major Indian cities
  - [ ] Set up AI provider (Groq/Claude/Gemini) integration
  - [ ] Create AI prompts for risk assessment
  - [ ] Test IMD and OSM data fetching

#### Afternoon (4 hours)
- [ ] **AI Risk Assessment Engine** (2.5 hours)
  - [ ] Create AI prompt templates for risk calculation
  - [ ] Implement risk assessment logic using AI + IMD data
  - [ ] Test AI risk predictions for different Indian cities
  - [ ] Create fallback risk data for demo
  
- [ ] **Basic API Endpoints** (1.5 hours)
  - [ ] Location geocoding using Nominatim (OSM)
  - [ ] Risk assessment API endpoint
  - [ ] AI guidance generation endpoint
  - [ ] Safe routing API endpoint using OpenRouteService
  - [ ] Test APIs with Postman

### Day 2 - Frontend & Integration (8 hours)

#### Morning (4 hours)
- [ ] **Core Frontend Structure** (2 hours)
  - [ ] Create main page layout
  - [ ] Add Indian city location input component
  - [ ] Set up basic routing
  - [ ] Connect frontend to backend
  
- [ ] **Risk Display Components** (2 hours)
  - [ ] Indian disaster risk display cards (monsoon, cyclone, earthquake, heatwave)
  - [ ] AI-powered risk percentage display
  - [ ] Loading states for AI processing
  - [ ] Error handling for API failures

#### Afternoon (4 hours)
- [ ] **AI Guidance & Routing Interface** (2.5 hours)
  - [ ] AI response display component
  - [ ] Interactive OpenStreetMap with Leaflet
  - [ ] Safe routes and danger zones highlighting
  - [ ] Essential items checklist (India-specific)
  - [ ] Emergency contact integration (NDRF, local authorities)
  
- [ ] **Polish & Deployment** (1.5 hours)
  - [ ] Style with Tailwind CSS
  - [ ] Mobile responsiveness
  - [ ] Deploy to Vercel/Railway
  - [ ] Test end-to-end user flow

## AI-Powered Safety Routing

### Data Sources for Safety Analysis
- **Building Data**: OpenStreetMap building tags, construction materials, building types
- **Infrastructure**: OSM data for bridges, overpasses, underground passages
- **Terrain Data**: Elevation data from SRTM, flood zones, landslide areas
- **Historical Incidents**: Previous disaster damage locations
- **Real-time Conditions**: Current weather, traffic, emergency reports

### OpenStreetMap Building Data Query
```python
import requests

def get_building_data(bbox):
    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query = f"""
    [out:json];
    (
      way["building"]({bbox});
      relation["building"]({bbox});
    );
    out geom;
    """
    response = requests.get(overpass_url, params={'data': overpass_query})
    return response.json()
```

### Safety Routing Algorithm
```python
def generate_safe_route(location, disaster_type, destination):
    # Get building data from OpenStreetMap
    building_data = get_building_data_osm(location)
    
    # Analyze building safety based on OSM tags
    unsafe_buildings = analyze_building_safety(building_data, disaster_type)
    
    # Get terrain and flood data
    danger_zones = get_danger_zones(location, disaster_type)
    
    # AI-powered route optimization
    ai_prompt = f"""
    Generate safest evacuation route from {location} during {disaster_type}:
    - Avoid: {unsafe_buildings}
    - Danger zones: {danger_zones}
    - Consider: Building types, construction materials, flood levels
    - Prioritize: Wide roads, open spaces, sturdy buildings
    - Use OpenStreetMap data for routing
    """
    
    return ai_client.complete(ai_prompt)
```

### AI Provider Options

#### Option 1: Groq (Fast & Free)
```python
from groq import Groq

client = Groq(api_key="your_groq_api_key")
response = client.chat.completions.create(
    messages=[{"role": "user", "content": prompt}],
    model="llama3-8b-8192"
)
```

#### Option 2: Anthropic Claude
```python
import anthropic

client = anthropic.Anthropic(api_key="your_claude_api_key")
response = client.messages.create(
    model="claude-3-haiku-20240307",
    max_tokens=1000,
    messages=[{"role": "user", "content": prompt}]
)
```

#### Option 3: Google Gemini
```python
import google.generativeai as genai

genai.configure(api_key="your_gemini_api_key")
model = genai.GenerativeModel('gemini-pro')
response = model.generate_content(prompt)
```

### AI Risk Assessment Prompt Template
```
Analyze disaster risk for {location} in India using this data:
- Current IMD weather: {weather_data}
- Season: {current_season}
- Historical disasters: {historical_data}
- Geographic factors: {geo_data}
- OpenStreetMap building data: {osm_building_data}

Calculate risk percentages (0-100%) for:
1. Monsoon Flooding
2. Cyclone/Storm
3. Earthquake
4. Heatwave/Drought

Provide reasoning for each risk score.
```

### AI Safety Guidance Prompt Template
```
Emergency guidance for {disaster} in {indian_location}:

Based on NDMA guidelines, OpenStreetMap building data, and local conditions, provide:

IMMEDIATE ACTIONS:
1. Safety steps to take right now
2. Whether to evacuate or shelter in place

EVACUATION ROUTE:
1. Safest path to evacuation center/safe zone
2. Buildings and areas to AVOID (based on OSM building types)
3. Landmarks and reference points from OpenStreetMap

ESSENTIAL ITEMS:
1. Documents (Aadhaar, passport, insurance papers)
2. Emergency supplies (water, medicines, flashlight)
3. Communication devices
4. India-specific items (cash, important phone numbers)

WHAT TO AVOID:
1. Dangerous structures/buildings (based on OSM data)
2. Flood-prone areas
3. Power lines and electrical hazards
4. Crowded/narrow passages

EMERGENCY CONTACTS:
1. NDRF: 011-26701700
2. Local District Collector
3. Police: 100
4. Fire: 101
5. Ambulance: 102

Focus on practical advice for Indian infrastructure and systems.
```

## Database Structure (JSON)

### cities_data.json
```json
{
  "mumbai": {
    "coordinates": [19.0760, 72.8777],
    "bbox": [72.7760, 18.8760, 72.9760, 19.2760],
    "historical_disasters": {
      "floods": {"frequency": 8, "last_major": "2021"},
      "cyclones": {"frequency": 3, "last_major": "2020"}
    },
    "safe_zones": [
      {"name": "BKC", "coordinates": [19.0728, 72.8826], "capacity": 5000}
    ],
    "danger_zones": [
      {"area": "Kurla", "risk_type": "flood", "level": "high"}
    ]
  }
}
```

### osm_buildings_cache.json
```json
{
  "mumbai": {
    "buildings": [
      {
        "id": "way/123456789",
        "coordinates": [19.0760, 72.8777],
        "tags": {
          "building": "residential",
          "building:material": "concrete",
          "building:levels": "10",
          "addr:city": "Mumbai"
        },
        "safety_rating": 7
      }
    ]
  }
}
```

## Quick Start Guide

````bash
# Backend setup (Python)
mkdir saferoute-backend
cd saferoute-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn groq anthropic google-generativeai requests tinydb python-dotenv overpy

# Frontend setup
npm create vite@latest saferoute-frontend -- --template react
cd saferoute-frontend
npm install axios react-router-dom leaflet react-leaflet
npm run dev
`````
