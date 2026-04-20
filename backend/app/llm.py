import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialize the client. It will automatically look for OPENAI_API_KEY in the environment.
api_key = os.getenv("OPENAI_API_KEY")

def analyze_email_content(subject: str, body: str) -> str:
    """Passes the raw email text to OpenAI to generate a security analyst report."""
    if not api_key or api_key == "YOUR_OPENAI_API_KEY_HERE":
        return "LLM integration is ready! However, the OPENAI_API_KEY is missing from backend/.env. Please paste your key there and restart the server to see the AI's natural language analysis."
        
    client = OpenAI(api_key=api_key)
    
    prompt = f"""
    You are an elite Cybersecurity Email Analyst. 
    Review the following email Subject and Body text. 
    Keep your response concise (maximum 3 sentences). 
    Explain if this looks like a phishing attempt through its language (e.g. creating panic, asking for passwords, suspicious generic greetings). 
    If it looks normal, just say it appears to use normal professional or casual language.

    Subject: {subject}
    Body Text: {body[:1500]} 
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"OpenAI API Error: {str(e)}"
