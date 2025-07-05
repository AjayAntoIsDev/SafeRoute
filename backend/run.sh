#!/bin/bash
# Development server startup script
echo "Starting SafeRoute FastAPI server..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
