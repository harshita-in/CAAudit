# CVAudit

CVAudit is a modern full-stack resume builder and Applicant Tracking System (ATS) optimization tool. It allows users to write and customize resumes in real-time, audit them against standard ATS formatting guidelines, upload existing PDFs, and match content directly against job descriptions to calculate suitability scores.

## 🚀 Key Features

- **Interactive Split-Pane Builder:** Side-by-side editing form and scaled A4 preview that updates in real-time.
- **Heuristic PDF Parsing:** Upload an existing PDF resume to automatically populate details, extract contact info, and parse technical skills using keyword matching.
- **ATS Auditing & Scoring Engine:** Checks for general formatting standards (word counts, bullet usage, contact details) and scores content against pasted job descriptions.
- **Layout Styling Customizer:** Adjust font sizes, line heights, and change resume accent highlight colors on the fly.
- **Multiple Templates:** Choose between Classic Tech (Single Column), Modern Professional (Two Column with Sidebar), and Minimalist (Serif layout) templates.
- **ATS-Friendly PDF Export:** Leverages native browser print stylesheets to ensure exported PDFs contain searchable, selectable text.

## 🛠️ Tech Stack

- **Frontend:** React (Vite), HTML5, Vanilla CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **PDF Extraction:** `pdf-parse`, `multer` (in-memory buffer storage)

## 🏃 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017/`

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd cv-audit
   ```

2. Install dependencies for the root, frontend, and backend:
   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   ```

3. Create a `.env` file in the `backend/` directory:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/resume-ats-builder
   PORT=5000
   JWT_SECRET=supersecret_resume_ats_129847
   ```

### Running the Application

Launch both the backend API and the Vite frontend dev server concurrently using the root script:
```bash
npm run dev
```

- Frontend Dev Server: [http://localhost:5173](http://localhost:5173)
- Backend API Server: [http://localhost:5000](http://localhost:5000)
