import os
import logging
import json
import time
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not supabase:
        return {"id": "memory_user"}
    try:
        res = supabase.auth.get_user(credentials.credentials)
        if res and res.user:
            return res.user
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication error: {e}")

# ==========================================
# Casing Translation Layer (React camelCase <-> PostgreSQL snake_case)
# ==========================================
def camel_to_snake(name: str) -> str:
    import re
    return re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()

def snake_to_camel(name: str) -> str:
    components = name.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

def map_keys_to_snake(data: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(data, dict):
        return data
    return {camel_to_snake(k): v for k, v in data.items()}

def map_keys_to_camel(data: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(data, dict):
        return data
    return {snake_to_camel(k): v for k, v in data.items()}


@app.get("/")
def root():
    status = "Connected to Supabase" if supabase else "In-Memory Fallback Mode"
    return {"message": "CareerTrack API is running", "database_status": status}


@app.post("/analyze-job")
async def analyze_job(file: UploadFile = File(...), user=Depends(get_current_user)):
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
async def get_applications(user=Depends(get_current_user)):
    user_id = getattr(user, 'id', user.get("id")) if isinstance(user, dict) else user.id
    if supabase:
        try:
            res = supabase.table("applications").select("*").eq("user_id", user_id).execute()
            # Translate keys back to camelCase for React
            return [map_keys_to_camel(app) for app in res.data]
        except Exception as e:
            logger.error(f"Supabase GET applications failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    return memory_applications


@app.post("/api/applications")
async def create_application(app_data: Dict[str, Any], user=Depends(get_current_user)):
    user_id = getattr(user, 'id', user.get("id")) if isinstance(user, dict) else user.id
    if supabase:
        try:
            # Translate keys to snake_case for PostgreSQL
            snake_data = map_keys_to_snake(app_data)
            snake_data["user_id"] = user_id
            res = supabase.table("applications").insert(snake_data).execute()
            return map_keys_to_camel(res.data[0]) if res.data else app_data
        except Exception as e:
            logger.error(f"Supabase POST application failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    else:
        memory_applications.insert(0, app_data)
        return app_data


@app.put("/api/applications/{app_id}")
async def update_application(app_id: str, app_data: Dict[str, Any], user=Depends(get_current_user)):
    user_id = getattr(user, 'id', user.get("id")) if isinstance(user, dict) else user.id
    if supabase:
        try:
            snake_data = map_keys_to_snake(app_data)
            res = supabase.table("applications").update(snake_data).eq("id", app_id).eq("user_id", user_id).execute()
            return map_keys_to_camel(res.data[0]) if res.data else app_data
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
async def delete_application(app_id: str, user=Depends(get_current_user)):
    user_id = getattr(user, 'id', user.get("id")) if isinstance(user, dict) else user.id
    if supabase:
        try:
            supabase.table("applications").delete().eq("id", app_id).eq("user_id", user_id).execute()
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
async def get_profile(user=Depends(get_current_user)):
    user_id = getattr(user, 'id', user.get("id")) if isinstance(user, dict) else user.id
    if supabase:
        try:
            res = supabase.table("profiles").select("*").eq("id", user_id).execute()
            if res.data:
                return map_keys_to_camel(res.data[0])
            raise HTTPException(status_code=404, detail="Profile not found")
        except Exception as e:
            if isinstance(e, HTTPException): raise e
            logger.error(f"Supabase GET profile failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    return memory_profile


@app.put("/api/profile")
async def update_profile(profile_data: Dict[str, Any], user=Depends(get_current_user)):
    user_id = getattr(user, 'id', user.get("id")) if isinstance(user, dict) else user.id
    profile_data["id"] = user_id
    if supabase:
        try:
            snake_data = map_keys_to_snake(profile_data)
            res = supabase.table("profiles").upsert(snake_data).execute()
            return map_keys_to_camel(res.data[0]) if res.data else profile_data
        except Exception as e:
            logger.error(f"Supabase PUT profile failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    else:
        global memory_profile
        memory_profile = profile_data
        return profile_data


# ==========================================
# FastAPI AI Resume Parser (PDF -> Structured JSON)
# ==========================================
from pypdf import PdfReader
import io

@app.post("/api/parse-resume")
async def parse_resume(file: UploadFile = File(...), user=Depends(get_current_user)):
    file_bytes = await file.read()
    try:
        # Load PDF using pypdf reader
        pdf_file = io.BytesIO(file_bytes)
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
            
        if not text.strip():
            raise HTTPException(
                status_code=400, 
                detail="Could not extract text from PDF resume. The PDF might be scanned or empty."
            )
            
        # Structure the extraction prompt
        prompt = """
        You are an expert resume parser. Analyze this resume text and extract the details.
        
        Return a raw JSON object with the following fields:
        {
          "name": "Full Name",
          "email": "Email address",
          "phone": "Phone number",
          "website": "Personal website or LinkedIn URL",
          "resumeName": "Name of the resume file",
          "resumeStatus": "Successfully parsed CV.",
          "skills": [
            {"name": "Skill A", "confidence": 90},
            {"name": "Skill B", "confidence": 80}
          ],
          "education": [
            {"id": "edu1", "degree": "Degree name", "school": "School/University", "year": "Duration years"}
          ],
          "experience": [
            {
              "id": "exp1",
              "company": "Company Name",
              "role": "Role Title",
              "duration": "Duration years",
              "bullets": ["Achievement 1", "Achievement 2"]
            }
          ],
          "projects": [
            {
              "id": "proj1",
              "title": "Project Title",
              "role": "Your role in project",
              "tech": ["tech1", "tech2"],
              "description": "Short description of project"
            }
          ]
        }
        
        Only extract information present in the text. Return ONLY this JSON block. Do not include markdown code block formatting (like ```json ... ```).
        """
        
        import google.generativeai as genai
        gemini_key = os.getenv("GEMINI_API_KEY")
        
        if gemini_key:
            genai.configure(api_key=gemini_key)
            logger.info("Parsing resume text using Gemini...")
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content([prompt, f"Resume content:\n\n{text}"])
            res_text = response.text.strip()
        else:
            raise HTTPException(status_code=400, detail="No active AI provider is configured in environment.")
            
        # Clean markdown formatting if present
        if res_text.startswith("```json"):
            res_text = res_text[7:]
        if res_text.endswith("```"):
            res_text = res_text[:-3]
        res_text = res_text.strip()
        
        parsed_json = json.loads(res_text)
        
        # Inject standard parsed metadata fields
        parsed_json["resumeName"] = file.filename
        parsed_json["resumeStatus"] = "Uploaded and parsed successfully via AI."
        
        # Ensure array IDs are present
        for idx, edu in enumerate(parsed_json.get("education", [])):
            if "id" not in edu:
                edu["id"] = f"edu-{idx}-{int(time.time())}"
        for idx, exp in enumerate(parsed_json.get("experience", [])):
            if "id" not in exp:
                exp["id"] = f"exp-{idx}-{int(time.time())}"
        for idx, proj in enumerate(parsed_json.get("projects", [])):
            if "id" not in proj:
                proj["id"] = f"proj-{idx}-{int(time.time())}"
                
        return parsed_json
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        logger.error(f"Resume parsing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse resume PDF: {str(e)}")
