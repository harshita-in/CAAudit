const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');

// Stop words to filter out for keyword matching
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd",
  'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers',
  'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
  'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if',
  'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
  'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
  'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'should', "should've",
  'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'required', 'requirement', 'requirements', 'years', 'experience',
  'work', 'job', 'role', 'team', 'ability', 'candidate', 'successful', 'ideal', 'good', 'strong'
]);

// Helper: Tokenize text into words
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ') // Replace punctuation with space
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
}

// Common tech keywords (including bigrams/phrases) to search for explicitly
const TECH_KEYWORDS = require('../config/keywords');

// Helper: Find matched and missing keywords
function analyzeKeywords(resumeText, jdText) {
  const resumeLower = resumeText.toLowerCase();
  const jdLower = jdText.toLowerCase();

  const matched = [];
  const missing = [];

  // Match predefined tech keywords
  TECH_KEYWORDS.forEach(keyword => {
    const isPresentInJD = jdLower.includes(keyword);
    const isPresentInResume = resumeLower.includes(keyword);

    if (isPresentInJD) {
      if (isPresentInResume) {
        matched.push(keyword);
      } else {
        missing.push(keyword);
      }
    }
  });

  // Dynamic token matching for other words in JD that aren't in stop words
  const jdTokes = [...new Set(tokenize(jdText))];
  const resumeTokes = new Set(tokenize(resumeText));

  jdTokes.forEach(token => {
    // If not already covered by explicit tech keyword checks
    if (!matched.includes(token) && !missing.includes(token)) {
      if (resumeTokes.has(token)) {
        matched.push(token);
      } else {
        // Only include words with some minimum importance length to avoid garbage
        if (token.length > 3) {
          missing.push(token);
        }
      }
    }
  });

  return { matched, missing };
}

// @route   POST api/analyze
// @desc    Analyze resume against a job description
// @access  Private
router.post('/', auth, async (req, res) => {
  const { resumeId, jobDescription = "" } = req.body;
  const hasJD = jobDescription.trim().length > 0;

  try {
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }

    // 1. Gather all resume text
    let resumeTextParts = [];
    resumeTextParts.push(resume.personalInfo.summary || '');
    resumeTextParts.push(resume.skills.join(' '));

    resume.experience.forEach(exp => {
      resumeTextParts.push(exp.position || '');
      resumeTextParts.push(exp.company || '');
      resumeTextParts.push(exp.description || '');
    });

    resume.education.forEach(edu => {
      resumeTextParts.push(edu.degree || '');
      resumeTextParts.push(edu.fieldOfStudy || '');
      resumeTextParts.push(edu.school || '');
    });

    resume.projects.forEach(proj => {
      resumeTextParts.push(proj.name || '');
      resumeTextParts.push(proj.description || '');
      resumeTextParts.push(proj.technologies || '');
    });

    const fullResumeText = resumeTextParts.join(' ');

    // 2. Perform Keyword Analysis
    const { matched, missing } = analyzeKeywords(fullResumeText, jobDescription);

    // 3. Section Presence Checks (20 points max)
    let sectionScore = 0;
    const checks = {
      hasContact: !!(resume.personalInfo.email && resume.personalInfo.phone),
      hasExperience: resume.experience.length > 0,
      hasEducation: resume.education.length > 0,
      hasSkills: resume.skills.length > 0
    };

    if (checks.hasContact) sectionScore += 5;
    if (checks.hasExperience) sectionScore += 5;
    if (checks.hasEducation) sectionScore += 5;
    if (checks.hasSkills) sectionScore += 5;

    // 4. Keyword Match Score calculation (50 points max)
    const totalKeywordsFound = matched.length + missing.length;
    let keywordScore = 0;
    if (totalKeywordsFound > 0) {
      keywordScore = Math.round((matched.length / totalKeywordsFound) * 50);
    }

    // 5. Formatting & Content Quality Checks (30 points max)
    let formattingScore = 30;
    const warnings = [];

    // Word count check
    const wordCount = fullResumeText.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 150) {
      formattingScore -= 10;
      warnings.push('Your resume is very short. Aim for at least 200-400 words.');
    } else if (wordCount > 1000) {
      formattingScore -= 10;
      warnings.push('Your resume is very long. ATS parsers prefer concise resumes under 800 words.');
    }

    // Contact info depth
    if (!resume.personalInfo.linkedin && !resume.personalInfo.github) {
      formattingScore -= 5;
      warnings.push('Consider adding your LinkedIn or GitHub URL to personal info.');
    }

    // Bullets check in work experience
    let totalBullets = 0;
    let missingBullets = false;
    resume.experience.forEach(exp => {
      if (exp.description) {
        // Look for newline or standard bullet markers like •, -, *
        const lines = exp.description.split(/[\n•\-*]+/).filter(l => l.trim().length > 5);
        totalBullets += lines.length;
        if (lines.length === 0) {
          missingBullets = true;
        }
      } else {
        missingBullets = true;
      }
    });

    if (resume.experience.length > 0 && (totalBullets < resume.experience.length || missingBullets)) {
      formattingScore -= 10;
      warnings.push('Use bullet points starting with action verbs to describe accomplishments in work experience.');
    }

    // Calculate total score
    let totalScore = 0;
    let keywordBreakdownMax = 50;
    if (hasJD) {
      totalScore = keywordScore + sectionScore + formattingScore;
    } else {
      // General layout/structure score out of 100 (scale 20 points for sections and 30 for formatting to 100)
      totalScore = Math.round(((sectionScore + formattingScore) / 50) * 100);
      keywordBreakdownMax = 0;
    }

    res.json({
      score: totalScore,
      hasJD,
      breakdown: {
        keywordMatch: { score: hasJD ? keywordScore : 0, max: keywordBreakdownMax },
        sectionPresence: { score: sectionScore, max: 20 },
        formatting: { score: formattingScore, max: 30 }
      },
      keywords: {
        matched,
        missing: hasJD ? missing.slice(0, 15) : []
      },
      warnings,
      wordCount,
      checks
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
