from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import httpx
from models import CoordinateRequest, DisasterPrediction
from weather_service import get_weather_data
from geographic_service import get_geographic_data, get_location_info
from disaster_analysis import analyze_disaster_risk_with_groq
from config import INDIA_LAT_MIN, INDIA_LAT_MAX, INDIA_LON_MIN, INDIA_LON_MAX, PORT

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


@app.get("/")
async def root():
    return {"message": "SafeRoute Natural Disaster Predictor API is Working!"}


@app.post("/predict-disaster", response_model=DisasterPrediction)
async def predict_natural_disaster(request: CoordinateRequest):
    try:
        if not (INDIA_LAT_MIN <= request.latitude <= INDIA_LAT_MAX and INDIA_LON_MIN <= request.longitude <= INDIA_LON_MAX):
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


@app.post("/buildings-emergency")
async def get_buildings_and_emergency_facilities(request: CoordinateRequest, radius: int = 1000):
    """
    Get buildings with height data and emergency facilities within a specified radius from coordinates.
    
    Args:
        request: CoordinateRequest with latitude and longitude
        radius: Radius in meters (default: 1000)
    
    Returns:
        JSON data from Overpass API containing buildings and emergency facilities
    """
    try:
        if not (INDIA_LAT_MIN <= request.latitude <= INDIA_LAT_MAX and INDIA_LON_MIN <= request.longitude <= INDIA_LON_MAX):
            raise HTTPException(
                status_code=400, detail="Coordinates must be within India")

        # Calculate bounding box for the radius
        lat_offset = radius / 111320.0  # Approximate meters per degree latitude
        lon_offset = radius / (111320.0 * abs(request.latitude) * 0.017453292519943295)  # Adjust for longitude

        south = request.latitude - lat_offset
        north = request.latitude + lat_offset
        west = request.longitude - lon_offset
        east = request.longitude + lon_offset

        # Overpass API query
        overpass_query = f"""
        [out:json][timeout:60];
        (
          // General buildings with height
          way["building"]["height"]({south},{west},{north},{east});
          relation["building"]["height"]({south},{west},{north},{east});
          
          // Emergency/medical buildings
          way["amenity"~"hospital|clinic|doctors|pharmacy|emergency"]({south},{west},{north},{east});
          node["amenity"~"hospital|clinic|doctors|pharmacy|emergency"]({south},{west},{north},{east});
          relation["amenity"~"hospital|clinic|doctors|pharmacy|emergency"]({south},{west},{north},{east});
        );
        out body geom;
        >;
        out skel qt;
        """

        # Make request to Overpass API
        overpass_url = "https://overpass-api.de/api/interpreter"
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                overpass_url,
                data=overpass_query,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Overpass API request failed: {response.text}"
                )
            
            data = response.json()
            
            # Add metadata to the response
            result = {
                "query_info": {
                    "center": {"latitude": request.latitude, "longitude": request.longitude},
                    "radius_meters": radius,
                    "bounding_box": {
                        "south": south,
                        "north": north,
                        "west": west,
                        "east": east
                    }
                },
                "data": data
            }
            
            return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_buildings_and_emergency_facilities: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch building and emergency data: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
