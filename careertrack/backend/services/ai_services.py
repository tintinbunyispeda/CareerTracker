import os
import base64

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def analyze_job_screenshot(image_bytes: bytes, content_type: str):
    encoded_image = base64.b64encode(image_bytes).decode("utf-8")

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": """
Analyze this job vacancy screenshot.

Extract only information that is actually visible in the screenshot.
Do not invent missing information.

Return:
- job title
- company
- location
- work arrangement
- employment type
- salary
- deadline
- duration
- responsibilities
- requirements
- required skills
- preferred skills
- benefits

If information is unavailable, mark it as Not specified.
""",
                    },
                    {
                        "type": "input_image",
                        "image_url": f"data:{content_type};base64,{encoded_image}",
                    },
                ],
            }
        ],
    )

    return response.output_text