# ATS Reporting Dashboard

A full-stack production-ready ATS (Applicant Tracking System) Reporting Dashboard for evaluating SRM student resumes.

## Architecture

- **Backend**: Node.js + Express + Mongoose
- **Frontend**: React + Vite + TailwindCSS
- **Database**: MongoDB (external)
- **Deployment**: Docker Compose

## Folder Structure

```
Reports/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   └── atsController.js
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   └── ResumeAnalysis.js
│   │   ├── routes/
│   │   │   └── atsRoutes.js
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FilterBar.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatsCards.jsx
│   │   │   ├── StudentDetailModal.jsx
│   │   │   └── StudentTable.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
├── docker-compose.yml
├── .env
└── README.md
```

## Quick Start (Docker)

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5055/api

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/ats/srm | SRM students with ATS data |
| GET | /api/ats/count/srm | Total SRM student count |
| GET | /api/ats/stats/srm | Aggregate ATS statistics |
| GET | /api/colleges | College list with counts |
| GET | /api/health | Health check |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGO_URI | MongoDB connection string | — |
| PORT | Backend port | 5055 |
| VITE_API_URL | API base URL for frontend | /api |

## Local Development (without Docker)

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
