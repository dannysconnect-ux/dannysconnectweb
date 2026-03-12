import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables (.env file)
load_dotenv()

from services.llm_chatbot import generate_chat_response

app = FastAPI(title="Danny's Connect AI Backend")

# Allow your React frontend to communicate with this backend
# Allow your React frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",          # Local development
        "https://dannysconnect.com",      # Live website
        "https://www.dannysconnect.com"   # Live website (www version)
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models for Data Validation
class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class MatchRequest(BaseModel):
    student_profile: dict
    
class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    student_profile: Optional[dict] = None

# --- AI Match Engine Schemas ---
class UniversityMatch(BaseModel):
    university: str = Field(description="Name of the university in the preferred country")
    program: str = Field(description="The specific program matching the student's interest")
    scholarship: str = Field(description="Available scholarships, financial aid, or internship info")
    success_rate: int = Field(description="Calculated success rate percentage (0-100) based on student profile and budget")
    reason: str = Field(description="A personalized reason why this is a good match for the student")

class MatchResponseList(BaseModel):
    matches: List[UniversityMatch]


@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Receives chat history and student profile from React,
    processes it through the Gemini Engine, and returns the response.
    """
    try:
        if not request.messages:
            raise HTTPException(status_code=400, detail="Messages array cannot be empty")

        # Call the LLM Service
        ai_response = await generate_chat_response(
            messages=request.messages,
            student_profile=request.student_profile
        )

        return {"status": "success", "response": ai_response}
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.post("/api/matches")
async def get_matches(request: MatchRequest):
    """
    AI MATCHING ENGINE: Uses Gemini Structured Outputs to dynamically find universities.
    """
    profile = request.student_profile
    country = profile.get("preferredCountry", "Any Country")
    program = profile.get("programOfStudy", "Any Program")
    budget = profile.get("budget", "Not specified")
    iaeste = profile.get("iaesteAccount", "No")
    
    prompt = f"""
    You are an expert AI Education Matchmaker. 
    Based on the following student profile, find 3 real universities in {country} that offer programs related to {program} 
    and fit a budget of {budget}.
    
    Calculate a realistic 'success_rate' (0-100) based on standard international admission odds.
    Identify any known 'scholarship' opportunities for international students at these universities.
    If the student has an IAESTE account ({iaeste}), factor in internship opportunities into your reasoning.
    
    Student Profile: {json.dumps(profile)}
    """
    
    try:
        print(f"🔍 [MATCH ENGINE] Finding universities in {country} for {program}...")
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=MatchResponseList,
                temperature=0.2, 
                # ❌ REMOVED tools=[{"google_search": {}}] to fix the 400 Error
            ),
        )
        
        matches_data = json.loads(response.text)
        print("✅ [MATCH ENGINE] Successfully generated personalized matches!")
        return matches_data
        
    except Exception as e:
        print(f"❌ Error generating matches: {str(e)}")
        # Return empty list instead of crashing the frontend
        return {"matches": []}
        
@app.get("/")
def read_root():
    return {"message": "Danny's Connect AI API is running!"}