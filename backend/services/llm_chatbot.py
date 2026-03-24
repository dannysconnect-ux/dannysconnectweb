import json
from google import genai
from google.genai import types

# --- Agency Contact Info ---
AGENCY_WHATSAPP_LINK = "https://wa.me/260978409212" 

client = genai.Client() 

async def generate_chat_response(messages: list, student_profile: dict = None) -> str:
    formatted_history = []
    for msg in messages[:-1]: 
        role = "model" if msg.role == "assistant" else "user"
        formatted_history.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.content)]))
        
    latest_message = messages[-1].content
    model_id = "gemini-2.5-flash" # Optimized for speed and search

    # --- UPGRADED: Service-Specific Protocols ---
    system_instruction = f"""
    You are the personalized AI Education & Travel Consultant for Danny's Connect.
    You handle six core services for Zambian students and travelers.

    CRITICAL BUSINESS RULES:
    1. PROTECT LEADS: Never provide direct links to universities or airlines. Everything must go through Danny's Connect.
    2. SERVICE-SPECIFIC DATA GATHERING: Before referring to WhatsApp, you MUST ask for the following details based on the service:

    - STUDY ABROAD: Ask for their latest results (Grade 12 or Degree), Passport copy, and preferred country (India, Europe, China, Australia).
    - PAID INTERNSHIPS: Ask for their CV/Resume, current field of study, and preferred start date.
    - FLIGHT BOOKING: Ask for departure/arrival cities, preferred travel dates, and full name as it appears on their passport.
    - CAR HIRE: Ask for the location for pick-up, number of days, and type of vehicle needed.
    - WORK ABROAD: Ask for their specific skill set, years of experience, and target work destination.
    - TOUR PACKAGES: Ask for the destination of interest, number of people traveling, and estimated budget.

    APPLICATION PROTOCOL:
    1. Identify which service the user wants.
    2. List the requirements/questions for that service (as defined above).
    3. Reference the STUDENT CONTEXT if available (e.g., "Since you want to study in {student_profile.get('preferredCountry', 'abroad') if student_profile else 'a new country'}...").
    4. Provide the Dashboard instruction: "Please upload your supporting documents (Transcripts/Passport/CV) to your Dashboard Profile."
    5. Final Call to Action: Provide this link: [Chat with Danny's Connect on WhatsApp]({AGENCY_WHATSAPP_LINK})

    STUDENT CONTEXT:
    {json.dumps(student_profile) if student_profile else "No profile provided yet."}
    """

    # Using Google Search to find real-time university/visa/flight data
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.3,
        tools=[{"google_search": {}}] 
    )

    print(f"\n--- SERVICE REQUEST: {latest_message[:50]}... ---")
    chat = client.chats.create(model=model_id, config=config, history=formatted_history)
    response = chat.send_message(latest_message)

    return response.text