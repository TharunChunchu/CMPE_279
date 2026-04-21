import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.parser import parse_eml
from app.heuristics import evaluate_email
from app.llm import analyze_email_content

app = FastAPI(title="Phishing Detection API")

# Configure CORS for local development with Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BulkScanRequest(BaseModel):
    directory_path: str

@app.post("/api/scan")
async def scan_email(file: UploadFile = File(...)):
    """ Endpoint to upload an .eml file and get phishing detection results. """
    try:
        content = await file.read()
        parsed_data = parse_eml(content)
        
        # Call AI Analyst via Subject and Body text
        llm_analysis = analyze_email_content(
            subject=parsed_data.get('Subject', ''),
            body=parsed_data.get('Body', '')
        )
        
        results = evaluate_email(parsed_data)
        
        # Hybrid AI Scoring Integration
        llm_lower = llm_analysis.lower()
        if any(keyword in llm_lower for keyword in ['phishing attempt', 'malicious', 'scam', 'highly suspicious', 'harmful link']):
            results['score'] += 5
            results['warnings'].append("AI Agent detected social-engineering exploitation tactics in email body.")
            
        # Re-evaluate status badge classification based on new hybrid score
        if results['score'] >= 5:
            results['status'] = 'Phishing'
        elif results['score'] >= 3:
            results['status'] = 'Suspicious'

        return {
            "success": True,
            "filename": file.filename,
            "headers": parsed_data,
            "results": results,
            "llm_analysis": llm_analysis
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/bulk_scan")
async def bulk_scan_directory(req: BulkScanRequest):
    directory_path = req.directory_path
    if not os.path.exists(directory_path) or not os.path.isdir(directory_path):
        return {"success": False, "error": f"Directory does not exist: {directory_path}"}
        
    safe_count = 0
    suspicious_count = 0
    phishing_count = 0
    
    files = [f for f in os.listdir(directory_path) if os.path.isfile(os.path.join(directory_path, f))]
    total = len(files)
    if total == 0:
        return {"success": False, "error": "No files found in directory."}
    
    for filename in files:
        filepath = os.path.join(directory_path, filename)
        try:
            with open(filepath, 'rb') as f:
                content = f.read()
            parsed_data = parse_eml(content)
            result = evaluate_email(parsed_data)
        except Exception:
            continue
            
        if result['status'] == 'Phishing':
            phishing_count += 1
        elif result['status'] == 'Suspicious':
            suspicious_count += 1
        else:
            safe_count += 1
            
    return {
        "success": True,
        "total": total,
        "safe": safe_count,
        "suspicious": suspicious_count,
        "phishing": phishing_count
    }

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Phishing Detection API is running"}
