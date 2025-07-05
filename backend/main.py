from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from models import CoordinateRequest, DisasterPrediction
from weather_service import get_weather_data
from geographic_service import get_geographic_data, get_location_info
from disaster_analysis import analyze_disaster_risk_with_groq
from config import INDIA_LAT_MIN, INDIA_LAT_MAX, INDIA_LON_MIN, INDIA_LON_MAX

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
