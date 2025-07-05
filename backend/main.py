from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import json
from typing import Dict, Any, Optional
import os
from datetime import datetime, timedelta
import asyncio
from groq import Groq
from dotenv import load_dotenv
import math
# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="SafeRoute API",
    description="A API for SafeRoute with Natural Disaster Prediction",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CoordinateRequest(BaseModel):
    latitude: float
    longitude: float


class DisasterPrediction(BaseModel):
    weather_data: Dict[str, Any]
    geographic_data: Dict[str, Any]
    analysis: Dict[str, Any]
    location_info: Dict[str, Any]


@app.get("/")
async def root():
    return {"message": "SafeRoute Natural Disaster Predictor API is Working!"}


@app.post("/predict-disaster", response_model=DisasterPrediction)
async def predict_natural_disaster(request: CoordinateRequest):
    try:
        if not (6.0 <= request.latitude <= 37.0 and 68.0 <= request.longitude <= 97.0):
            raise HTTPException(
                status_code=400, detail="Coordinates must be within India")

        print(
            f"Processing coordinates: {request.latitude}, {request.longitude}")

        weather_data, geographic_data, location_info = await asyncio.gather(
            get_weather_data(request.latitude, request.longitude),
            get_geographic_data(request.latitude, request.longitude),
            get_location_info(request.latitude, request.longitude)
        )

        print("Data fetched successfully, analyzing with Groq...")

        prediction = await analyze_disaster_risk_with_groq(
            weather_data, geographic_data, location_info, request.latitude, request.longitude
        )

        return prediction

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in predict_natural_disaster: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Prediction failed: {str(e)}")


