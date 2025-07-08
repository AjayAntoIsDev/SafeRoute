import json
from typing import Dict, Any
from groq import Groq
from models import DisasterPrediction
from config import GROQ_API_KEY
from datetime import datetime
from utils import (
    calculate_rule_based_probability,
    get_risk_level,
    get_primary_threats_rule_based,
    get_recommendations_rule_based
)


async def analyze_disaster_risk_with_groq(
    weather_data: Dict, geo_data: Dict, location_info: Dict, lat: float, lon: float
) -> DisasterPrediction:
    """
    Analyze disaster risk using Groq LLM with fallback to rule-based analysis
    """
    try:
        if not GROQ_API_KEY:
            print("Groq API key not found, using rule-based analysis")
            return create_fallback_prediction(weather_data, geo_data, location_info, "Groq API key not configured")

        client = Groq(api_key=GROQ_API_KEY)

        structured = _get_analysis_structure()
        prompt = _create_analysis_prompt(
            weather_data, geo_data, location_info, lat, lon, structured)

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert in natural disaster prediction and risk assessment for India. Provide accurate, actionable insights based on meteorological and geographic data."
                },
                {"role": "user", "content": prompt}
            ],
            model="deepseek-r1-distill-llama-70b",
            temperature=0.5,
            max_tokens=2500
        )

        llm_response = chat_completion.choices[0].message.content

        try:
            print(llm_response)
            parsed_response = _parse_llm_response(llm_response)
            
            return DisasterPrediction(
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


def create_fallback_prediction(weather_data: Dict, geo_data: Dict, location_info: Dict, analysis: str) -> DisasterPrediction:
    """
    Create prediction using rule-based approach when LLM fails
    """
    probability = calculate_rule_based_probability(weather_data, geo_data)
    risk_level = get_risk_level(probability)
    primary_threats = get_primary_threats_rule_based(weather_data, geo_data)
    recommendations = get_recommendations_rule_based(probability, geo_data)

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
        geographic_data=geo_data,
        location_info=location_info,
        analysis=fallback_analysis
    )


def _get_analysis_structure() -> str:
    """Get the structured analysis format for LLM"""
    return """
        {
            "floods": {
                "probability": "<float>",  # Probability of flooding
                "risk_level": "<str>",      # Risk level (Low, Medium, High)
                "recommendations": [
                    "<str>"  # List of safety recommendations
                ],
                "analysis": "<str>"  # Detailed analysis of the flooding risk
            },
            "cyclone": {
                "probability": "<float>",  # Probability of cyclone
                "risk_level": "<str>",      # Risk level (Low, Medium, High)
                "recommendations": [
                    "<str>"  # List of safety recommendations
                ],
                "analysis": "<str>"  # Detailed analysis of the cyclone risk
            },
            "earthquakes": {
                "probability": "<float>",  # Probability of earthquake
                "risk_level": "<str>",      # Risk level (Low, Medium, High)
                "recommendations": [
                    "<str>"  # List of safety recommendations
                ],
                "analysis": "<str>"  # Detailed analysis of the earthquake risk
            },
            "droughts": {
                "probability": "<float>",  # Probability of drought
                "risk_level": "<str>",      # Risk level (Low, Medium, High)
                "recommendations": [
                    "<str>"  # List of safety recommendations
                ],
                "analysis": "<str>"  # Detailed analysis of the drought risk
            },
            "landslides": {
                "probability": "<float>",  # Probability of landslides
                "risk_level": "<str>",      # Risk level (Low, Medium, High)
                "recommendations": [
                    "<str>"  # List of safety recommendations
                ],
                "analysis": "<str>"  # Detailed analysis of the landslide risk
            },
            "conclusion": {
                "risk_level": "<str>",      # Overall risk level (Low, Medium, High)
                "primary_threats": [
                    "<str>"  # List of primary threats (e.g., "flooding", "cyclone")
                ],
                "recommendations": [
                    "<str>"  # Overall recommendations to prepare for disaster
                ],
                "analysis": "<str>"  # Overall analysis of the disaster situation
            }
        }
        """


def _create_analysis_prompt(weather_data: Dict, geo_data: Dict, location_info: Dict, lat: float, lon: float, structured: str) -> str:
    """Create the analysis prompt for LLM"""
    current_time = datetime.now()

    return f"""
    Analyze natural disaster risk for location: {location_info['city']}, {location_info['state']}, India
    Coordinates: {lat}, {lon}

    
    CURRENT_DATE_TIME:
    Date: {current_time.strftime('%Y-%m-%d')}
    Time: {current_time.strftime('%H:%M:%S')}
    Season: {_get_season(current_time.month)}

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


    The response must:

    1. Include ALL fields shown above

    2. Use only the exact field names shown

    3. Follow the exact data types specified

    4. Contain ONLY the JSON object and nothing else


    IMPORTANT: Do not include any explanatory text, markdown formatting, or code blocks.


    """


def _get_season(month: int) -> str:
    """Get season based on month (for India)"""
    if month in [12, 1, 2]:
        return "Winter"
    elif month in [3, 4, 5]:
        return "Summer"
    elif month in [6, 7, 8, 9]:
        return "Monsoon"
    else:  # month in [10, 11]
        return "Post-Monsoon"


def _parse_llm_response(llm_response: str) -> Dict:
    """Parse JSON response from LLM"""
    # Remove <think> tags and content if present
    if "<think>" in llm_response and "</think>" in llm_response:
        think_start = llm_response.find("<think>")
        think_end = llm_response.find("</think>") + 8
        llm_response = llm_response[:think_start] + llm_response[think_end:]
    
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

    return json.loads(json_text)
