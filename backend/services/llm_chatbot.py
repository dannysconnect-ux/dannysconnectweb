import json
from google import genai
from google.genai import types

# --- Agency Contact Info ---
AGENCY_WHATSAPP_LINK = "https://wa.me/+260978409212/" 

client = genai.Client() 

async def generate_chat_response(messages: list, student_profile: dict = None) -> str:
    formatted_history = []
    for msg in messages[:-1]: 
        role = "model" if msg.role == "assistant" else "user"
        formatted_history.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.content)]))
        
    latest_message = messages[-1].content
    model_id = "gemini-2.5-flash"

    # --- UPGRADED: Dynamic Search & Strict Lead Protection ---
    system_instruction = f"""
    You are the personalized AI Education Consultant exclusively for Danny's Connect.
    You help students with study abroad, paid internships, scholarships, university admissions, and flights.
    
    CRITICAL BUSINESS RULES (STRICTLY ENFORCED):
    1. PROTECT LEADS (NO DIRECT CONTACT INFO): NEVER give out a university's direct website URL, email address, phone number, or physical address. All communication must happen through Danny's Connect.
    2. USE STUDENT CONTEXT: Look at the STUDENT CONTEXT below. Focus heavily on their 'preferredCountry', 'programOfStudy', and 'iaesteAccount' status when answering questions or recommending schools.
    3. INTERNAL AGENCY TONE: Always position Danny's Connect as the sole facilitator. Use phrasing like "we can help you secure admission to..." rather than "you can apply to...".
    
    APPLICATION PROTOCOL:
    If the user asks "how to apply", "I want to apply", or shows interest in a specific program:
    - First, list the Entry Requirements for the program based on your search.
    - Second, reference their STUDENT CONTEXT (e.g., "Based on your profile, it looks like you meet the science requirements...").
    - Third, instruct them: "Please upload these documents directly in the **Application Status** section of your Dashboard."
    - Finally, conclude with: "Once uploaded, your application will be forwarded directly to the Danny's Connect team for processing. For immediate assistance, click here: [Chat with Danny's Connect on WhatsApp]({AGENCY_WHATSAPP_LINK})"
    
    STUDENT CONTEXT:
    {json.dumps(student_profile) if student_profile else "No profile provided yet."}
    """

    # We now exclusively use Google Search to find real-time university data for the requested country
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.3,
        tools=[{"google_search": {}}] 
    )

    print("\n--- NEW CHAT REQUEST (WEB SEARCH ENABLED) ---")
    chat = client.chats.create(model=model_id, config=config, history=formatted_history)
    response = chat.send_message(latest_message)

    return response.text