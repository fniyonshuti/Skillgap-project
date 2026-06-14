# Skills Gap Analysis Tool

Web-based capstone project for identifying the gap between ICT skills possessed by TVET graduates in Kicukiro District and RTB ICT competency standards.

## Stack

- Frontend: React.js with Vite
- Backend: Node.js and Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT and role-based access control

## Core Analysis Workflow

1. Administrators register RTB ICT standards, required Levels 1-4, and a private scoring question bank.
2. Institutions define the low, moderate, and high gap recommendation rules for their graduates.
3. Graduates select a competency area, answer structured questions, and upload supporting evidence.
4. The backend validates answer IDs, privately derives the four source scores, and calculates the weighted competency score using `40% / 30% / 20% / 10%`.
5. The system determines the competency level, retrieves RTB standards, and classifies the gap.
6. The matching institution-defined recommendation and a saved competency report are generated automatically.
7. Graduates view their report, recommendations, assessment history, and then log out.

The authoritative implementation is
`server/src/services/skillsGapAnalysisEngine.js`. Gap score is calculated as
`Required RTB Level - Graduate Level`; values less than or equal to zero are classified as `No Gap`.
Graduates never submit numeric scores, and scoring points are not returned by the graduate API.
Recommendation text and action checklists are defined only by the graduate's institution.

## Quick Start

1. Copy environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

2. Install dependencies:

```bash
npm run install:all
```

3. Configure MongoDB:

Use one of these options:

- Start MongoDB locally on `127.0.0.1:27017`.
- Or edit `server/.env` and set `MONGO_URI` to your MongoDB Atlas connection string.

To allow admin registration from the web form, set a private setup code in `server/.env`:

```env
ADMIN_REGISTRATION_CODE=your-private-admin-code
```

4. Seed sample data:

```bash
npm run seed
```

For an existing database created before system-scored questions were added, run:

```bash
npm run migrate:question-banks
```

For existing institutions, sign in with the institution account and complete the
**Recommendation Rules** page before graduates submit new assessments.

5. Run the app:

```bash
npm run dev
```

The client runs on `http://localhost:5173` and the API runs on `https://skillgap-project.onrender.com`.

## Demo Accounts

After seeding:

- Admin: `admin@skills-gap.local` / `Password123!`
- Institution: `institution@skills-gap.local` / `Password123!`
- Graduate: `graduate@skills-gap.local` / `Password123!`

## Documentation

See [docs/PROJECT_BLUEPRINT.md](docs/PROJECT_BLUEPRINT.md) for architecture, database design, UML diagrams, and roadmap.

For MongoDB setup help, see [docs/database/SETUP.md](docs/database/SETUP.md).

## Render Deployment

This repository contains separate `server` and `client` applications. The root install script
installs both applications, so the following Render web-service settings work from the repository
root:

```text
Build Command: npm ci
Start Command: npm start
Health Check Path: /health
```

Configure these environment variables on the backend service:

```env
NODE_ENV=production
MONGO_URI=<MongoDB Atlas connection string>
JWT_SECRET=<long random secret>
JWT_EXPIRES_IN=1d
CLIENT_URL=<deployed frontend origin, without a trailing slash>
ADMIN_REGISTRATION_CODE=<private setup code>
```

Deploy the `client` directory as a Render Static Site:

```text
Root Directory: client
Build Command: npm ci && npm run build
Publish Directory: dist
```

Set `VITE_API_URL` on the static site to the backend URL ending in `/api`, for example
`https://your-api-service.onrender.com/api`. Add a rewrite from `/*` to `/index.html` so React
Router routes work when opened directly.

## Vercel Frontend Deployment

Deploy the frontend with these settings:

```text
Framework Preset: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm ci
```

`client/vercel.json` proxies `/api/*` to the Render backend and handles React Router page
refreshes. Set this Vercel environment variable:

```env
VITE_API_URL=/api
```

On the Render backend, set the exact production frontend URL without a trailing slash:

```env
NODE_ENV=production
CLIENT_URL=https://your-project.vercel.app
```

Use `CLIENT_URLS` instead when the application has multiple frontend domains:

```env
CLIENT_URLS=https://your-project.vercel.app,https://your-custom-domain.com
```
