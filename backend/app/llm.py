import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Initialize the client. It will automatically look for GEMINI_API_KEY in the environment.
api_key = os.getenv("GEMINI_API_KEY")

def analyze_email_content(subject: str, body: str) -> str:
    """Passes the raw email text to Google Gemini to generate a security analyst report."""
    if not api_key or api_key == "YOUR_GEMINI_API_KEY_HERE":
        return "LLM integration is ready! However, the GEMINI_API_KEY is missing from backend/.env. Please paste your key there and restart the server to see the AI's natural language analysis."
        
    try:
        genai.configure(api_key=api_key)
        # Using the brand new Gemini-2.5 architectural release to sidestep all older v1beta closures
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""
        You are an elite Cybersecurity Email Analyst. 
        Review the following email Subject and Body text. 
        Keep your response concise (maximum 3 sentences). 
        Explain if this looks like a phishing attempt through its language (e.g. creating panic, asking for passwords, suspicious generic greetings). 
        If it looks normal, just say it appears to use normal professional or casual language.

        Subject: {subject}
        Body Text: {body[:1500]} 
        """
        
        # Call Google Gemini API
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Google Gemini API Error: {str(e)}"
