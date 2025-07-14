import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Keys
OPENWEATHER_API_KEY = "bd5e378503939ddaee76f12ad7a97608"
GROQ_API_KEY = "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"

# Server Configuration
PORT = 8000

# API URLs
OPENWEATHER_CURRENT_URL = "http://api.openweathermap.org/data/2.5/weather"
OPENWEATHER_FORECAST_URL = "http://api.openweathermap.org/data/2.5/forecast"
ELEVATION_API_URL = "https://api.open-meteo.com/v1/elevation"
REVERSE_GEOCODING_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

# Coordinate boundaries for India
INDIA_LAT_MIN = 6.0
INDIA_LAT_MAX = 37.0
INDIA_LON_MIN = 68.0
INDIA_LON_MAX = 97.0

# Major Indian coastal reference points
COASTAL_REFERENCE_POINTS = [
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

# Earth's radius in kilometers
EARTH_RADIUS_KM = 6371
