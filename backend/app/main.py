from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.parser import parse_eml
from app.heuristics import evaluate_email

app = FastAPI(title="Phishing Detection API")

# Configure CORS for local development with Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/scan")
async def scan_email(file: UploadFile = File(...)):
    """ Endpoint to upload an .eml file and get phishing detection results. """
    try:
        content = await file.read()
        
        # Parse the email bytes
        parsed_data = parse_eml(content)
        
        # Evaluate heuristics
        results = evaluate_email(parsed_data)
        
        return {
            "success": True,
            "filename": file.filename,
            "headers": parsed_data,
            "results": results
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Phishing Detection API is running"}
