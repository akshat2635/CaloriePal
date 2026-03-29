import os
import mimetypes

# Fix for Windows MIME types issue with static files
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("image/svg+xml", ".svg")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import get_settings
from app.api.routes import router
from app.database import engine, ensure_schema_compatibility
from app.models.db_models import Base

# Create database tables
Base.metadata.create_all(bind=engine)
ensure_schema_compatibility()

# Initialize FastAPI app
settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    description="AI-powered calorie tracking with natural language processing",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router
app.include_router(router, prefix="/api")

# Serve frontend static files
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")

if os.path.isdir(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.api_route("/{path_name:path}", methods=["GET"])
    async def catch_all(path_name: str):
        if path_name.startswith("api/"):
            return {"error": "Endpoint not found"}
            
        # Check if the requested file actually exists in dist (e.g., vite.svg, favicon.ico)
        file_path = os.path.join(frontend_dist, path_name)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        # Fallback to index.html for React Router
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        return {"error": "Frontend build not found"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
