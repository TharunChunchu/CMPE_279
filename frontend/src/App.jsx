import { useState, useRef } from 'react'
import './index.css'

function App() {
  const [mode, setMode] = useState('home') // 'home', 'single', 'bulk', 'about'
  
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
        <h1 onClick={() => { setMode('home'); reset(); }} style={{cursor: 'pointer'}}>Phishing Sentinel</h1>
        <p>Enterprise Email Header Analysis & Forensics Framework</p>
        
        {/* Navigation Bar */}
        {mode !== 'home' && (
          <div className="mode-toggle scale-in">
            <button 
              className={mode === 'single' ? 'active' : ''} 
              onClick={() => { setMode('single'); reset(); }}
            >Live Intercept</button>
            <button 
              className={mode === 'bulk' ? 'active' : ''} 
              onClick={() => { setMode('bulk'); reset(); }}
            >Dataset Benchmarks</button>
            <button 
              className={mode === 'about' ? 'active' : ''} 
              onClick={() => { setMode('about'); reset(); }}
            >Architecture Logic</button>
          </div>
        )}
      </header>

      <main>
        {/* Home Screen Dashboard */}
        {mode === 'home' && (
          <div className="home-grid scale-in">
            <div className="home-card" onClick={() => { setMode('single'); reset(); }}>
              <div className="card-icon">🎯</div>
              <h2>Live Intercept</h2>
              <p>Drag and drop a raw email file to run a real-time extraction and threat assessment. Our Hybrid Heuristics + LLM engine will dissect the underlying routing payloads.</p>
            </div>
            
            <div className="home-card" onClick={() => { setMode('bulk'); reset(); }}>
              <div className="card-icon">⚡</div>
              <h2>Dataset Benchmarks</h2>
              <p>Execute tests across thousands of files simultaneously validating your engine's accuracy across huge Enron or SpamAssassin historical datasets natively on disk.</p>
            </div>
            
            <div className="home-card" style={{gridColumn: '1 / -1', minHeight: '150px', padding: '2rem'}} onClick={() => { setMode('about'); reset(); }}>
              <div className="card-icon" style={{fontSize: '2rem', marginBottom: '0.5rem'}}>📚</div>
              <h2>Architecture Sandbox</h2>
              <p>Learn exactly how this framework detects domain spoofing behind the scenes.</p>
            </div>
          </div>
        )}

        {/* Live Scan Mode */}
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
              <div className="upload-text">Upload suspect payload</div>
              <div className="upload-subtext">Drop .eml file here to extract metadata</div>
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

        {/* Dataset Bulk Scanner Mode */}
        {mode === 'bulk' && !bulkResult && !loading && (
          <div className="glass-panel text-center scale-in">
            <h2>Batch Analyze Target Environment</h2>
            <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem'}}>Evaluate thousands of unstructured emails iteratively to validate machine scoring totals without manual inspection.</p>
            <input 
              type="text" 
              className="path-input" 
              placeholder="e.g. /Users/tharun/Desktop/CMPE_279/spam" 
              value={bulkPath} 
              onChange={(e) => setBulkPath(e.target.value)} 
            />
            <button className="reset-btn" onClick={runBulkScan}>Execute Mass Extractor</button>
            {error && <div className="error-msg" style={{marginTop:'1rem'}}>{error}</div>}
          </div>
        )}
        
        {/* About Architecture Sandbox Mode */}
        {mode === 'about' && (
          <div className="glass-panel about-panel scale-in">
            <h2 className="text-center">How It Works</h2>
            <p className="about-intro">Phishing Sentinel is a <strong>Hybrid Cybersecurity Framework</strong> architected to bypass simplistic keyword filters. It mathematically evaluates both the structural transport integrity (Metadata headers) and the psychological language of the email body simultaneously.</p>
            
            <div className="about-grid">
              <div className="about-card">
                <h3>⚙️ The Metadata Heuristics</h3>
                <p style={{color: 'var(--text-secondary)', marginTop: '0.5rem'}}>Direct inspection of raw transmission data to detect the hallmarks of <strong>Domain Spoofing</strong>:</p>
                <ul>
                  <li><strong>Sender Verification:</strong> Audits Top-Level Domains between <tt>From:</tt> and the envelope <tt>Reply-To:</tt> variables looking for discrepancies.</li>
                  <li><strong>Routing Analysis:</strong> Asserts standard MTA transmission trails by counting sequential <tt>Received:</tt> header hops securely.</li>
                  <li><strong>Identifier Forging:</strong> Flags missing or improperly structurally formatted <tt>Message-ID</tt> arrays.</li>
                </ul>
              </div>
              
              <div className="about-card">
                <h3>🧠 Active LLM Exploit Analyst</h3>
                <p style={{color: 'var(--text-secondary)', marginTop: '0.5rem'}}>While heuristics capture technical network routing falsification, the AI evaluates payload syntax for <strong>Social Engineering</strong>:</p>
                <ul>
                  <li><strong>Psychological Defense:</strong> Detects false urgency, manipulated timelines, and password credential requests hidden in plain text.</li>
                  <li><strong>Zero-Shot Generation:</strong> Dissects language dynamically utilizing <tt>OpenAI</tt> without relying on static ML training sets.</li>
                  <li><strong>Human Explainability:</strong> Computes readable justifications complementing the blunt mathematical heuristic engine score.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="glass-panel text-center scale-in">
            <div className="spinner"></div>
            <p className="loading-text">Engaging neural heuristics & extracting metadata...</p>
          </div>
        )}

        {/* Live Scan Results Display */}
        {result && (
          <div className="glass-panel scale-in">
            <div className="status-header">
              <div className={`status-badge status-${result.results.status.toLowerCase()}`}>
                {result.results.status.toUpperCase()} (Threat Score: {result.results.score})
              </div>
            </div>

            <div className="report-grid">
              <div className="report-panel header-panel">
                <h3>Technical Heuristic Extraction</h3>
                <table className="header-table">
                  <tbody>
                    <tr><th>Forged From</th><td>{result.headers.From || 'Missing'}</td></tr>
                    <tr><th>Reply-To Hub</th><td>{result.headers['Reply-To'] || 'Missing'}</td></tr>
                    <tr><th>Identity Hash</th><td>{result.headers['Message-ID'] || 'Missing'}</td></tr>
                  </tbody>
                </table>

                {result.results.warnings?.length > 0 && (
                  <div className="warning-list" style={{marginTop: '1.5rem'}}>
                    <h4 style={{color: 'var(--warning-color)', marginBottom: '0.5rem'}}>⚠️ Anomaly Vectors Triggered</h4>
                    <ul style={{paddingLeft: '1.5rem', color: 'var(--text-secondary)'}}>
                      {result.results.warnings.map((w, idx) => <li key={idx} style={{marginBottom: '0.2rem'}}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              <div className="report-panel llm-panel">
                <h3>AI Threat Assessment</h3>
                <div className="llm-response-box">
                  <p>{result.llm_analysis}</p>
                </div>
              </div>
            </div>
            
            <button className="reset-btn mt-4" onClick={reset}>Wipe Data & Scan Next Payload</button>
          </div>
        )}

        {/* Bulk Scan Results Display */}
        {bulkResult && (
          <div className="glass-panel text-center scale-in">
            <h2 style={{color: 'var(--secondary-color)'}}>Dataset Benchmark Matrix</h2>
            <div className="stats-grid">
               <div className="stat-box">
                 <h3>Aggregate Pool</h3>
                 <p>{bulkResult.total}</p>
               </div>
               <div className="stat-box safe-box">
                 <h3>Rigidly Safe</h3>
                 <p>{bulkResult.safe}</p>
               </div>
               <div className="stat-box susp-box">
                 <h3>Suspect Routing</h3>
                 <p>{bulkResult.suspicious}</p>
               </div>
               <div className="stat-box phish-box">
                 <h3>Confirmed Exploit</h3>
                 <p>{bulkResult.phishing}</p>
               </div>
            </div>
            <button className="reset-btn" onClick={reset}>Analyze Next Dataset Block</button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
