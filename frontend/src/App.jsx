import { useState, useRef } from 'react'
import './index.css'

function App() {
  const [mode, setMode] = useState('single') // 'single' or 'bulk'
  
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
    <div className="app-container">
      <header className="header">
        <h1>Phishing Sentinel</h1>
        <p>AI-Powered Email Header Analysis & Spoof Detection</p>
        
        <div className="mode-toggle">
          <button 
            className={mode === 'single' ? 'active' : ''} 
            onClick={() => { setMode('single'); reset(); }}
          >Single File Analysis</button>
          <button 
            className={mode === 'bulk' ? 'active' : ''} 
            onClick={() => { setMode('bulk'); reset(); }}
          >Dataset Bulk Scanner</button>
        </div>
      </header>

      <main>
        {mode === 'single' && !result && !loading && (
          <div className="glass-panel">
            <div 
              className={`upload-zone ${dragActive ? "drag-active" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <div className="upload-icon">✉️</div>
              <div className="upload-text">Drag and drop your email file here</div>
              <div className="upload-subtext">or click to browse from your computer</div>
              <input 
                ref={inputRef}
                type="file" 
                onChange={handleChange} 
              />
            </div>
            {error && <div className="error-msg">Error: {error}</div>}
          </div>
        )}

        {mode === 'bulk' && !bulkResult && !loading && (
          <div className="glass-panel bulk-zone">
            <h2>Batch Analyze Open-Source Datasets</h2>
            <p>Direct our heuristic engine to evaluate thousands of emails by providing the absolute path to your dataset folder (e.g. Enron spam corpus).</p>
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

        {loading && (
          <div className="glass-panel text-center">
            <div className="spinner"></div>
            <p>Running heuristic algorithms across targeted headers...</p>
          </div>
        )}

        {/* Single File Result */}
        {result && (
          <div className="glass-panel results-container">
            <div className="text-center">
              <div className={`status-badge status-${result.results.status.toLowerCase()}`}>
                {result.results.status.toUpperCase()} (Score: {result.results.score})
              </div>
            </div>

            <table className="header-table">
              <tbody>
                <tr><th>From</th><td>{result.headers.From || 'Missing'}</td></tr>
                <tr><th>Reply-To</th><td>{result.headers['Reply-To'] || 'Missing'}</td></tr>
                <tr><th>Subject</th><td>{result.headers.Subject || 'Missing'}</td></tr>
                <tr><th>Message-ID</th><td>{result.headers['Message-ID'] || 'Missing'}</td></tr>
              </tbody>
            </table>

            {result.results.warnings?.length > 0 && (
              <div className="warning-list">
                <h3>⚠️ Analysis Warnings</h3>
                <ul>{result.results.warnings.map((w, idx) => <li key={idx}>{w}</li>)}</ul>
              </div>
            )}
            <button className="reset-btn" onClick={reset}>Analyze Another File</button>
          </div>
        )}

        {/* Bulk Scan Result */}
        {bulkResult && (
          <div className="glass-panel results-container text-center">
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
            <button className="reset-btn" onClick={reset}>Run Another Dataset</button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
