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
            # Translate keys back to camelCase for React
            return [map_keys_to_camel(app) for app in res.data]
        except Exception as e:
            logger.error(f"Supabase GET applications failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    return memory_applications


@app.post("/api/applications")
async def create_application(app_data: Dict[str, Any]):
    if supabase:
        try:
            # Translate keys to snake_case for PostgreSQL
            snake_data = map_keys_to_snake(app_data)
            res = supabase.table("applications").insert(snake_data).execute()
            return map_keys_to_camel(res.data[0]) if res.data else app_data
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
            # Translate keys to snake_case for PostgreSQL
            snake_data = map_keys_to_snake(app_data)
            res = supabase.table("applications").update(snake_data).eq("id", app_id).execute()
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
async def delete_application(app_id: str):
    if supabase:
        try:
            # Since app_id is a primary key, it does not need translation
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
                return map_keys_to_camel(res.data[0])
            
            # Self-seeding: If profile doesn't exist in Supabase, create it automatically
            logger.info("Profile row 'cristine' not found in Supabase. Auto-seeding default profile data...")
            snake_seed = map_keys_to_snake(DEFAULT_PROFILE)
            seed_res = supabase.table("profiles").insert(snake_seed).execute()
            if seed_res.data:
                return map_keys_to_camel(seed_res.data[0])
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
async def parse_resume(file: UploadFile = File(...)):
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
        
        ai_provider = os.getenv("AI_PROVIDER", "gemini").lower()
        res_text = ""
        
        if ai_provider == "gemini" and gemini_key:
            logger.info("Parsing resume text using Gemini (FREE)...")
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content([prompt, f"Resume content:\n\n{text}"])
            res_text = response.text.strip()
        elif ai_provider == "openai" and client:
            logger.info("Parsing resume text using OpenAI...")
            response = client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                messages=[
                    {
                        "role": "user",
                        "content": f"{prompt}\n\nResume content:\n\n{text}"
                    }
                ],
                response_format={"type": "json_object"}
            )
            res_text = response.choices[0].message.content or "{}"
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
        logger.error(f"Resume parsing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse resume PDF: {str(e)}")
