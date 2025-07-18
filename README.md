# SafeRoute 🛡️

A comprehensive disaster prediction and emergency response application that helps users assess natural disaster risks and find safe routes to emergency facilities.

## 🌟 Features

- **AI-Powered Disaster Prediction**: Uses Groq AI and machine learning to analyze weather, geographic, and environmental data to predict natural disaster risks
- **Real-time Risk Assessment**: Provides probability scores and risk levels for various types of natural disasters
- **Interactive Map Interface**: Built with React-Leaflet for intuitive location selection and route visualization
- **Emergency Facility Finder**: Locates nearby hospitals, shelters, and emergency services with intelligent AI-powered facility selection
- **Smart Route Planning**: Calculates optimal routes to emergency facilities based on disaster type and severity
- **AI Chatbot Assistant**: Provides disaster preparedness advice, safety measures, and emergency procedures
- **Mobile Support**: Capacitor-enabled for Android deployment
- **India-Focused**: Specifically designed for locations within India's geographic boundaries

## 🏗️ Architecture

### Backend (FastAPI)
- **API Server**: FastAPI-based REST API with CORS support
- **Disaster Analysis**: Groq AI integration with rule-based fallback system
- **Weather Service**: Real-time weather data integration
- **Geographic Service**: Elevation, terrain, and location data processing
- **Data Models**: Pydantic models for type-safe API contracts

### Frontend (React + TypeScript)
- **Modern React**: Built with React 19 and TypeScript
- **Interactive Maps**: Leaflet and React-Leaflet for map visualization
- **Routing**: Leaflet Routing Machine for route calculation
- **UI Framework**: TailwindCSS + DaisyUI for responsive design
- **State Management**: React Context for location management
- **Mobile Ready**: Capacitor for cross-platform deployment

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Groq API Key (for AI features)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**
   Create a `.env` file with your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run the server**
   ```bash
   # Using the provided script
   ./run.sh
   
   # Or manually
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env` file:
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📱 Mobile Development

### Android Setup
```bash
# Build the web app
npm run build

# Add Android platform
npx cap add android

# Copy web assets
npx cap copy

# Open in Android Studio
npx cap open android
```

## 🔧 Configuration

### API Keys Required

1. **Groq API Key**
   - Visit [Groq Console](https://console.groq.com/keys)
   - Create account and generate API key
   - Used for AI disaster analysis and chatbot features

2. **Optional Services**
   - Weather API services (configured in backend)
   - Geographic data services

### Environment Variables

**Backend (.env)**
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=8000
```

**Frontend (.env)**
```env
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_API_BASE_URL=http://localhost:8000
```

## 🔍 How It Works

1. **Location Selection**: User selects a location on the interactive map
2. **Data Collection**: System gathers weather, geographic, and environmental data
3. **AI Analysis**: Groq AI analyzes the data to predict disaster risks
4. **Risk Assessment**: Provides probability scores and recommendations
5. **Emergency Planning**: Shows nearby emergency facilities and optimal routes
6. **Interactive Assistance**: AI chatbot provides additional guidance and support

## 🛠️ API Endpoints

### Main Endpoints
- `GET /` - Health check
- `POST /predict-disaster` - Main disaster prediction endpoint

### Request Format
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

### Response Format
```json
{
  "geographic_data": {
    "elevation": 216,
    "terrain_type": "urban"
  },
  "analysis": {
    "probability": 0.15,
    "risk_level": "Low",
    "primary_threats": ["flooding", "heatwave"],
    "recommendations": [
      "Monitor weather conditions",
      "Prepare emergency kit"
    ]
  },
  "location_info": {
    "city": "New Delhi",
    "state": "Delhi",
    "country": "India"
  }
}
```

## 🧪 Testing

Run the test file to verify backend functionality:
```bash
python test.py
```

## 📦 Dependencies

### Backend
- **FastAPI**: Modern web framework for building APIs
- **Groq**: AI/ML API for disaster analysis
- **HTTPX**: Async HTTP client for external API calls
- **Uvicorn**: ASGI server for production deployment

### Frontend
- **React**: UI library with hooks and context
- **TypeScript**: Type-safe JavaScript development
- **Leaflet**: Interactive map library
- **TailwindCSS**: Utility-first CSS framework
- **Capacitor**: Cross-platform mobile development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For support and questions:
- Check the setup guides in the `/frontend/` directory
- Review the API documentation
- Create an issue for bugs or feature requests

## 🔮 Future Enhancements

- Real-time disaster alerts and notifications
- Multi-language support
- Advanced ML models for improved prediction accuracy
- Integration with government emergency services
- Offline mode capabilities
- Enhanced mobile features and push notifications

---

**SafeRoute** - Keeping communities safe through intelligent disaster prediction and emergency response planning.