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

DEFAULT_PROFILE = {
    "id": "cristine",
    "name": "Cristine Bennett",
    "email": "cristine.bennett@example.com",
    "phone": "(503) 555-0182",
    "website": "https://cristinecodes.dev",
    "resume_name": "cristine_cv_2026.pdf",
    "resume_status": "Uploaded and parsed successfully on July 10, 2026",
    "skills": [
        {"name": "React", "confidence": 90},
        {"name": "TypeScript", "confidence": 85},
        {"name": "JavaScript", "confidence": 90},
        {"name": "CSS", "confidence": 95},
        {"name": "HTML5", "confidence": 95},
        {"name": "Git", "confidence": 85},
        {"name": "Responsive Design", "confidence": 90},
        {"name": "REST APIs", "confidence": 80},
        {"name": "Figma", "confidence": 75},
        {"name": "UI Design", "confidence": 70}
    ],
    "education": [
        {"id": "edu-1", "degree": "B.S. in Computer Science", "school": "Oregon State University", "year": "2022 - 2025"}
    ],
    "experience": [
        {
            "id": "exp-1",
            "company": "Cloverfield Media",
            "role": "Junior Web Developer",
            "duration": "Nov 2025 - Present",
            "bullets": [
                "Maintained and styled responsive client websites using HTML, React, and Vanilla CSS.",
                "Collaborated with designers to convert Figma visual specs into modular frontend components.",
                "Improved website loading performance by optimizing images and refactoring CSS files."
            ]
        }
    ],
    "projects": []
}

@app.get("/api/profile")
async def get_profile():
    if supabase:
        try:
            res = supabase.table("profiles").select("*").eq("id", "cristine").execute()
            if res.data:
                return res.data[0]
            
            # Self-seeding: If profile doesn't exist in Supabase, create it automatically
            logger.info("Profile row 'cristine' not found in Supabase. Auto-seeding default profile data...")
            seed_res = supabase.table("profiles").insert(DEFAULT_PROFILE).execute()
            if seed_res.data:
                return seed_res.data[0]
            raise HTTPException(status_code=500, detail="Failed to auto-seed profile row.")
        except Exception as e:
            logger.error(f"Supabase GET/SEED profile failed: {e}")
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
