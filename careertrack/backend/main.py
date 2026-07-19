from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from services.ai_services import analyze_job_screenshot

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "CareerTrack API is running"}


@app.post("/analyze-job")
async def analyze_job(file: UploadFile = File(...)):
    image_bytes = await file.read()

    result = analyze_job_screenshot(
        image_bytes=image_bytes,
        content_type=file.content_type or "image/jpeg",
    )

    return {"analysis": result}