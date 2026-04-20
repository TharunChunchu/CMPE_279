import { useState, useRef } from 'react'
import './index.css'

function App() {
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  
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
    
    // Quick validation
    if (!file.name.endsWith('.eml')) {
      setError("Please upload a valid .eml file")
      setLoading(false)
      return
    }

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
      setError("Network error. Please make sure the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setError(null)
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>Phishing Sentinel</h1>
        <p>AI-Powered Email Header Analysis & Spoof Detection</p>
      </header>

      <main>
        {!result && !loading && (
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
              <div className="upload-text">Drag and drop your .eml file here</div>
              <div className="upload-subtext">or click to browse from your computer</div>
              <input 
                ref={inputRef}
                type="file" 
                accept=".eml" 
                onChange={handleChange} 
              />
            </div>
            {error && <div style={{ color: 'var(--danger-color)', marginTop: '1rem', textAlign: 'center' }}>Error: {error}</div>}
          </div>
        )}

        {loading && (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="spinner"></div>
            <p>Analyzing email headers and tracing origins...</p>
          </div>
        )}

        {result && (
          <div className="glass-panel results-container">
            <div style={{ textAlign: 'center' }}>
              <div className={`status-badge status-${result.results.status.toLowerCase()}`}>
                {result.results.status.toUpperCase()} (Score: {result.results.score})
              </div>
            </div>

            <table className="header-table">
              <tbody>
                <tr>
                  <th>From</th>
                  <td>{result.headers.From || 'Missing'}</td>
                </tr>
                <tr>
                  <th>Reply-To</th>
                  <td>{result.headers['Reply-To'] || 'Missing'}</td>
                </tr>
                <tr>
                  <th>Subject</th>
                  <td>{result.headers.Subject || 'Missing'}</td>
                </tr>
                <tr>
                  <th>Message-ID</th>
                  <td>{result.headers['Message-ID'] || 'Missing'}</td>
                </tr>
                <tr>
                  <th>Date</th>
                  <td>{result.headers.Date || 'Missing'}</td>
                </tr>
              </tbody>
            </table>

            {result.results.warnings && result.results.warnings.length > 0 && (
              <div className="warning-list">
                <h3>⚠️ Analysis Warnings</h3>
                <ul>
                  {result.results.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <button className="reset-btn" onClick={reset}>Analyze Another File</button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
