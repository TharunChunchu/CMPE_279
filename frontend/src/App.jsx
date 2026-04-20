import { useState, useRef } from 'react'
import './index.css'

function App() {
  const [mode, setMode] = useState('single') // 'single', 'bulk', 'about'
  
  // Single Scanning State
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  
  // Bulk Scanning State
  const [bulkPath, setBulkPath] = useState('/Users/tharun/Desktop/CMPE_279/spam')
  const [bulkResult, setBulkResult] = useState(null)

  const inputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file) => {
    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("http://localhost:8000/api/scan", {
        method: "POST",
        body: formData
      })
      const data = await response.json()
      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || "Failed to analyze file")
      }
    } catch (err) {
      setError("Network error. Backend not running?")
    } finally {
      setLoading(false)
    }
  }

  const runBulkScan = async () => {
    if (!bulkPath) return;
    setLoading(true)
    setError(null)
    setBulkResult(null)

    try {
      const response = await fetch("http://localhost:8000/api/bulk_scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directory_path: bulkPath })
      })
      const data = await response.json()
      if (data.success) {
        setBulkResult(data)
      } else {
        setError(data.error || "Failed to scan directory")
      }
    } catch (err) {
      setError("Network error.")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setBulkResult(null)
    setError(null)
  }

  return (
    <div className="app-container fade-in">
      <header className="header">
        <h1>Phishing Sentinel</h1>
        <p>Heuristic & AI-Powered Email Header Analysis Framework</p>
        
        <div className="mode-toggle">
          <button 
            className={mode === 'single' ? 'active' : ''} 
            onClick={() => { setMode('single'); reset(); }}
          >Live Scan</button>
          
          <button 
            className={mode === 'bulk' ? 'active' : ''} 
            onClick={() => { setMode('bulk'); reset(); }}
          >Benchmark Datasets</button>
          
          <button 
            className={mode === 'about' ? 'active pulse-btn' : 'pulse-btn'} 
            onClick={() => { setMode('about'); reset(); }}
          >About This App 💡</button>
        </div>
      </header>

      <main>
        {mode === 'single' && !result && !loading && (
          <div className="glass-panel scale-in">
            <div 
              className={`upload-zone ${dragActive ? "drag-active" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <div className="upload-icon">✉️</div>
              <div className="upload-text">Drag and drop your .eml file here</div>
              <div className="upload-subtext">or click to browse from your computer</div>
              <input 
                ref={inputRef}
                type="file" 
                onChange={handleChange} 
                accept=".eml"
              />
            </div>
            {error && <div className="error-msg">Error: {error}</div>}
          </div>
        )}

        {mode === 'bulk' && !bulkResult && !loading && (
          <div className="glass-panel bulk-zone scale-in">
            <h2>Batch Analyze Open-Source Datasets</h2>
            <p>Direct our heuristic engine to evaluate thousands of emails iteratively and visualize threat detection totals.</p>
            <input 
              type="text" 
              className="path-input" 
              placeholder="e.g. /Users/tharun/Desktop/CMPE_279/spam" 
              value={bulkPath} 
              onChange={(e) => setBulkPath(e.target.value)} 
            />
            <button className="reset-btn" onClick={runBulkScan}>Run Dataset Benchmark</button>
            {error && <div className="error-msg" style={{marginTop:'1rem'}}>{error}</div>}
          </div>
        )}
        
        {mode === 'about' && (
          <div className="glass-panel about-panel scale-in">
            <h2>How It Works</h2>
            <p className="about-intro">This application is a <strong>Hybrid Cybersecurity Framework</strong> built for CMPE-279. It mathematically evaluates both the structural integrity of emails (Metadata/Headers) and the psychological language of the email body.</p>
            
            <div className="about-grid">
              <div className="about-card heuristic-card">
                <h3>⚙️ The Heuristics Engine</h3>
                <p>Mechanical checking of raw transmission data to detect the hallmarks of <strong>Domain Spoofing</strong> and <strong>Spear Phishing</strong>:</p>
                <ul>
                  <li><strong>Domain Mismatch:</strong> Compares Top-Level Domains from <tt>From</tt> and <tt>Reply-To</tt> strings.</li>
                  <li><strong>Routing Analysis:</strong> Asserts standard MTA transmission trails counting <tt>Received</tt> headers.</li>
                  <li><strong>ID Verification:</strong> Checks for syntactical inconsistencies in the <tt>Message-ID</tt>.</li>
                </ul>
              </div>
              
              <div className="about-card llm-card">
                <h3>🧠 The Language Model (OpenAI)</h3>
                <p>While the Heuristics Engine reviews the technical headers, our LLM Agent evaluates the payload to catch <strong>Social Engineering</strong>:</p>
                <ul>
                  <li><strong>Psychological Evaluation:</strong> Detects false urgency, panic, and password requests in the plain text body.</li>
                  <li><strong>Zero-Shot Classification:</strong> Utilizes <tt>GPT-3.5-Turbo</tt> dynamically without static training data.</li>
                  <li><strong>Explainability:</strong> Outputs readable, natural language justifications alongside the hard math score.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="glass-panel text-center scale-in">
            <div className="spinner"></div>
            <p className="loading-text">Analyzing email structure & querying AI models...</p>
          </div>
        )}

        {/* Single File Result */}
        {result && (
          <div className="glass-panel results-container scale-in">
            <div className="status-header">
              <div className={`status-badge status-${result.results.status.toLowerCase()}`}>
                {result.results.status.toUpperCase()} (Score: {result.results.score})
              </div>
            </div>

            <div className="report-grid">
              <div className="report-panel header-panel">
                <h3>Technical Metadata</h3>
                <table className="header-table">
                  <tbody>
                    <tr><th>From</th><td>{result.headers.From || 'Missing'}</td></tr>
                    <tr><th>Reply-To</th><td>{result.headers['Reply-To'] || 'Missing'}</td></tr>
                    <tr><th>Message-ID</th><td>{result.headers['Message-ID'] || 'Missing'}</td></tr>
                  </tbody>
                </table>

                {result.results.warnings?.length > 0 && (
                  <div className="warning-list">
                    <h4>⚠️ Heuristic Anomalies</h4>
                    <ul>{result.results.warnings.map((w, idx) => <li key={idx}>{w}</li>)}</ul>
                  </div>
                )}
              </div>

              <div className="report-panel llm-panel">
                <h3>AI Analyst Assessment</h3>
                <div className="llm-response-box">
                  <p>{result.llm_analysis}</p>
                </div>
              </div>
            </div>
            
            <button className="reset-btn mt-4" onClick={reset}>Scan Another Email</button>
          </div>
        )}

        {/* Bulk Scan Result */}
        {bulkResult && (
          <div className="glass-panel results-container text-center scale-in">
            <h2>Dataset Benchmark Report</h2>
            <div className="stats-grid">
               <div className="stat-box">
                 <h3>Total Emails</h3>
                 <p>{bulkResult.total}</p>
               </div>
               <div className="stat-box safe-box">
                 <h3>Rigidly Safe</h3>
                 <p>{bulkResult.safe}</p>
               </div>
               <div className="stat-box susp-box">
                 <h3>Suspicious Routing</h3>
                 <p>{bulkResult.suspicious}</p>
               </div>
               <div className="stat-box phish-box">
                 <h3>Confirmed Spoofed</h3>
                 <p>{bulkResult.phishing}</p>
               </div>
            </div>
            <button className="reset-btn" onClick={reset}>Scan Another Dataset</button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