async def get_weather_data(lat: float, lon: float) -> Dict[str, Any]:
    """
    Fetch weather data from OpenWeatherMap free API
    """
    API_KEY = "bd5e378503939ddaee76f12ad7a97608"
    if not API_KEY:
        return {
            "current": {
                "main": {"temp": 25, "humidity": 60, "pressure": 1013},
                "weather": [{"description": "clear sky"}],
                "wind": {"speed": 5}
            },
            "forecast": {"list": []},
            "timestamp": datetime.now().isoformat(),
            "source": "fallback"
        }

    async with httpx.AsyncClient() as client:
        try:
            current_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
            current_response = await client.get(current_url, timeout=10.0)
            current_response.raise_for_status()
            current_data = current_response.json()

            forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
            forecast_response = await client.get(forecast_url, timeout=10.0)
            forecast_response.raise_for_status()
            forecast_data = forecast_response.json()

            return {
                "current": current_data,
                "forecast": forecast_data,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Weather API error: {str(e)}")
            return {
                "current": {
                    "main": {"temp": 25, "humidity": 60, "pressure": 1013},
                    "weather": [{"description": "clear sky"}],
                    "wind": {"speed": 5}
                },
                "forecast": {"list": []},
                "timestamp": datetime.now().isoformat(),
                "source": "fallback"
            }


async def get_geographic_data(lat: float, lon: float) -> Dict[str, Any]:
    """
    Get geographic data from multiple free APIs
    """
    async with httpx.AsyncClient() as client:
        try:
            elevation_url = f"https://api.open-meteo.com/v1/elevation?latitude={lat}&longitude={lon}"
            elevation_response = await client.get(elevation_url, timeout=10.0)
            elevation_data = elevation_response.json()

            elevation = elevation_data.get("elevation", [200])[
                0] if elevation_data.get("elevation") else 200

            geographic_features = {
                "elevation": elevation,
                "terrain": await classify_terrain(elevation, lat, lon),
                "seismic_zone": get_seismic_zone(lat, lon),
                "climate_zone": get_climate_zone(lat, lon),
                "raw_data": {
                    "elevation": elevation_data,
                    "source": "open-meteo"
                }
            }

            return geographic_features

        except Exception as e:
            print(f"Geographic API error: {str(e)}")
            # Fallback to basic geographic classification - ADD AWAIT HERE
            return await get_fallback_geographic_data(lat, lon)


async def get_location_info(lat: float, lon: float) -> Dict[str, Any]:
    """
    Get detailed location information from free APIs
    """
    async with httpx.AsyncClient() as client:
        try:
            # Use BigDataCloud free reverse geocoding
            url = f"https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={lat}&longitude={lon}&localityLanguage=en"
            response = await client.get(url, timeout=10.0)
            data = response.json()

            return {
                "city": data.get("city", "Unknown"),
                "state": data.get("principalSubdivision", "Unknown"),
                "district": data.get("localityInfo", {}).get("administrative", [{}])[0].get("name", "Unknown"),
                "country": data.get("countryName", "India"),
                "postal_code": data.get("postcode", ""),
                "locality": data.get("locality", ""),
                "raw_data": data
            }
        except Exception as e:
            print(f"Location API error: {str(e)}")
            return {
                "city": "Unknown",
                "state": "Unknown",
                "district": "Unknown",
                "country": "India",
                "postal_code": "",
                "locality": ""
            }


async def classify_terrain(elevation: float, lat: float, lon: float) -> str:
    """
    Classify terrain based on elevation and location
    """
    if elevation > 2500:
        return "high_mountain"
    elif elevation > 1000:
        return "mountain"
    elif elevation > 500:
        return "hill"
    elif elevation < 10:
        return "coastal_plain"
    elif elevation < 200:
        return "plain"
    else:
        return "plateau"


async def calculate_coastal_proximity(lat: float, lon: float) -> float:
    """
    Calculate actual distance to nearest coast using coastline data API
    """
    try:
        async with httpx.AsyncClient() as client:
            # Use OpenStreetMap Nominatim to find nearest coastline
            # This is a more accurate approach using actual geographic data

            # Search for nearest coastline features
            url = f"https://nominatim.openstreetmap.org/search"
            params = {
                "q": "coastline",
                "lat": lat,
                "lon": lon,
                "format": "json",
                "limit": 5,
                "radius": 100000,  # 100km search radius
                "addressdetails": 1
            }

            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()

            if data:
                # Calculate distance to nearest coastline point
                min_distance = float('inf')
                for result in data:
                    coast_lat = float(result['lat'])
                    coast_lon = float(result['lon'])

                    # Haversine formula for accurate distance calculation
                    distance = calculate_haversine_distance(
                        lat, lon, coast_lat, coast_lon)
                    min_distance = min(min_distance, distance)

                print(min_distance)
                return min_distance if min_distance != float('inf') else calculate_coastal_proximity_fallback(lat, lon)
            else:
                return calculate_coastal_proximity_fallback(lat, lon)

    except Exception as e:
        print(f"Coastal proximity API error: {str(e)}")
        return calculate_coastal_proximity_fallback(lat, lon)


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on Earth using Haversine formula
    """

    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * \
        math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))

    # Radius of Earth in kilometers
    r = 6371

    return c * r


def calculate_coastal_proximity_fallback(lat: float, lon: float) -> float:
    """
    Fallback method using known Indian coastline coordinates
    """

    # Major Indian coastal reference points
    coastal_points = [
        # West Coast
        (19.0760, 72.8777),  # Mumbai
        (15.2993, 74.1240),  # Goa
        (11.2588, 75.7804),  # Calicut
        (9.9312, 76.2673),   # Kochi
        (8.0883, 77.0644),   # Kanyakumari
        # East Coast
        (13.0827, 80.2707),  # Chennai
        (17.6868, 83.2185),  # Visakhapatnam
        (20.2961, 85.8245),  # Bhubaneswar
        (22.5726, 88.3639),  # Kolkata
        # Gujarat Coast
        (23.0225, 72.5714),  # Ahmedabad (near coast)
        (21.1702, 72.8311),  # Surat
    ]

    min_distance = float('inf')
    for coast_lat, coast_lon in coastal_points:
        distance = calculate_haversine_distance(lat, lon, coast_lat, coast_lon)
        min_distance = min(min_distance, distance)

    return min_distance


def get_seismic_zone(lat: float, lon: float) -> int:
    """
    Get seismic zone for Indian coordinates based on actual IS 1893 seismic zones
    """
    # Zone V (Very High Risk)
    # Jammu & Kashmir, Himachal Pradesh, Uttarakhand, Sikkim, parts of Assam
    if (24.0 <= lat <= 37.0 and 74.0 <= lon <= 97.0):
        return 5
    elif (26.0 <= lat <= 29.0 and 88.0 <= lon <= 97.0):  # Northeast states
        return 5
    elif (23.0 <= lat <= 26.0 and 69.0 <= lon <= 72.0):  # Gujarat (Kutch region)
        return 5

    # Zone IV (High Risk)
    elif (28.0 <= lat <= 32.0 and 75.0 <= lon <= 80.0):  # Delhi, parts of Haryana, Punjab
        return 4
    elif (30.0 <= lat <= 32.0 and 76.0 <= lon <= 78.0):  # Chandigarh region
        return 4
    elif (23.0 <= lat <= 26.0 and 72.0 <= lon <= 75.0):  # Parts of Rajasthan
        return 4
    elif (11.0 <= lat <= 13.0 and 74.0 <= lon <= 78.0):  # Parts of Karnataka
        return 4
    elif (8.0 <= lat <= 12.0 and 76.0 <= lon <= 78.0):  # Parts of Kerala, Tamil Nadu
        return 4

    # Zone III (Moderate Risk)
    elif (26.0 <= lat <= 30.0 and 72.0 <= lon <= 78.0):  # Parts of Rajasthan, Haryana, UP
        return 3
    elif (20.0 <= lat <= 26.0 and 72.0 <= lon <= 82.0):  # Maharashtra, MP, parts of UP
        return 3
    elif (15.0 <= lat <= 20.0 and 73.0 <= lon <= 80.0):  # Parts of Maharashtra, Karnataka
        return 3
    elif (20.0 <= lat <= 25.0 and 82.0 <= lon <= 87.0):  # Parts of Bihar, Jharkhand, West Bengal
        return 3
    # Parts of Telangana, Andhra Pradesh, Odisha
    elif (15.0 <= lat <= 20.0 and 80.0 <= lon <= 85.0):
        return 3

    # Zone II (Low Risk)
    elif (8.0 <= lat <= 15.0 and 75.0 <= lon <= 80.0):  # Parts of Karnataka, Tamil Nadu
        return 2
    elif (20.0 <= lat <= 24.0 and 78.0 <= lon <= 82.0):  # Parts of MP, Chhattisgarh
        return 2

    # Default Zone III for other areas
    else:
        return 3


def get_climate_zone(lat: float, lon: float) -> str:
    """
    Get climate zone for Indian coordinates based on actual climate data
    """
    # Tropical Wet (Western Ghats, Northeast India)
    if ((8.0 <= lat <= 21.0 and 72.5 <= lon <= 77.5) or  # Western Ghats
            (22.0 <= lat <= 29.0 and 88.0 <= lon <= 97.0)):   # Northeast India
        return "tropical_wet"

    # Tropical Wet and Dry (Central India, Eastern Coast)
    elif ((15.0 <= lat <= 25.0 and 75.0 <= lon <= 87.0) or  # Central India
          (8.0 <= lat <= 20.0 and 77.0 <= lon <= 87.0)):     # Eastern peninsular India
        return "tropical_wet_dry"

    # Hot Semi-Arid (Deccan Plateau, parts of Rajasthan)
    elif ((15.0 <= lat <= 25.0 and 72.0 <= lon <= 80.0) or  # Deccan Plateau
          (22.0 <= lat <= 28.0 and 70.0 <= lon <= 78.0)):    # Parts of Rajasthan, Haryana
        return "hot_semi_arid"

    # Hot Arid (Thar Desert, Western Rajasthan)
    elif (24.0 <= lat <= 30.0 and 68.0 <= lon <= 75.0):      # Rajasthan desert region
        return "hot_arid"

    # Humid Subtropical (Northern Plains)
    elif (24.0 <= lat <= 32.0 and 75.0 <= lon <= 88.0):      # Indo-Gangetic Plains
        return "humid_subtropical"

    # Montane (Himalayan regions)
    elif lat > 30.0:                                          # Himalayan region
        if lat > 32.0:
            return "alpine"
        else:
            return "montane"

    # Coastal (Coastal areas)
    elif ((8.0 <= lat <= 25.0 and 68.0 <= lon <= 74.0) or   # West coast
          (8.0 <= lat <= 22.0 and 80.0 <= lon <= 87.5)):     # East coast
        return "tropical_coastal"

    # Island Tropical (Andaman & Nicobar, Lakshadweep)
    elif ((6.0 <= lat <= 14.0 and 92.0 <= lon <= 94.0) or   # Andaman & Nicobar
          (8.0 <= lat <= 12.0 and 71.0 <= lon <= 74.0)):     # Lakshadweep
        return "island_tropical"

    # Default for other areas
    else:
        return "subtropical"


async def get_fallback_geographic_data(lat: float, lon: float) -> Dict[str, Any]:
    """
    Provide fallback geographic data with proper structure
    """
    elevation = 200  # Default elevation

    return {
        "elevation": elevation,
        "terrain": await classify_terrain(elevation, lat, lon),
        "seismic_zone": get_seismic_zone(lat, lon),
        "climate_zone": get_climate_zone(lat, lon),
        "raw_data": {
            "source": "fallback",
            "error": "Geographic data APIs unavailable"
        }
    }


async def analyze_disaster_risk_with_groq(
    weather_data: Dict, geo_data: Dict, location_info: Dict, lat: float, lon: float
) -> DisasterPrediction:

    try:
        groq_api_key = "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"
        if not groq_api_key:
            print("Groq API key not found, using rule-based analysis")
            return create_fallback_prediction(weather_data, geo_data, location_info, "Groq API key not configured")

        client = Groq(api_key=groq_api_key)

        structured = f"""
        {{
            "floods": {{
                "probability": "<float>",  # Probability of flooding
                "risk_level": "<str>",      # Risk level (Low, Medium, High)
                "recommendations": [
                    "<str>"  # List of safety recommendations
                ],
                "analysis": "<str>"  # Detailed analysis of the flooding risk
            }},
            "cyclone": {{
                "probability": "<float>",  # Probability of cyclone
                "risk_level": "<str>",      # Risk level (Low, Medium, High)
                "recommendations": [
                    "<str>"  # List of safety recommendations
                ],
                "analysis": "<str>"  # Detailed analysis of the cyclone risk
            }},
            "earthquakes": {{
                "probability": "<float>",  # Probability of earthquake
                "risk_level": "<str>",      # Risk level (Low, Medium, High)
                "recommendations": [
                    "<str>"  # List of safety recommendations
                ],
                "analysis": "<str>"  # Detailed analysis of the earthquake risk
            }},
            "droughts": {{
                "probability": "<float>",  # Probability of drought
                "risk_level": "<str>",      # Risk level (Low, Medium, High)
                "recommendations": [
                    "<str>"  # List of safety recommendations
                ],
                "analysis": "<str>"  # Detailed analysis of the drought risk
            }},
            "landslides": {{
                "probability": "<float>",  # Probability of landslides
                "risk_level": "<str>",      # Risk level (Low, Medium, High)
                "recommendations": [
                    "<str>"  # List of safety recommendations
                ],
                "analysis": "<str>"  # Detailed analysis of the landslide risk
            }},
            "conclusion": {{
                "probability": "<float>",  # Overall probability of a natural disaster occurring
                "risk_level": "<str>",      # Overall risk level (Low, Medium, High)
                "primary_threats": [
                    "<str>"  # List of primary threats (e.g., "flooding", "cyclone")
                ],
                "recommendations": [
                    "<str>"  # Overall recommendations to prepare for disaster
                ],
                "analysis": "<str>"  # Overall analysis of the disaster situation
            }}
        }}
        """

        prompt = f"""
    Analyze natural disaster risk for location: {location_info['city']}, {location_info['state']}, India
    Coordinates: {lat}, {lon}

    WEATHER DATA:
    Current Temperature: {weather_data['current'].get('main', {}).get('temp', 'N/A')}°C
    Weather: {weather_data['current'].get('weather', [{}])[0].get('description', 'N/A')}
    Wind Speed: {weather_data['current'].get('wind', {}).get('speed', 'N/A')} m/s
    Humidity: {weather_data['current'].get('main', {}).get('humidity', 'N/A')}%
    Pressure: {weather_data['current'].get('main', {}).get('pressure', 'N/A')} hPa
    Rainfall: {weather_data['current'].get('rain', {}).get('1h', 0)} mm/h

    GEOGRAPHIC DATA:
    Elevation: {geo_data['elevation']} meters
    Terrain: {geo_data['terrain']}
    Seismic Zone: {geo_data['seismic_zone']} (1-5 scale)
    Climate Zone: {geo_data['climate_zone']}

    LOCATION: {location_info['city']}, {location_info['district']}, {location_info['state']}

    Based on this data, provide a JSON response with:
    {structured}

    Consider seasonal patterns, regional vulnerabilities, current weather conditions, and geographic factors.
    Focus on realistic threats for India: floods, cyclones, earthquakes, landslides, heat waves, droughts.
    Make sure you only return valid JSON without any additional text or formatting.
    """

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert in natural disaster prediction and risk assessment for India. Provide accurate, actionable insights based on meteorological and geographic data."
                },
                {"role": "user", "content": prompt}
            ],
            model="llama3-8b-8192",
            temperature=0.3,
            max_tokens=1000
        )

        llm_response = chat_completion.choices[0].message.content

        # Try to parse JSON from LLM response
        try:
            # Extract JSON from response if it's wrapped in text
            if "```json" in llm_response:
                json_start = llm_response.find("```json") + 7
                json_end = llm_response.find("```", json_start)
                json_text = llm_response[json_start:json_end]
            elif "{" in llm_response:
                json_start = llm_response.find("{")
                json_end = llm_response.rfind("}") + 1
                json_text = llm_response[json_start:json_end]
            else:
                raise ValueError("No JSON found in response")

            parsed_response = json.loads(json_text)

            # Extract overall risk assessment
            all_threats = []
            all_recommendations = []
            max_probability = 0
            overall_risk_level = "Low"
            analysis_parts = []

            for disaster_type, data in parsed_response.items():
                if isinstance(data, dict):
                    all_threats.append(disaster_type)

                    # Get recommendations for this disaster type
                    if "recommendations" in data:
                        all_recommendations.extend(data["recommendations"])

                    # Track highest probability
                    if "probability" in data:
                        prob = float(data["probability"])
                        if prob > max_probability:
                            max_probability = prob
                            overall_risk_level = data.get("risk_level", "Low")

                    # Collect analysis
                    if "analysis" in data:
                        analysis_parts.append(
                            f"{disaster_type}: {data['analysis']}")

            # Remove duplicates and limit
            all_threats = list(dict.fromkeys(all_threats))[:4]
            all_recommendations = list(dict.fromkeys(all_recommendations))[:6]

            return DisasterPrediction(
                weather_data=weather_data,
                geographic_data=geo_data,
                location_info=location_info,
                analysis=parsed_response
            )

        except (json.JSONDecodeError, ValueError) as e:
            print(f"JSON parsing error: {str(e)}")
            return create_fallback_prediction(weather_data, geo_data, location_info, llm_response)

    except Exception as e:
        print(f"Groq API error: {str(e)}")
        return create_fallback_prediction(weather_data, geo_data, location_info, f"LLM analysis failed: {str(e)}")

# Fallback prediction function when LLM fails


def create_fallback_prediction(weather_data: Dict, geo_data: Dict, location_info: Dict, analysis: str) -> DisasterPrediction:
    """
    Create prediction using rule-based approach when LLM fails
    """
    probability = calculate_rule_based_probability(weather_data, geo_data)
    risk_level = get_risk_level(probability)
    primary_threats = get_primary_threats_rule_based(weather_data, geo_data)
    recommendations = get_recommendations_rule_based(probability, geo_data)

    # Create a structured analysis dictionary matching the expected format
    fallback_analysis = {
        "floods": {
            "probability": 20.0,
            "risk_level": "Medium",
            "recommendations": ["Monitor water levels", "Avoid low-lying areas"],
            "analysis": "Moderate flood risk based on current conditions"
        },
        "cyclone": {
            "probability": 15.0,
            "risk_level": "Low",
            "recommendations": ["Monitor weather updates", "Secure loose objects"],
            "analysis": "Low cyclone risk for current location"
        },
        "earthquakes": {
            "probability": float(geo_data["seismic_zone"] * 5),
            "risk_level": risk_level,
            "recommendations": ["Know evacuation routes", "Secure heavy objects"],
            "analysis": f"Earthquake risk based on seismic zone {geo_data['seismic_zone']}"
        },
        "droughts": {
            "probability": 10.0,
            "risk_level": "Low",
            "recommendations": ["Conserve water", "Monitor rainfall patterns"],
            "analysis": "Low drought risk based on current weather"
        },
        "landslides": {
            "probability": 25.0 if geo_data["terrain"] in ["mountain", "high_mountain"] else 5.0,
            "risk_level": "Medium" if geo_data["terrain"] in ["mountain", "high_mountain"] else "Low",
            "recommendations": ["Avoid steep slopes during heavy rain", "Monitor soil conditions"],
            "analysis": f"Landslide risk assessment for {geo_data['terrain']} terrain"
        },
        "conclusion": {
            "probability": probability,
            "risk_level": risk_level,
            "primary_threats": primary_threats,
            "recommendations": recommendations,
            "analysis": f"Rule-based analysis: {analysis}"
        }
    }

    return DisasterPrediction(
        weather_data=weather_data,
        geographic_data=geo_data,
        location_info=location_info,
        analysis=fallback_analysis
    )


def calculate_rule_based_probability(weather_data: Dict, geo_data: Dict) -> float:
    """
    Calculate disaster probability using rules
    """
    base_probability = 10.0
    current = weather_data.get("current", {})

    temp = current.get("main", {}).get("temp", 25)
    wind_speed = current.get("wind", {}).get("speed", 0)
    rain = current.get("rain", {}).get("1h", 0)
    pressure = current.get("main", {}).get("pressure", 1013)

    if temp > 42:
        base_probability += 30
    elif temp < 5:
        base_probability += 20

    if wind_speed > 20:
        base_probability += 25
    elif wind_speed > 15:
        base_probability += 15

    if rain > 15:
        base_probability += 35
    elif rain > 5:
        base_probability += 15

    if pressure < 995:
        base_probability += 20

    if geo_data["seismic_zone"] >= 4:
        base_probability += 15

    if geo_data["terrain"] in ["mountain", "high_mountain"]:
        base_probability += 10

    return min(base_probability, 95.0)


def get_risk_level(probability: float) -> str:
    """Convert probability to risk level"""
    if probability < 25:
        return "Low"
    elif probability < 50:
        return "Medium"
    elif probability < 75:
        return "High"
    else:
        return "Critical"


def get_primary_threats_rule_based(weather_data: Dict, geo_data: Dict) -> list[str]:
    """Get primary threats based on conditions"""
    threats = []
    current = weather_data.get("current", {})

    temp = current.get("main", {}).get("temp", 25)
    wind_speed = current.get("wind", {}).get("speed", 0)
    rain = current.get("rain", {}).get("1h", 0)

    if temp > 40:
        threats.append("heat_wave")
    if wind_speed > 15:
        threats.append("high_winds")
    if rain > 10:
        threats.append("flooding")
    if geo_data["seismic_zone"] >= 4:
        threats.append("earthquake")
    # Remove the coastal_distance check since it doesn't exist in geo_data
    if geo_data["terrain"] in ["coastal_plain"]:  # Use terrain instead
        threats.append("cyclone")
    if geo_data["terrain"] in ["mountain", "high_mountain"] and rain > 5:
        threats.append("landslide")

    return threats[:4] if threats else ["general_weather"]


def get_recommendations_rule_based(probability: float, geo_data: Dict) -> list[str]:
    """Generate safety recommendations"""
    recommendations = [
        "Monitor official weather alerts",
        "Keep emergency contacts handy",
        "Maintain emergency supply kit"
    ]

    if probability > 40:
        recommendations.extend([
            "Avoid non-essential travel",
            "Secure outdoor items",
            "Stay updated on evacuation routes"
        ])

    if probability > 70:
        recommendations.extend([
            "Consider temporary relocation",
            "Stock emergency supplies for 72 hours",
            "Register with local emergency services"
        ])

    return recommendations[:6]
# Fallback prediction function when LLM fails ends


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
