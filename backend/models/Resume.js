const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
  company: { type: String, default: '' },
  position: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  current: { type: Boolean, default: false },
  description: { type: String, default: '' } // Raw string with bullets or newline separated
});

const EducationSchema = new mongoose.Schema({
  school: { type: String, default: '' },
  degree: { type: String, default: '' },
  fieldOfStudy: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  grade: { type: String, default: '' }
});

const ProjectSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  technologies: { type: String, default: '' }, // Comma-separated or space-separated
  link: { type: String, default: '' }
});

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Untitled Resume'
  },
  personalInfo: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    website: { type: String, default: '' },
    summary: { type: String, default: '' }
  },
  experience: [ExperienceSchema],
  education: [EducationSchema],
  projects: [ProjectSchema],
  skills: {
    type: [String],
    default: []
  },
  template: {
    type: String,
    default: 'classic' // 'classic', 'modern', 'minimalist'
  },
  layoutSettings: {
    fontSize: { type: Number, default: 12 },
    lineHeight: { type: Number, default: 1.4 },
    accentColor: { type: String, default: '#B76E79' } // Default Rose Gold accent
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', ResumeSchema);
