import sys
import os

# Add the backend directory to the Python path
# This allows 'from db import ...' style imports in main.py to work correctly
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from main import app

# Vercel's Python runtime expects 'app' to be the FastAPI instance
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
