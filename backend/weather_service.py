import httpx
from typing import Dict, Any
from datetime import datetime
from config import OPENWEATHER_API_KEY, OPENWEATHER_CURRENT_URL, OPENWEATHER_FORECAST_URL


async def get_weather_data(lat: float, lon: float) -> Dict[str, Any]:
    """
    Fetch weather data from OpenWeatherMap free API
    """
    if not OPENWEATHER_API_KEY:
        return _get_fallback_weather_data()

    async with httpx.AsyncClient() as client:
        try:
            current_url = f"{OPENWEATHER_CURRENT_URL}?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
            current_response = await client.get(current_url, timeout=10.0)
            current_response.raise_for_status()
            current_data = current_response.json()

            forecast_url = f"{OPENWEATHER_FORECAST_URL}?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
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
            return _get_fallback_weather_data()


def _get_fallback_weather_data() -> Dict[str, Any]:
    """
    Provide fallback weather data when API is unavailable
    """
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
