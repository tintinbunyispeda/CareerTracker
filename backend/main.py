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
    "name": "Cristine Valentina",
    "email": "cristine.valentina@student.president.ac.id",
    "phone": "+62 898 002 3047",
    "website": "linkedin.com/in/cristine-valentina",
    "resume_name": "cristine_cv_2026.pdf",
    "resume_status": "Successfully parsed CV from local database seed.",
    "skills": [
        {"name": "JavaScript", "confidence": 95},
        {"name": "TypeScript", "confidence": 90},
        {"name": "Python", "confidence": 90},
        {"name": "Java", "confidence": 75},
        {"name": "SQL", "confidence": 85},
        {"name": "HTML", "confidence": 95},
        {"name": "CSS", "confidence": 90},
        {"name": "React", "confidence": 90},
        {"name": "FastAPI", "confidence": 90},
        {"name": "REST APIs", "confidence": 90},
        {"name": "PostgreSQL", "confidence": 85},
        {"name": "MySQL", "confidence": 80},
        {"name": "Supabase", "confidence": 90},
        {"name": "Machine Learning", "confidence": 85},
        {"name": "Computer Vision", "confidence": 85},
        {"name": "YOLOv8", "confidence": 80},
        {"name": "NLP", "confidence": 75},
        {"name": "Git", "confidence": 90},
        {"name": "GitHub", "confidence": 90},
        {"name": "VS Code", "confidence": 95},
        {"name": "Google Colab", "confidence": 85},
        {"name": "Vercel", "confidence": 85}
    ],
    "education": [
        {
            "id": "edu-1",
            "degree": "B.Sc. in Informatics (Artificial Intelligence Concentration)",
            "school": "President University",
            "year": "Sep 2024 - Present"
        }
    ],
    "experience": [
        {
            "id": "exp-1",
            "company": "Internship & Career Center (ICC), President University",
            "role": "Talent Acquisition",
            "duration": "Nov 2025 - Dec 2025",
            "bullets": [
                "Reviewed 1,000+ student resumes against career-readiness standards, identifying improvements in content, structure, and presentation for internship and job applications.",
                "Evaluated student projects, achievements, and experiences to assess candidate qualifications against ICC resume standards."
            ]
        }
    ],
    "projects": [
        {
            "id": "proj-1",
            "title": "CAREERTRACK",
            "role": "Project Owner & Frontend Developer",
            "tech": ["React", "TypeScript", "FastAPI", "Supabase"],
            "description": "Developed a responsive personal platform for tracking job applications, recruitment stages, deadlines, follow-ups, and career insights. Built and customized reusable React and TypeScript components. Currently developing database integration."
        },
        {
            "id": "proj-2",
            "title": "BRAINFOCUS AI",
            "role": "Computer Vision Developer",
            "tech": ["Python", "Computer Vision", "Face Recognition", "Git"],
            "description": "Developed a facial recognition prototype using collected face datasets. Integrated the computer vision workflow from Google Colab prototype into the web application."
        },
        {
            "id": "proj-3",
            "title": "CALORIEVISION",
            "role": "Backend & Integration Developer",
            "tech": ["Python", "FastAPI", "YOLOv8", "React", "TypeScript"],
            "description": "Developed backend logic to automatically aggregate calorie estimates. Integrated YOLOv8 detection outputs for Live Mode and real-time detection results."
        },
        {
            "id": "proj-4",
            "title": "PACKWISE AI",
            "role": "ML Recommendation Developer",
            "tech": ["Python", "Machine Learning", "Random Forest", "XGBoost", "Supabase"],
            "description": "Designed a packaging recommendation pipeline and trained Random Forest/XGBoost models. Evaluated recommendation models using accuracy, precision, and recall."
        }
    ]
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
