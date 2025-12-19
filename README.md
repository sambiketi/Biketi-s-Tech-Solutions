# Agency Platform

A full dynamic tech agency platform offering services in **Data Analysis**, **Digital Marketing**, **Graphic Design**, and **Web Creation**.  
The platform supports:

- Multi-service operation pages
- Dynamic forms with multi-format uploads
- Courses for beginners
- Dedicated blog system
- Admin panel for content and submission management
- Cloud storage and database integration

---

## Table of Contents

- [Project Structure](#project-structure)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Setup & Installation](#setup--installation)  
- [Environment Variables](#environment-variables)  
- [Running the Project](#running-the-project)  
- [Deployment](#deployment)  
- [Future Enhancements](#future-enhancements)  

---

## Project Structure


**Backend (`backend/`)**  

- `app.py` → Flask app & route registration  
- `config.py` → Environment configs (dev/prod)  
- `models/` → Database models: posts, services, submissions, courses  
- `routes/` → API endpoints (public, admin, uploads)  
- `utils/` → Auth, storage helpers, file validators  
- `tests/` → Pytest tests  

**Frontend (`frontend/`)**  

- `components/` → Reusable UI elements (Navbar, Footer, Forms, Admin tools)  
- `pages/` → Public & Admin page components  
- `api/` → Axios API calls (public & admin)  
- `contexts/` → React Context (Auth)  
- `hooks/` → Custom hooks (useAuth, useFormSubmit)  
- `App.jsx` & `index.jsx` → Main entry points  

---

## Features

- **Public Pages:** Home, Services, Service Detail, Blog, Courses, Contact  
- **Admin Panel:** CRUD posts, courses, services, submissions; Dashboard overview  
- **Dynamic Forms:** Upload PDF, DOCX, XLSX/CSV, Images  
- **Courses Module:** Modules, lessons, downloadable resources  
- **Blog System:** Categories, tags, drafts, featured images  
- **Cloud Integration:** PostgreSQL database, Google Cloud Storage or Supabase Storage  
- **Security:** JWT authentication, role-based admin access  

---

## Tech Stack

- **Frontend:** React, Tailwind CSS (or plain CSS)  
- **Backend:** Flask (Python 3.10+)  
- **Database:** PostgreSQL (Supabase or Cloud SQL)  
- **Storage:** Google Cloud Storage or Supabase Storage  
- **Authentication:** JWT tokens  
- **Deployment:** Render (Frontend + Backend) / Google Cloud Run  

---

## Setup & Installation

### Prerequisites

- Node.js >= 18  
- Python >= 3.10  
- Git  
- PostgreSQL (or Supabase account)  

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Linux / Mac
venv\Scripts\activate      # Windows
pip install -r requirements.txt
cd frontend
npm install
npm start
SECRET_KEY=your_secret_key
DB_URL=postgres://user:pass@host:port/dbname
GCP_BUCKET=your_bucket_name
cd frontend
npm start
