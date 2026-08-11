const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');
const TECH_KEYWORDS = require('../config/keywords');

// Configure multer (in-memory buffer storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit to 5MB
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(pdf)$/)) {
      return cb(new Error('Please upload a PDF file.'));
    }
    cb(undefined, true);
  }
});

// @route   GET api/resumes
// @desc    Get all resumes of a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/resumes/:id
// @desc    Get a specific resume
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    res.json(resume);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/resumes
// @desc    Create a new resume
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, personalInfo, experience, education, projects, skills, template, layoutSettings } = req.body;

  try {
    const newResume = new Resume({
      userId: req.user.id,
      title: title || 'My Resume',
      personalInfo: personalInfo || {},
      experience: experience || [],
      education: education || [],
      projects: projects || [],
      skills: skills || [],
      template: template || 'classic',
      layoutSettings: layoutSettings || { fontSize: 12, lineHeight: 1.4, accentColor: '#B76E79' }
    });

    const resume = await newResume.save();
    res.json(resume);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/resumes/:id
// @desc    Update a resume
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, personalInfo, experience, education, projects, skills, template, layoutSettings } = req.body;

  const resumeFields = {};
  if (title !== undefined) resumeFields.title = title;
  if (personalInfo !== undefined) resumeFields.personalInfo = personalInfo;
  if (experience !== undefined) resumeFields.experience = experience;
  if (education !== undefined) resumeFields.education = education;
  if (projects !== undefined) resumeFields.projects = projects;
  if (skills !== undefined) resumeFields.skills = skills;
  if (template !== undefined) resumeFields.template = template;
  if (layoutSettings !== undefined) resumeFields.layoutSettings = layoutSettings;

  try {
    let resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found or unauthorized' });
    }

    resume = await Resume.findByIdAndUpdate(
      req.params.id,
      { $set: resumeFields },
      { new: true }
    );

    res.json(resume);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/resumes/:id
// @desc    Delete a resume
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found or unauthorized' });
    }

    await Resume.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Resume deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Heuristic: Extract Name, Contact Info, and Tech Skills from raw PDF text
function extractContactInfo(text) {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const phoneRegex = /(\+?\d{1,4}[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;

  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];

  return {
    email: emails[0] || '',
    phone: phones[0] || ''
  };
}

function extractName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length > 0) {
    if (lines[0].length < 50) {
      return lines[0];
    }
  }
  return '';
}

function extractSkills(text) {
  const textLower = text.toLowerCase();
  const matchedSkills = [];
  
  TECH_KEYWORDS.forEach(skill => {
    const esc = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${esc}\\b`, 'i');
    if (regex.test(textLower) || textLower.includes(skill.toLowerCase())) {
      matchedSkills.push(skill);
    }
  });
  
  return [...new Set(matchedSkills)];
}

// @route   POST api/resumes/upload
// @desc    Upload a PDF resume, parse, and create a new resume
// @access  Private
router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'Please upload a PDF file.' });
  }

  try {
    const dataBuffer = req.file.buffer;
    const pdfParser = new PDFParse({ data: dataBuffer });
    const parsedPdf = await pdfParser.getText();
    const text = parsedPdf.text;

    // Run parsing heuristics
    const name = extractName(text);
    const contactInfo = extractContactInfo(text);
    const detectedSkills = extractSkills(text);

    // Clean up summary string
    let summaryText = text.replace(/\s+/g, ' ').substring(0, 1000);
    if (text.length > 1000) summaryText += '...';

    // Create a new resume
    const newResume = new Resume({
      userId: req.user.id,
      title: req.file.originalname.replace(/\.[^/.]+$/, "") + " (Parsed)",
      personalInfo: {
        name: name || '',
        email: contactInfo.email || '',
        phone: contactInfo.phone || '',
        location: '',
        github: '',
        linkedin: '',
        website: '',
        summary: summaryText
      },
      experience: [],
      education: [],
      projects: [],
      skills: detectedSkills,
      template: 'classic'
    });

    const savedResume = await newResume.save();
    res.json(savedResume);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to parse PDF resume.' });
  }
}, (error, req, res, next) => {
  res.status(400).json({ msg: error.message });
});

module.exports = router;
