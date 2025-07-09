# Groq API Setup for SafeRoute Chatbot

## Getting Started

The SafeRoute application includes an AI-powered chatbot that helps users get information about disaster preparedness, safety measures, and risk assessment. The chatbot is powered by Groq's API.

## Setup Instructions

1. **Get a Groq API Key**
   - Visit [https://console.groq.com/keys](https://console.groq.com/keys)
   - Sign up for a free account
   - Create a new API key

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env` in the frontend directory
   - Replace `your-groq-api-key-here` with your actual Groq API key

3. **Features**
   - The chatbot is available in the disaster detail view
   - Users can ask questions about:
     - Disaster preparation and safety measures
     - Risk assessment and current threat levels
     - Emergency procedures and evacuation plans
     - Specific recommendations for the selected disaster type

## Fallback Mode

If no Groq API key is provided, the chatbot will operate in "demo mode" with basic pre-programmed responses based on the disaster data. While functional, the full AI-powered experience requires a valid API key.

## API Usage

The chatbot uses the `llama3-8b-8192` model through Groq's API for:
- Natural language understanding
- Context-aware responses
- Disaster-specific advice
- Real-time Q&A capabilities

## Security Note

The API key is configured for browser use with `dangerouslyAllowBrowser: true`. In a production environment, consider implementing a backend proxy to handle API calls securely.
