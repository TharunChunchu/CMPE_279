# CMPE 279: Phishing Detection System
## Software Security Technologies, Spring 2026

An intelligent, full-stack application engineered to parse standard email `.eml` headers and apply a mathematical heuristics engine to flag Spear-Phishing attempts, domain spoofing, and malicious origin routing.

### Key Features
- **FastAPI / Python Engine**: Securely unpacks raw EML bytes without executing hostile payloads, evaluating threat vectors like `From`/`Reply-To` origin mismatches and routing inconsistencies.
- **React / Vite Frontend**: Modern glassmorphism web interface delivering detailed, granular analysis warnings directly to the user via drag-and-drop.
- **Batch Dataset Evaluation Engine**: Specialized command-line tool `batch_scan.py` developed specifically to audit thousands of open-source emails instantly (compatible with Enron dataset formats and Kaggle CSVs).
- **Security Validated via Pytest**: Core parsing algorithms stress-tested using modern automated suite checks.

---

### Project Architecture
- `backend/`: Fast RESTful API exposing `/api/scan`. Features internal modules for structural parsing (`parser.py`) and algorithmic evaluation logic (`heuristics.py`).
- `frontend/`: React workspace decoupled purely for secure data presentation.
- `sample_data/`: Readily fabricated fake phishing and legitimate `.eml` messages validating our logic.
- `report.tex`: Official IEEE-formatted LaTeX document submission outlining our system pipeline and performance results.

---

### Running the Phishing Dashboard Locally

**1. Launch the Analytics Backend:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt  # (If not installed)
uvicorn app.main:app --reload
```
*(Backend operates at `http://localhost:8000`)*

**2. Launch the Web Interface:**
```bash
cd frontend
npm install
npm run dev
```

Navigate your browser to `http://localhost:5173`. You can drag-and-drop one of the files from the `/sample_data` folder directly into the web interface to view the heuristic detection output.

---

### Running Bulk Verification on Large Datasets
If evaluating against the thousands of emails contained in vast arrays like the SpamAssassin or Enron Open Data sets:

```bash
cd backend
python3 scripts/batch_scan.py
```
Follow the interactive prompt to process either thousands of `.txt` / `.eml` files in a directory or a Kaggle standard `.csv` archive.
