import math
from typing import Dict, Any
from config import EARTH_RADIUS_KM


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

    return c * EARTH_RADIUS_KM


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
    if geo_data["terrain"] in ["coastal_plain"]:
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
