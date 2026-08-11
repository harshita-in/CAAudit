import React from 'react';

export default function ResumePreview({ resume }) {
  const {
    personalInfo = {},
    experience = [],
    education = [],
    projects = [],
    skills = [],
    template = 'classic',
    layoutSettings = { fontSize: 12, lineHeight: 1.4, accentColor: '#B76E79' }
  } = resume;

  const layout = layoutSettings || { fontSize: 12, lineHeight: 1.4, accentColor: '#B76E79' };

  // Inline dynamic layouts
  const paperStyle = {
    fontSize: `${layout.fontSize || 12}px`,
    lineHeight: layout.lineHeight || 1.4
  };

  const headingStyle = {
    color: layout.accentColor || '#B76E79',
    borderBottomColor: `${layout.accentColor || '#CBD5E1'}80`
  };

  const linkStyle = {
    color: layout.accentColor || '#B76E79'
  };

  // Helper to split role description into bullet lists
  const renderBullets = (desc) => {
    if (!desc) return null;
    const lines = desc
      .split(/[\n•\-*]+/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) return null;
    return (
      <ul>
        {lines.map((line, idx) => (
          <li key={idx}>{line}</li>
        ))}
      </ul>
    );
  };

  // Helper for links rendering
  const cleanLink = (url) => {
    if (!url) return '';
    return url.replace(/^(https?:\/\/)?(www\.)?/, '');
  };

  // 1. Classic Layout (Single Column)
  const renderClassic = () => (
    <div className="resume-paper classic" style={paperStyle}>
      {/* Header */}
      <div className="r-header">
        <h1 className="r-name" style={{ color: '#111' }}>{personalInfo.name || 'Your Name'}</h1>
        <div className="r-contact">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && (
            <span>
              <a href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`} target="_blank" rel="noreferrer" style={linkStyle}>
                {cleanLink(personalInfo.website)}
              </a>
            </span>
          )}
          {personalInfo.github && (
            <span>
              <a href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} target="_blank" rel="noreferrer" style={linkStyle}>
                {cleanLink(personalInfo.github)}
              </a>
            </span>
          )}
          {personalInfo.linkedin && (
            <span>
              <a href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} target="_blank" rel="noreferrer" style={linkStyle}>
                {cleanLink(personalInfo.linkedin)}
              </a>
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="r-section">
          <h2 className="r-section-title" style={headingStyle}>Professional Summary</h2>
          <p className="r-summary" style={{ fontSize: 'inherit' }}>{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="r-section">
          <h2 className="r-section-title" style={headingStyle}>Work Experience</h2>
          {experience.map((exp, idx) => (
            <div key={idx} className="r-item" style={{ fontSize: 'inherit' }}>
              <div className="r-item-header" style={{ fontSize: 'inherit' }}>
                <span style={{ fontWeight: '700' }}>{exp.position || 'Position'}</span>
                <span>{exp.startDate || 'Start'} – {exp.endDate || 'End'}</span>
              </div>
              <div className="r-item-subheader" style={{ fontSize: 'inherit' }}>
                <span style={{ fontWeight: '500' }}>{exp.company || 'Company'}</span>
                <span>{exp.location || 'Location'}</span>
              </div>
              <div className="r-item-description" style={{ fontSize: 'inherit' }}>
                {renderBullets(exp.description)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="r-section">
          <h2 className="r-section-title" style={headingStyle}>Projects</h2>
          <div className="r-projects-grid">
            {projects.map((proj, idx) => (
              <div key={idx} className="r-item" style={{ fontSize: 'inherit' }}>
                <div className="r-item-header" style={{ fontSize: 'inherit' }}>
                  <span style={{ fontWeight: '700' }}>
                    {proj.name || 'Project Name'}
                    {proj.link && (
                      <span style={{ fontSize: '11px', fontWeight: 'normal', marginLeft: '6px' }}>
                        (<a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noreferrer" style={linkStyle}>
                          Link
                        </a>)
                      </span>
                    )}
                  </span>
                  {proj.technologies && (
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#4A5568' }}>
                      {proj.technologies}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <div className="r-item-description" style={{ marginTop: '3px', paddingLeft: 0, fontSize: 'inherit' }}>
                    {proj.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="r-section">
          <h2 className="r-section-title" style={headingStyle}>Education</h2>
          {education.map((edu, idx) => (
            <div key={idx} className="r-item" style={{ fontSize: 'inherit' }}>
              <div className="r-item-header" style={{ fontSize: 'inherit' }}>
                <span style={{ fontWeight: '700' }}>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</span>
                <span>{edu.startDate} – {edu.endDate}</span>
              </div>
              <div className="r-item-subheader" style={{ fontSize: 'inherit' }}>
                <span>{edu.school} {edu.location ? `, ${edu.location}` : ''}</span>
                {edu.grade && <span>GPA: {edu.grade}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="r-section">
          <h2 className="r-section-title" style={headingStyle}>Skills</h2>
          <p className="r-skills-list" style={{ fontSize: 'inherit' }}>
            <strong>Technical Skills:</strong> {skills.join(', ')}
          </p>
        </div>
      )}
    </div>
  );

  // 2. Modern Layout (Two Columns: Sidebar + Main)
  const renderModern = () => (
    <div className="resume-paper modern" style={paperStyle}>
      {/* Left Sidebar */}
      <div className="r-sidebar" style={{ background: '#FAF9F6' }}>
        <div>
          <h1 className="r-name" style={{ fontSize: '22px', color: '#111' }}>{personalInfo.name || 'Your Name'}</h1>
        </div>

        <div className="r-contact" style={{ fontSize: 'inherit' }}>
          {personalInfo.email && (
            <span>
              <strong>Email:</strong><br />
              {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span>
              <strong>Phone:</strong><br />
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && (
            <span>
              <strong>Location:</strong><br />
              {personalInfo.location}
            </span>
          )}
          {personalInfo.website && (
            <span>
              <strong>Website:</strong><br />
              <a href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`} target="_blank" rel="noreferrer" style={linkStyle}>
                {cleanLink(personalInfo.website)}
              </a>
            </span>
          )}
          {personalInfo.github && (
            <span>
              <strong>GitHub:</strong><br />
              <a href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} target="_blank" rel="noreferrer" style={linkStyle}>
                {cleanLink(personalInfo.github)}
              </a>
            </span>
          )}
          {personalInfo.linkedin && (
            <span>
              <strong>LinkedIn:</strong><br />
              <a href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} target="_blank" rel="noreferrer" style={linkStyle}>
                {cleanLink(personalInfo.linkedin)}
              </a>
            </span>
          )}
        </div>

        {/* Education in Sidebar */}
        {education.length > 0 && (
          <div>
            <h2 className="r-section-title" style={{ ...headingStyle, fontSize: '13px' }}>Education</h2>
            {education.map((edu, idx) => (
              <div key={idx} className="r-item" style={{ marginBottom: '8px', fontSize: 'inherit' }}>
                <div style={{ fontWeight: '700', fontSize: '12px' }}>{edu.degree}</div>
                <div style={{ fontSize: '11px', color: '#4A5568' }}>{edu.fieldOfStudy}</div>
                <div style={{ fontSize: '11px', color: '#718096' }}>{edu.school}</div>
                <div style={{ fontSize: '10px', color: '#A0AEC0' }}>{edu.startDate} – {edu.endDate}</div>
              </div>
            ))}
          </div>
        )}

        {/* Skills in Sidebar */}
        {skills.length > 0 && (
          <div>
            <h2 className="r-section-title" style={{ ...headingStyle, fontSize: '13px' }}>Skills</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', fontSize: '11px' }}>
              {skills.map((s, idx) => (
                <span key={idx} style={{ background: '#E2E8F0', padding: '2px 6px', borderRadius: '3px', color: '#2D3748' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Main Content */}
      <div className="r-main">
        {/* Summary */}
        {personalInfo.summary && (
          <div className="r-section">
            <h2 className="r-section-title" style={headingStyle}>Summary</h2>
            <p className="r-summary" style={{ fontSize: 'inherit', color: '#2D3748' }}>{personalInfo.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="r-section">
            <h2 className="r-section-title" style={headingStyle}>Experience</h2>
            {experience.map((exp, idx) => (
              <div key={idx} className="r-item" style={{ fontSize: 'inherit' }}>
                <div className="r-item-header" style={{ fontSize: 'inherit' }}>
                  <span style={{ fontWeight: '700' }}>{exp.position}</span>
                  <span>{exp.startDate} – {exp.endDate}</span>
                </div>
                <div className="r-item-subheader" style={{ fontSize: 'inherit' }}>
                  <span style={{ fontWeight: '500' }}>{exp.company}</span>
                  <span>{exp.location}</span>
                </div>
                <div className="r-item-description" style={{ fontSize: 'inherit' }}>
                  {renderBullets(exp.description)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="r-section">
            <h2 className="r-section-title" style={headingStyle}>Projects</h2>
            <div className="r-projects-grid">
              {projects.map((proj, idx) => (
                <div key={idx} className="r-item" style={{ fontSize: 'inherit' }}>
                  <div className="r-item-header" style={{ fontSize: 'inherit' }}>
                    <span style={{ fontWeight: '700' }}>
                      {proj.name}
                      {proj.link && (
                        <span style={{ fontSize: '11px', fontWeight: 'normal', marginLeft: '6px' }}>
                          (<a href={proj.link} target="_blank" rel="noreferrer" style={linkStyle}>Link</a>)
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: '11px', color: '#718096' }}>{proj.technologies}</span>
                  </div>
                  {proj.description && (
                    <div className="r-item-description" style={{ marginTop: '2px', paddingLeft: 0, fontSize: 'inherit' }}>
                      {proj.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 3. Minimalist Layout (Serif-based Classic)
  const renderMinimalist = () => (
    <div className="resume-paper minimalist" style={paperStyle}>
      {/* Header */}
      <div className="r-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="r-name" style={{ color: '#111' }}>{personalInfo.name || 'Your Name'}</h1>
        <div className="r-contact" style={{ fontFamily: 'Georgia, serif', color: '#2D3748', fontSize: '11px' }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && (
            <span>
              <a href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`} target="_blank" rel="noreferrer" style={{ color: '#2D3748', textDecoration: 'underline' }}>
                {cleanLink(personalInfo.website)}
              </a>
            </span>
          )}
          {personalInfo.github && (
            <span>
              <a href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} target="_blank" rel="noreferrer" style={{ color: '#2D3748', textDecoration: 'underline' }}>
                {cleanLink(personalInfo.github)}
              </a>
            </span>
          )}
          {personalInfo.linkedin && (
            <span>
              <a href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} target="_blank" rel="noreferrer" style={{ color: '#2D3748', textDecoration: 'underline' }}>
                {cleanLink(personalInfo.linkedin)}
              </a>
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="r-section">
          <h2 className="r-section-title" style={{ ...headingStyle, borderBottom: 'none' }}>Summary</h2>
          <div style={{ width: '100%', height: '1px', backgroundColor: layout.accentColor || '#A0AEC0', marginBottom: '0.4rem', opacity: 0.5 }} />
          <p className="r-summary" style={{ fontFamily: 'Georgia, serif', fontSize: 'inherit' }}>{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="r-section">
          <h2 className="r-section-title" style={{ ...headingStyle, borderBottom: 'none' }}>Experience</h2>
          <div style={{ width: '100%', height: '1px', backgroundColor: layout.accentColor || '#A0AEC0', marginBottom: '0.4rem', opacity: 0.5 }} />
          {experience.map((exp, idx) => (
            <div key={idx} className="r-item" style={{ marginBottom: '0.6rem', fontSize: 'inherit' }}>
              <div className="r-item-header" style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', fontSize: 'inherit' }}>
                <span>{exp.position}</span>
                <span>{exp.startDate} – {exp.endDate}</span>
              </div>
              <div className="r-item-subheader" style={{ fontFamily: 'Georgia, serif', color: '#4A5568', fontSize: 'inherit' }}>
                <span>{exp.company} {exp.location ? `| ${exp.location}` : ''}</span>
              </div>
              <div className="r-item-description" style={{ fontFamily: 'Georgia, serif', fontSize: 'inherit', marginTop: '2px' }}>
                {renderBullets(exp.description)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="r-section">
          <h2 className="r-section-title" style={{ ...headingStyle, borderBottom: 'none' }}>Selected Projects</h2>
          <div style={{ width: '100%', height: '1px', backgroundColor: layout.accentColor || '#A0AEC0', marginBottom: '0.4rem', opacity: 0.5 }} />
          <div className="r-projects-grid">
            {projects.map((proj, idx) => (
              <div key={idx} className="r-item" style={{ marginBottom: '0.4rem', fontSize: 'inherit' }}>
                <div className="r-item-header" style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', fontSize: 'inherit' }}>
                  <span>
                    {proj.name}
                    {proj.link && (
                      <span style={{ fontSize: '10px', fontWeight: 'normal', marginLeft: '6px' }}>
                        (<a href={proj.link} target="_blank" rel="noreferrer" style={{ color: '#4A5568', textDecoration: 'underline' }}>Link</a>)
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: '11px', color: '#718096', fontWeight: 'normal', fontStyle: 'italic' }}>{proj.technologies}</span>
                </div>
                {proj.description && (
                  <div className="r-item-description" style={{ fontFamily: 'Georgia, serif', fontSize: 'inherit', marginTop: '2px', paddingLeft: 0 }}>
                    {proj.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="r-section">
          <h2 className="r-section-title" style={{ ...headingStyle, borderBottom: 'none' }}>Education</h2>
          <div style={{ width: '100%', height: '1px', backgroundColor: layout.accentColor || '#A0AEC0', marginBottom: '0.4rem', opacity: 0.5 }} />
          {education.map((edu, idx) => (
            <div key={idx} className="r-item" style={{ marginBottom: '0.4rem', fontSize: 'inherit' }}>
              <div className="r-item-header" style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', fontSize: 'inherit' }}>
                <span>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</span>
                <span>{edu.startDate} – {edu.endDate}</span>
              </div>
              <div className="r-item-subheader" style={{ fontFamily: 'Georgia, serif', color: '#4A5568', fontSize: 'inherit' }}>
                <span>{edu.school} {edu.location ? `— ${edu.location}` : ''}</span>
                {edu.grade && <span>GPA: {edu.grade}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="r-section">
          <h2 className="r-section-title" style={{ ...headingStyle, borderBottom: 'none' }}>Skills & Interests</h2>
          <div style={{ width: '100%', height: '1px', backgroundColor: layout.accentColor || '#A0AEC0', marginBottom: '0.4rem', opacity: 0.5 }} />
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '11.5px' }}>
            {skills.join(' • ')}
          </p>
        </div>
      )}
    </div>
  );

  switch (template) {
    case 'modern':
      return renderModern();
    case 'minimalist':
      return renderMinimalist();
    case 'classic':
    default:
      return renderClassic();
  }
}
