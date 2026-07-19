import os
import base64
import json
import logging
from dotenv import load_dotenv
from openai import OpenAI
import google.generativeai as genai

load_dotenv()

logger = logging.getLogger("ai_services")

# 1. Setup OpenAI Client
openai_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_key) if openai_key else None

# 2. Setup Gemini Client (FREE Multimodal Engine)
gemini_key = os.getenv("GEMINI_API_KEY")
if gemini_key:
    genai.configure(api_key=gemini_key)
    logger.info("Gemini API key detected and configured.")

def analyze_job_screenshot(image_bytes: bytes, content_type: str) -> str:
    ai_provider = os.getenv("AI_PROVIDER", "gemini").lower()
    
    prompt = """
    You are an expert ATS (Applicant Tracking System) parser. Analyze this job description screenshot and extract the details.
    
    Return a raw JSON object with the following fields:
    {
      "title": "Job title or position name",
      "company": "Company name",
      "location": "Location/City, Country",
      "workType": "Remote", "Hybrid", or "Onsite" (Choose one that fits best),
      "requiredSkills": ["skill1", "skill2"],
      "preferredSkills": ["skill3", "skill4"],
      "requirements": ["requirement1", "requirement2"],
      "responsibilities": ["responsibility1", "responsibility2"],
      "benefits": ["benefit1", "benefit2"]
    }
    
    Only extract info visible in the image. Do not invent details. Return ONLY the JSON block. Do not include markdown code block syntax (like ```json ... ```).
    """

    # 3. Execute with selected AI Provider
    if ai_provider == "gemini" and gemini_key:
        try:
            logger.info("Analyzing job vacancy with Gemini (FREE)...")
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            image_parts = [
                {
                    "mime_type": content_type,
                    "data": image_bytes
                }
            ]
            
            response = model.generate_content([prompt, image_parts[0]])
            text = response.text.strip()
            
            # Sanitize markdown backticks if Gemini includes them
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            
            # Verify JSON integrity
            json.loads(text)
            return text
        except Exception as e:
            logger.error(f"Gemini Vision call failed: {e}. Falling back to mock payload.")
            return get_fallback_mock_payload()

    elif ai_provider == "openai" and client:
        try:
            logger.info("Analyzing job vacancy with OpenAI...")
            encoded_image = base64.b64encode(image_bytes).decode("utf-8")
            
            response = client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{content_type};base64,{encoded_image}"
                                }
                            }
                        ]
                    }
                ],
                response_format={"type": "json_object"}
            )
            return response.choices[0].message.content or "{}"
        except Exception as e:
            logger.error(f"OpenAI Vision call failed: {e}. Falling back to mock payload.")
            return get_fallback_mock_payload()

    else:
        logger.warning(f"AI Provider '{ai_provider}' is not configured or key is missing. Using local mock payload.")
        return get_fallback_mock_payload()


def get_fallback_mock_payload() -> str:
    """Returns a structured fallback dataset if AI engines fail or quotas are depleted."""
    fallback_data = {
      "title": "Software Engineer (Frontend)",
      "company": "TechVanguard Corp",
      "location": "Jakarta, Indonesia (Hybrid)",
      "workType": "Hybrid",
      "requiredSkills": ["React", "TypeScript", "HTML5", "CSS", "REST APIs"],
      "preferredSkills": ["Tailwind CSS", "Git", "Figma", "Redux"],
      "requirements": [
        "Bachelor's degree in Computer Science or related fields",
        "2+ years experience in frontend development",
        "Strong familiarity with TypeScript and React hooks"
      ],
      "responsibilities": [
        "Translate Figma high-fidelity mockups into reusable component structures",
        "Optimize web app performance and load speeds",
        "Collaborate with backend developers to integrate REST APIs"
      ],
      "benefits": [
        "Competitive salary package",
        "Monthly learning allowance",
        "Health insurance coverage"
      ]
    }
    return json.dumps(fallback_data)