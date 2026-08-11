import React, { useState } from 'react';

const SAMPLE_DATA = {
  personalInfo: {
    name: 'JANE DOE',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 019-2834',
    location: 'San Francisco, CA',
    github: 'github.com/janedoe',
    linkedin: 'linkedin.com/in/janedoe',
    website: 'janedoe.dev',
    summary: 'Innovative Full-Stack Software Engineer with 4+ years of experience building scalable web applications. Expert in React, Node.js, and cloud architecture. Passionate about writing clean, optimized code and improving user experience metrics.'
  },
  experience: [
    {
      company: 'TechCorp Solutions',
      position: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: 'Jan 2024',
      endDate: 'Present',
      description: '- Architecture of a high-performance web dashboard reducing initial page load times by 40% using React and code splitting.\n- Led team of 3 developers to migrate legacy APIs to microservices using Node.js and Docker.\n- Established automated CI/CD pipeline decreasing deployment failure rate by 25%.'
    },
    {
      company: 'AppSoft Systems',
      position: 'Software Developer',
      location: 'Austin, TX',
      startDate: 'Jun 2021',
      endDate: 'Dec 2023',
      description: '- Designed and built responsive client-facing interfaces using React and TailwindCSS.\n- Implemented real-time messaging server using WebSockets increasing engagement by 15%.\n- Collaborated with QA team to write unit tests using Jest raising code coverage from 60% to 85%.'
    }
  ],
  education: [
    {
      school: 'Stanford University',
      degree: 'B.S.',
      fieldOfStudy: 'Computer Science',
      location: 'Stanford, CA',
      startDate: 'Sep 2017',
      endDate: 'Jun 2021',
      grade: 'GPA: 3.8/4.0'
    }
  ],
  projects: [
    {
      name: 'ResuScore Analyzer',
      technologies: 'React, Node.js, Express, MongoDB',
      description: 'An interactive resume builder and ATS score calculator evaluating keywords, structural errors, and layout details.',
      link: 'github.com/janedoe/resuscore'
    }
  ],
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Docker', 'AWS', 'Git', 'HTML', 'CSS', 'Jest', 'CI/CD']
};

