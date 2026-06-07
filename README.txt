Art Exhibition Management System (AEMS)

Project overview
----------------
Art Exhibit Management System (AEMS) is a full-stack web application built as a group project (CS 442 Software Engineering II) 
at the University of Illinois Chicago (UIC). The system provides tools for browsing and
managing artworks, exhibitions, and public art events. It demonstrates a
RESTful Django backend paired with a modern React + Vite TypeScript frontend
and integrates external data sources (Art Institute of Chicago API and SerpApi)
to aggregate event information.

Key features
------------
- **User accounts**: Custom Django user model with registration and authentication.
- **Admin dashboards**: Administrative views for managing artists, artworks,
       exhibitions, orders, and reports.
- **Artwork & exhibition listings**: Searchable, paginated artwork and
       exhibition endpoints consumed by the frontend.
- **Event aggregation**: Server-side integration with SerpApi and the Art
       Institute of Chicago API to fetch and normalize public event data.
- **Media uploads**: Support for storing uploaded media files (images).

Tech stack
----------
- **Backend**: Python, Django, Django REST Framework
- **Frontend**: React.js, TypeScript, Vite
- **APIs**: Art Institute of Chicago API, SerpApi
- **Storage**: Local media storage for development

Repository structure
-------------------------------
- `Project/AEMS/backend/` — Django project and apps (accounts, artworks, etc.)
- `Project/AEMS/frontend/aems-frontend/` — React + TypeScript frontend

Getting started (development)
-----------------------------
Prerequisites: Python 3.10+, Node.js (16+), npm or yarn, and Git.

Backend

1. Create and activate a virtual environment:

```powershell
cd Project/AEMS/backend
python -m venv .venv
.venv\Scripts\activate
```

2. Install dependencies and create a `.env` file from the example:

```powershell
pip install -r requirements.txt
copy .env.example .env
```

3. Run migrations and start the development server:

```powershell
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Frontend

```powershell
cd Project/AEMS/frontend/aems-frontend
npm install
npm run dev
# Open http://localhost:5173 (or the URL shown by Vite)
```

------------------------------
This work was completed as a group project for CS 442. 
