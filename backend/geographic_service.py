import httpx
import math
from typing import Dict, Any
from config import (
    ELEVATION_API_URL, REVERSE_GEOCODING_URL, NOMINATIM_URL, 
    COASTAL_REFERENCE_POINTS
)
from utils import calculate_haversine_distance


async def get_geographic_data(lat: float, lon: float) -> Dict[str, Any]:
    """
    Get geographic data from multiple free APIs
    """
    async with httpx.AsyncClient() as client:
        try:
            elevation_url = f"{ELEVATION_API_URL}?latitude={lat}&longitude={lon}"
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
            return await get_fallback_geographic_data(lat, lon)


async def get_location_info(lat: float, lon: float) -> Dict[str, Any]:
    """
    Get detailed location information from free APIs
    """
    async with httpx.AsyncClient() as client:
        try:
            url = f"{REVERSE_GEOCODING_URL}?latitude={lat}&longitude={lon}&localityLanguage=en"
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
            params = {
                "q": "coastline",
                "lat": lat,
                "lon": lon,
                "format": "json",
                "limit": 5,
                "radius": 100000,  # 100km search radius
                "addressdetails": 1
            }

            response = await client.get(NOMINATIM_URL, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()

            if data:
                min_distance = float('inf')
                for result in data:
                    coast_lat = float(result['lat'])
                    coast_lon = float(result['lon'])

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


def calculate_coastal_proximity_fallback(lat: float, lon: float) -> float:
    """
    Fallback method using known Indian coastline coordinates
    """
    min_distance = float('inf')
    for coast_lat, coast_lon in COASTAL_REFERENCE_POINTS:
        distance = calculate_haversine_distance(lat, lon, coast_lat, coast_lon)
        min_distance = min(min_distance, distance)

    return min_distance


def get_seismic_zone(lat: float, lon: float) -> int:
    """
    Get seismic zone for Indian coordinates based on actual IS 1893 seismic zones
    """
    # Zone V (Very High Risk)
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
    elif (15.0 <= lat <= 20.0 and 80.0 <= lon <= 85.0):  # Parts of Telangana, Andhra Pradesh, Odisha
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
