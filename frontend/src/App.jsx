import React, { useState, useEffect } from 'react';
import ResumeForm from './components/ResumeForm';
import ResumePreview from './components/ResumePreview';
import AtsAnalyzer from './components/AtsAnalyzer';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  
  // Auth state inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dashboard / Resume list states
  const [resumes, setResumes] = useState([]);
  const [currentResume, setCurrentResume] = useState(null);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState('edit'); // 'edit' or 'ats'

  // Save states
  const [saveStatus, setSaveStatus] = useState('');

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Fetch logged in user status
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchUser();
      fetchResumes();
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setResumes([]);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResumes = async () => {
    setLoadingResumes(true);
    try {
      const res = await fetch(`${API_BASE}/resumes`, {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isRegister ? 'register' : 'login';
    try {
      const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || 'Authentication failed');
      }
      setToken(data.token);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
    setCurrentResume(null);
  };

  // Create new resume
  const createNewResume = async () => {
    const defaultData = {
      title: 'Untitled Resume',
      template: 'classic',
      personalInfo: {
        name: user?.email ? user.email.split('@')[0].toUpperCase() : '',
        email: user?.email || '',
        phone: '',
        location: '',
        github: '',
        linkedin: '',
        website: '',
        summary: ''
      },
      experience: [],
      education: [],
      projects: [],
      skills: []
    };

    try {
      const res = await fetch(`${API_BASE}/resumes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(defaultData)
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentResume(data);
        fetchResumes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Upload PDF Resume and parse it
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    setUploadError('');
    try {
      const res = await fetch(`${API_BASE}/resumes/upload`, {
        method: 'POST',
        headers: {
          'x-auth-token': token
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || 'Failed to upload and parse PDF.');
      }
      setCurrentResume(data);
      fetchResumes();
    } catch (err) {
      alert(err.message);
      setUploadError(err.message);
    } finally {
      setUploading(false);
      // Reset input value so same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  // Save current resume
  const saveResume = async (resumeToSave = currentResume) => {
    if (!resumeToSave) return;
    setSaveStatus('Saving...');
    try {
      const res = await fetch(`${API_BASE}/resumes/${resumeToSave._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(resumeToSave)
      });
      if (res.ok) {
        setSaveStatus('Saved!');
        fetchResumes();
        setTimeout(() => setSaveStatus(''), 2000);
      } else {
        setSaveStatus('Save Failed');
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('Error saving');
    }
  };

  // Delete resume
  const deleteResume = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      const res = await fetch(`${API_BASE}/resumes/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        fetchResumes();
        if (currentResume && currentResume._id === id) {
          setCurrentResume(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger print dialog
  const printResume = () => {
    window.print();
  };

  // If not authenticated, render login page
  if (!token) {
    return (
      <div className="app-container">
        <header className="navbar no-print">
          <div className="logo">📁 CVAudit</div>
        </header>
        <main className="auth-page">
          <div className="auth-card">
            <form className="auth-form" onSubmit={handleAuth}>
              <h2 className="auth-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
              <p className="auth-subtitle">
                {isRegister ? 'Sign up to build ATS optimized resumes' : 'Log in to manage your resumes'}
              </p>
              
              {authError && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '14px', textAlign: 'center' }}>{authError}</div>}
              
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" className="auth-btn">
                {isRegister ? 'Register' : 'Log In'}
              </button>

              <div className="auth-switch">
                {isRegister ? (
                  <>Already have an account? <span onClick={() => setIsRegister(false)}>Log In</span></>
                ) : (
                  <>New to CVAudit? <span onClick={() => setIsRegister(true)}>Sign Up</span></>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Workspace View (Split Pane Editor/Preview)
  if (currentResume) {
    return (
      <div className="app-container">
        <header className="navbar no-print">
          <div className="logo" onClick={() => setCurrentResume(null)} style={{ cursor: 'pointer' }}>
            📁 CVAudit
          </div>
          <div className="nav-actions">
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{saveStatus}</span>
            <button className="btn-secondary" onClick={() => saveResume(currentResume)}>
              💾 Save
            </button>
            <button className="btn-primary" onClick={printResume}>
              🖨️ Export PDF
            </button>
            <button className="btn-secondary" onClick={() => setCurrentResume(null)}>
              ✕ Exit Workspace
            </button>
          </div>
        </header>

        <div className="editor-layout">
          {/* Left Panel: Form or ATS */}
          <aside className="editor-sidebar no-print">
            <div className="sidebar-tabs">
              <button
                className={`sidebar-tab ${workspaceTab === 'edit' ? 'active' : ''}`}
                onClick={() => setWorkspaceTab('edit')}
              >
                📝 Edit Sections
              </button>
              <button
                className={`sidebar-tab ${workspaceTab === 'ats' ? 'active' : ''}`}
                onClick={() => setWorkspaceTab('ats')}
              >
                📊 ATS Score
              </button>
            </div>
            <div className="sidebar-content">
              {workspaceTab === 'edit' ? (
                <ResumeForm resume={currentResume} setResume={setCurrentResume} />
              ) : (
                <AtsAnalyzer resumeId={currentResume._id} token={token} />
              )}
            </div>
          </aside>

          {/* Right Panel: Live Preview */}
          <main className="preview-pane">
            <div className="preview-controls no-print">
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Live A4 Preview</span>
              <div className="template-select-container">
                <label>Active Template:</label>
                <select
                  className="template-select"
                  value={currentResume.template || 'classic'}
                  onChange={(e) => {
                    const updated = { ...currentResume, template: e.target.value };
                    setCurrentResume(updated);
                    saveResume(updated);
                  }}
                >
                  <option value="classic">Classic Tech</option>
                  <option value="modern">Modern Professional</option>
                  <option value="minimalist">Sleek Minimalist</option>
                </select>
              </div>
            </div>

            {/* Scale wrapper to fit standard A4 inside previews */}
            <div className="resume-scale-wrapper">
              <ResumePreview resume={currentResume} />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Dashboard View (Resume Grid)
  return (
    <div className="app-container">
      <header className="navbar no-print">
        <div className="logo">📁 CVAudit</div>
        <div className="nav-actions">
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{user?.email}</span>
          <button className="btn-secondary" onClick={logout}>Sign Out</button>
        </div>
      </header>

      <main className="dashboard no-print">
        <div className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '32px', marginBottom: '0.25rem' }}>Your Workspace</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Create, edit, and analyze ATS compatibility of your resumes.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-secondary" onClick={() => document.getElementById('pdf-upload-input').click()} disabled={uploading}>
              {uploading ? 'Parsing PDF...' : '📤 Upload PDF Resume'}
            </button>
            <input
              id="pdf-upload-input"
              type="file"
              accept=".pdf"
              style={{ display: 'none' }}
              onChange={handlePdfUpload}
            />
            <button className="btn-primary" onClick={createNewResume} disabled={uploading}>
              ➕ Create New Resume
            </button>
          </div>
        </div>

        {loadingResumes ? (
          <div style={{ textAlign: 'center', padding: '5rem' }}>Loading Resumes...</div>
        ) : resumes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <h3 style={{ fontSize: '20px', marginBottom: '0.5rem' }}>No resumes found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Create a new resume or upload an existing PDF to start optimizing it for ATS systems.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button className="btn-secondary" onClick={() => document.getElementById('pdf-upload-input-empty').click()} disabled={uploading}>
                {uploading ? 'Parsing...' : 'Upload PDF'}
              </button>
              <input
                id="pdf-upload-input-empty"
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={handlePdfUpload}
              />
              <button className="btn-primary" onClick={createNewResume} disabled={uploading}>
                Create New Resume
              </button>
            </div>
          </div>
        ) : (
          <div className="resumes-grid">
            {resumes.map((res) => (
              <div key={res._id} className="resume-card" onClick={() => setCurrentResume(res)}>
                <div>
                  <h3 className="resume-card-title">{res.title}</h3>
                  <p className="resume-card-date">Last Updated: {new Date(res.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="resume-card-footer">
                  <span className="template-badge">{res.template}</span>
                  <button className="delete-btn" onClick={(e) => deleteResume(res._id, e)}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