export default function ResumeForm({ resume, setResume }) {
  const [activeSection, setActiveSection] = useState('settings');
  const [skillInput, setSkillInput] = useState('');

  // Helper for direct object updates (e.g. personalInfo, layoutSettings)
  const handleNestedChange = (parent, field, val) => {
    setResume(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] || {}),
        [field]: val
      }
    }));
  };

  // Helper for top-level array fields (experience, education, projects)
  const handleArrayChange = (field, index, subfield, val) => {
    setResume(prev => {
      const updatedArray = [...prev[field]];
      updatedArray[index] = { ...updatedArray[index], [subfield]: val };
      return { ...prev, [field]: updatedArray };
    });
  };

  const addArrayItem = (field, defaultObj) => {
    setResume(prev => ({
      ...prev,
      [field]: [...prev[field], defaultObj]
    }));
  };

  const removeArrayItem = (field, index) => {
    setResume(prev => ({
      ...prev,
      [field]: prev[field].filter((_, idx) => idx !== index)
    }));
  };

  // Skill tags handlers
  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = skillInput.trim();
      if (val && !resume.skills.includes(val)) {
        setResume(prev => ({
          ...prev,
          skills: [...prev.skills, val]
        }));
        setSkillInput('');
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    setResume(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  return (
    <div className="accordion">
      {/* 1. Resume Settings & Layout Customizer */}
      <div className="accordion-section">
        <button className="accordion-header" onClick={() => toggleSection('settings')}>
          Layout Customization
          <span className={`accordion-icon ${activeSection === 'settings' ? 'open' : ''}`}>▼</span>
        </button>
        {activeSection === 'settings' && (
          <div className="accordion-body">
            {/* Load Mock Data */}
            <button
              type="button"
              className="add-item-btn"
              style={{
                background: 'var(--accent-glow)',
                borderColor: 'var(--accent)',
                color: 'var(--text-primary)',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}
              onClick={() => {
                if (window.confirm('This will overwrite current fields with a sample profile. Continue?')) {
                  setResume(prev => ({
                    ...prev,
                    ...SAMPLE_DATA,
                    _id: prev._id,
                    title: prev.title,
                    layoutSettings: prev.layoutSettings || { fontSize: 12, lineHeight: 1.4, accentColor: '#B76E79' }
                  }));
                }
              }}
            >
              💡 Load Sample Profile Data
            </button>

            <div className="form-group">
              <label>Resume Name (Internal)</label>
              <input
                type="text"
                className="form-input"
                value={resume.title || ''}
                onChange={(e) => setResume(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Full-Stack Engineer Resume"
              />
            </div>
            
            <div className="form-group">
              <label>Layout Template</label>
              <select
                className="form-input"
                value={resume.template || 'classic'}
                onChange={(e) => setResume(prev => ({ ...prev, template: e.target.value }))}
              >
                <option value="classic">Classic Tech (Single Column)</option>
                <option value="modern">Modern Professional (Two Column)</option>
                <option value="minimalist">Sleek Minimalist (Academic Serif)</option>
              </select>
            </div>

            {/* Customizer Slider Settings */}
            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.25rem', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🎨 Customize Styles
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Accent Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="color"
                      style={{ padding: '0px', width: '38px', height: '38px', cursor: 'pointer', border: 'none', background: 'transparent' }}
                      value={resume.layoutSettings?.accentColor || '#B76E79'}
                      onChange={(e) => handleNestedChange('layoutSettings', 'accentColor', e.target.value)}
                    />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {resume.layoutSettings?.accentColor || '#B76E79'}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Font Size ({resume.layoutSettings?.fontSize || 12}px)</label>
                  <input
                    type="range"
                    min="10"
                    max="16"
                    className="form-input"
                    style={{ padding: '0px', height: '38px' }}
                    value={resume.layoutSettings?.fontSize || 12}
                    onChange={(e) => handleNestedChange('layoutSettings', 'fontSize', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Line Spacing ({resume.layoutSettings?.lineHeight || 1.4})</label>
                <input
                  type="range"
                  min="1.1"
                  max="1.8"
                  step="0.1"
                  className="form-input"
                  style={{ padding: '0px', height: '38px' }}
                  value={resume.layoutSettings?.lineHeight || 1.4}
                  onChange={(e) => handleNestedChange('layoutSettings', 'lineHeight', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Personal Info */}
      <div className="accordion-section">
        <button className="accordion-header" onClick={() => toggleSection('personal')}>
          Personal Details
          <span className={`accordion-icon ${activeSection === 'personal' ? 'open' : ''}`}>▼</span>
        </button>
        {activeSection === 'personal' && (
          <div className="accordion-body">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-input"
                value={resume.personalInfo.name || ''}
                onChange={(e) => handleNestedChange('personalInfo', 'name', e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={resume.personalInfo.email || ''}
                  onChange={(e) => handleNestedChange('personalInfo', 'email', e.target.value)}
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={resume.personalInfo.phone || ''}
                  onChange={(e) => handleNestedChange('personalInfo', 'phone', e.target.value)}
                  placeholder="+1 555-0199"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Location (City, Country)</label>
              <input
                type="text"
                className="form-input"
                value={resume.personalInfo.location || ''}
                onChange={(e) => handleNestedChange('personalInfo', 'location', e.target.value)}
                placeholder="San Francisco, CA"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>GitHub Profile</label>
                <input
                  type="text"
                  className="form-input"
                  value={resume.personalInfo.github || ''}
                  onChange={(e) => handleNestedChange('personalInfo', 'github', e.target.value)}
                  placeholder="github.com/username"
                />
              </div>
              <div className="form-group">
                <label>LinkedIn Profile</label>
                <input
                  type="text"
                  className="form-input"
                  value={resume.personalInfo.linkedin || ''}
                  onChange={(e) => handleNestedChange('personalInfo', 'linkedin', e.target.value)}
                  placeholder="linkedin.com/in/username"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Personal Website / Portfolio</label>
              <input
                type="text"
                className="form-input"
                value={resume.personalInfo.website || ''}
                onChange={(e) => handleNestedChange('personalInfo', 'website', e.target.value)}
                placeholder="johndoe.dev"
              />
            </div>
            <div className="form-group">
              <label>Professional Summary</label>
              <textarea
                className="form-input"
                style={{ height: '100px', resize: 'vertical' }}
                value={resume.personalInfo.summary || ''}
                onChange={(e) => handleNestedChange('personalInfo', 'summary', e.target.value)}
                placeholder="Experienced Full-Stack Developer with a background in..."
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Work Experience */}
      <div className="accordion-section">
        <button className="accordion-header" onClick={() => toggleSection('experience')}>
          Work Experience
          <span className={`accordion-icon ${activeSection === 'experience' ? 'open' : ''}`}>▼</span>
        </button>
        {activeSection === 'experience' && (
          <div className="accordion-body">
            {resume.experience.map((exp, index) => (
              <div key={index} className="list-item-box">
                <button className="remove-item-btn" onClick={() => removeArrayItem('experience', index)}>
                  Remove
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Company / Organization</label>
                    <input
                      type="text"
                      className="form-input"
                      value={exp.company || ''}
                      onChange={(e) => handleArrayChange('experience', index, 'company', e.target.value)}
                      placeholder="Google"
                    />
                  </div>
                  <div className="form-group">
                    <label>Job Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={exp.position || ''}
                      onChange={(e) => handleArrayChange('experience', index, 'position', e.target.value)}
                      placeholder="Software Engineer"
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={exp.startDate || ''}
                      onChange={(e) => handleArrayChange('experience', index, 'startDate', e.target.value)}
                      placeholder="Jan 2023"
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={exp.endDate || ''}
                      onChange={(e) => handleArrayChange('experience', index, 'endDate', e.target.value)}
                      placeholder="Present"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={exp.location || ''}
                    onChange={(e) => handleArrayChange('experience', index, 'location', e.target.value)}
                    placeholder="New York, NY"
                  />
                </div>
                <div className="form-group">
                  <label>Role Description & Accomplishments (Bullets)</label>
                  <textarea
                    className="form-input"
                    style={{ height: '120px', resize: 'vertical' }}
                    value={exp.description || ''}
                    onChange={(e) => handleArrayChange('experience', index, 'description', e.target.value)}
                    placeholder="Use bullet markers like - or • for formatting:&#10;- Designed and built scalable web services using Node.js&#10;- Led a team of 4 engineers to launch metric dashboard"
                  />
                </div>
              </div>
            ))}
            <button
              className="add-item-btn"
              onClick={() => addArrayItem('experience', { company: '', position: '', location: '', startDate: '', endDate: '', description: '' })}
            >
              + Add Work Experience
            </button>
          </div>
        )}
      </div>

      {/* 4. Education */}
      <div className="accordion-section">
        <button className="accordion-header" onClick={() => toggleSection('education')}>
          Education
          <span className={`accordion-icon ${activeSection === 'education' ? 'open' : ''}`}>▼</span>
        </button>
        {activeSection === 'education' && (
          <div className="accordion-body">
            {resume.education.map((edu, index) => (
              <div key={index} className="list-item-box">
                <button className="remove-item-btn" onClick={() => removeArrayItem('education', index)}>
                  Remove
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>School / University</label>
                    <input
                      type="text"
                      className="form-input"
                      value={edu.school || ''}
                      onChange={(e) => handleArrayChange('education', index, 'school', e.target.value)}
                      placeholder="Stanford University"
                    />
                  </div>
                  <div className="form-group">
                    <label>Degree</label>
                    <input
                      type="text"
                      className="form-input"
                      value={edu.degree || ''}
                      onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)}
                      placeholder="B.S."
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Field of Study</label>
                    <input
                      type="text"
                      className="form-input"
                      value={edu.fieldOfStudy || ''}
                      onChange={(e) => handleArrayChange('education', index, 'fieldOfStudy', e.target.value)}
                      placeholder="Computer Science"
                    />
                  </div>
                  <div className="form-group">
                    <label>Grade / GPA</label>
                    <input
                      type="text"
                      className="form-input"
                      value={edu.grade || ''}
                      onChange={(e) => handleArrayChange('education', index, 'grade', e.target.value)}
                      placeholder="3.8/4.0"
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={edu.startDate || ''}
                      onChange={(e) => handleArrayChange('education', index, 'startDate', e.target.value)}
                      placeholder="Sep 2019"
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={edu.endDate || ''}
                      onChange={(e) => handleArrayChange('education', index, 'endDate', e.target.value)}
                      placeholder="Jun 2023"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              className="add-item-btn"
              onClick={() => addArrayItem('education', { school: '', degree: '', fieldOfStudy: '', grade: '', startDate: '', endDate: '' })}
            >
              + Add Education
            </button>
          </div>
        )}
      </div>

      {/* 5. Projects */}
      <div className="accordion-section">
        <button className="accordion-header" onClick={() => toggleSection('projects')}>
          Projects
          <span className={`accordion-icon ${activeSection === 'projects' ? 'open' : ''}`}>▼</span>
        </button>
        {activeSection === 'projects' && (
          <div className="accordion-body">
            {resume.projects.map((proj, index) => (
              <div key={index} className="list-item-box">
                <button className="remove-item-btn" onClick={() => removeArrayItem('projects', index)}>
                  Remove
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Project Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={proj.name || ''}
                      onChange={(e) => handleArrayChange('projects', index, 'name', e.target.value)}
                      placeholder="Personal Analytics Dashboard"
                    />
                  </div>
                  <div className="form-group">
                    <label>Project Link (GitHub/Live)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={proj.link || ''}
                      onChange={(e) => handleArrayChange('projects', index, 'link', e.target.value)}
                      placeholder="github.com/project"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Technologies Used</label>
                  <input
                    type="text"
                    className="form-input"
                    value={proj.technologies || ''}
                    onChange={(e) => handleArrayChange('projects', index, 'technologies', e.target.value)}
                    placeholder="React, Node.js, Express, MongoDB"
                  />
                </div>
                <div className="form-group">
                  <label>Project Description</label>
                  <textarea
                    className="form-input"
                    style={{ height: '80px', resize: 'vertical' }}
                    value={proj.description || ''}
                    onChange={(e) => handleArrayChange('projects', index, 'description', e.target.value)}
                    placeholder="Briefly describe what you built, achievements, and impact."
                  />
                </div>
              </div>
            ))}
            <button
              className="add-item-btn"
              onClick={() => addArrayItem('projects', { name: '', link: '', technologies: '', description: '' })}
            >
              + Add Project
            </button>
          </div>
        )}
      </div>

      {/* 6. Skills */}
      <div className="accordion-section">
        <button className="accordion-header" onClick={() => toggleSection('skills')}>
          Skills
          <span className={`accordion-icon ${activeSection === 'skills' ? 'open' : ''}`}>▼</span>
        </button>
        {activeSection === 'skills' && (
          <div className="accordion-body">
            <div className="form-group">
              <label>Skills Tag Editor</label>
              <div className="skills-input-wrapper">
                {resume.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)}>×</button>
                  </span>
                ))}
                <input
                  type="text"
                  className="skills-input"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Type a skill and hit Enter..."
                />
              </div>
              <small style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '11px' }}>
                Type skills (e.g., JavaScript, Docker, AWS) and press Enter or Comma.
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
