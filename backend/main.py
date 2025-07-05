from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
 
app = FastAPI(
    title="SafeRoute API",
    description="A simple FastAPI server for SafeRoute",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint that returns a welcome message"""
    return {"message": "Welcome to SafeRoute API"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "SafeRoute API"}

@app.get("/api/v1/routes")
async def get_routes():
    """Get available routes"""
    return {
        "routes": [
            {"id": 1, "name": "Route A", "distance": "5.2 km", "safety_score": 8.5},
            {"id": 2, "name": "Route B", "distance": "4.8 km", "safety_score": 7.2},
            {"id": 3, "name": "Route C", "distance": "6.1 km", "safety_score": 9.1}
        ]
    }

@app.post("/api/v1/routes/calculate")
async def calculate_route(start: str, end: str):
    """Calculate a route between two points"""
    return {
        "start": start,
        "end": end,
        "distance": "5.5 km",
        "estimated_time": "12 minutes",
        "safety_score": 8.3,
        "route": f"Route from {start} to {end}"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)