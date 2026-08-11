import React, { useState, useEffect } from 'react';

export default function AtsAnalyzer({ resumeId, token }) {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Run analysis.
  // if forceJD is true, it requires the jobDescription box to be filled
  const runAnalysis = async (forceJD = false) => {
    if (forceJD && !jobDescription.trim()) {
      setError('Please paste a job description first.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          resumeId,
          jobDescription: forceJD ? jobDescription : ''
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || 'Analysis failed.');
      }
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Run baseline general score on mount/resume switch
  useEffect(() => {
    runAnalysis(false);
  }, [resumeId]);

  // Helper for circular progress bar values
  const r = 50;
  const circ = 2 * Math.PI * r;

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="ats-analyzer-layout">
      {/* JD Paste Section */}
      <div className="jd-input-box">
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📝 Job Description
        </h3>
        <textarea
          className="jd-textarea"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description (JD) you want to optimize your resume for here..."
        />
        {error && <div style={{ color: 'var(--danger)', fontSize: '14px', marginBottom: '1rem' }}>{error}</div>}
        <button
          className="btn-primary"
          onClick={() => runAnalysis(true)}
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {loading ? 'Analyzing Content...' : '🔍 Analyze Resume Match'}
        </button>
      </div>

      {/* Results Display */}
      {results && (
        <>
          {/* Main Score & Breakdown */}
          <div className="score-card">
            <div className="score-circle-container">
              <svg className="score-svg" width="120" height="120">
                <circle className="score-circle-bg" cx="60" cy="60" r={r} />
                <circle
                  className="score-circle-fill"
                  cx="60"
                  cy="60"
                  r={r}
                  stroke={getScoreColor(results.score)}
                  strokeDasharray={circ}
                  strokeDashoffset={circ - (circ * Math.min(results.score, 100)) / 100}
                />
              </svg>
              <div className="score-number" style={{ color: getScoreColor(results.score) }}>
                {results.score}%
              </div>
            </div>
            <div className="score-details" style={{ flex: 1 }}>
              <h3>{results.hasJD ? 'ATS Match Score' : 'General Resume Score'}</h3>
              <p style={{ fontSize: '12.5px', marginTop: '4px' }}>
                {results.hasJD ? (
                  results.score >= 80
                    ? 'Strong Match! Your resume matches this job description very well.'
                    : results.score >= 50
                    ? 'Moderate Match. Add more keywords and resolve formatting issues.'
                    : 'Weak Match. Tailor your skills and experience to match the description.'
                ) : (
                  'This is a baseline score of your resume layout, sections, and format checks. Paste a job description to calculate keyword match compatibility.'
                )}
              </p>
              
              <div className="sub-scores">
                <div className="sub-score-item">
                  <div className="sub-score-val">
                    {results.hasJD ? `${results.breakdown.keywordMatch.score}/${results.breakdown.keywordMatch.max}` : 'N/A'}
                  </div>
                  <div className="sub-score-lbl">Keywords</div>
                </div>
                <div className="sub-score-item">
                  <div className="sub-score-val">{results.breakdown.sectionPresence.score}/{results.breakdown.sectionPresence.max}</div>
                  <div className="sub-score-lbl">Structure</div>
                </div>
                <div className="sub-score-item">
                  <div className="sub-score-val">{results.breakdown.formatting.score}/{results.breakdown.formatting.max}</div>
                  <div className="sub-score-lbl">Form & length</div>
                </div>
              </div>
            </div>
          </div>

          <div className="results-grid">
            {/* Warnings/Formatting Recommendations */}
            <div className="results-card">
              <h4>⚠️ Format Warnings ({results.warnings.length})</h4>
              {results.warnings.length === 0 ? (
                <p style={{ color: 'var(--success)', fontSize: '14px' }}>
                  ✓ Excellent formatting! No issues detected.
                </p>
              ) : (
                <ul className="warnings-list">
                  {results.warnings.map((warning, idx) => (
                    <li key={idx} className="warning-item">
                      {warning}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Keyword Match Cloud */}
            <div className="results-card">
              <h4>🔑 Keyword Analysis</h4>
              
              {!results.hasJD ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '140px', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '13px' }}>
                  <span style={{ fontSize: '28px', marginBottom: '8px' }}>🔍</span>
                  Paste a Job Description above to run keyword analysis and identify missing technical skills.
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '1rem', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Matching job description keywords in your resume helps get past initial ATS filters.
                  </div>

                  {/* Missing Keywords */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h5 style={{ color: 'var(--danger)', fontSize: '13px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Missing Keywords ({results.keywords.missing.length})
                    </h5>
                    {results.keywords.missing.length === 0 ? (
                      <p style={{ color: 'var(--success)', fontSize: '13px' }}>✓ All key words found!</p>
                    ) : (
                      <div className="keywords-cloud">
                        {results.keywords.missing.map((kw, idx) => (
                          <span key={idx} className="keyword-badge missing">
                            + {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Matched Keywords */}
                  <div>
                    <h5 style={{ color: 'var(--success)', fontSize: '13px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Matched Keywords ({results.keywords.matched.length})
                    </h5>
                    {results.keywords.matched.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No matching keywords found.</p>
                    ) : (
                      <div className="keywords-cloud">
                        {results.keywords.matched.map((kw, idx) => (
                          <span key={idx} className="keyword-badge matched">
                            ✓ {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
