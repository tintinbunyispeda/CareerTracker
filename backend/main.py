import os
import logging
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

from services.ai_services import analyze_job_screenshot

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

app = FastAPI()

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Optional[Client] = None

# In-memory fallback stores if Supabase credentials are empty
memory_applications: List[Dict[str, Any]] = []
memory_profile: Dict[str, Any] = {}

if supabase_url and supabase_key and "your_supabase" not in supabase_url:
    try:
        supabase = create_client(supabase_url, supabase_key)
        logger.info("Successfully connected to Supabase database.")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}. Falling back to memory mode.")
else:
    logger.warning("Supabase URL/Key is missing in .env. Operating in memory fallback mode.")


@app.get("/")
def root():
    status = "Connected to Supabase" if supabase else "In-Memory Fallback Mode"
    return {"message": "CareerTrack API is running", "database_status": status}


@app.post("/analyze-job")
async def analyze_job(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result = analyze_job_screenshot(
        image_bytes=image_bytes,
        content_type=file.content_type or "image/jpeg",
    )
    return {"analysis": result}


# ==========================================
# FastAPI CRUD Endpoints for Applications
# ==========================================

@app.get("/api/applications")
async def get_applications():
    if supabase:
        try:
            res = supabase.table("applications").select("*").execute()
            # Sort manually or default by date
            return res.data
        except Exception as e:
            logger.error(f"Supabase GET applications failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    return memory_applications


@app.post("/api/applications")
async def create_application(app_data: Dict[str, Any]):
    if supabase:
        try:
            res = supabase.table("applications").insert(app_data).execute()
            return res.data[0] if res.data else app_data
        except Exception as e:
            logger.error(f"Supabase POST application failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    else:
        memory_applications.insert(0, app_data)
        return app_data


@app.put("/api/applications/{app_id}")
async def update_application(app_id: str, app_data: Dict[str, Any]):
    if supabase:
        try:
            res = supabase.table("applications").update(app_data).eq("id", app_id).execute()
            return res.data[0] if res.data else app_data
        except Exception as e:
            logger.error(f"Supabase PUT application failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    else:
        for idx, app in enumerate(memory_applications):
            if app.get("id") == app_id:
                memory_applications[idx] = app_data
                return app_data
        raise HTTPException(status_code=404, detail="Application not found")


@app.delete("/api/applications/{app_id}")
async def delete_application(app_id: str):
    if supabase:
        try:
            supabase.table("applications").delete().eq("id", app_id).execute()
            return {"message": "Success"}
        except Exception as e:
            logger.error(f"Supabase DELETE application failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    else:
        global memory_applications
        memory_applications = [app for app in memory_applications if app.get("id") != app_id]
        return {"message": "Success"}


# ==========================================
# FastAPI Endpoints for User Profile
# ==========================================

@app.get("/api/profile")
async def get_profile():
    if supabase:
        try:
            res = supabase.table("profiles").select("*").eq("id", "cristine").execute()
            if res.data:
                return res.data[0]
            # If database is connected but row doesn't exist, we return 404
            raise HTTPException(status_code=404, detail="Profile not found in Supabase. Please run seed script.")
        except Exception as e:
            logger.error(f"Supabase GET profile failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    return memory_profile


@app.put("/api/profile")
async def update_profile(profile_data: Dict[str, Any]):
    profile_data["id"] = "cristine" # Hardcoded default user identifier for single profile MVP
    if supabase:
        try:
            res = supabase.table("profiles").upsert(profile_data).execute()
            return res.data[0] if res.data else profile_data
        except Exception as e:
            logger.error(f"Supabase PUT profile failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    else:
        global memory_profile
        memory_profile = profile_data
        return profile_data
