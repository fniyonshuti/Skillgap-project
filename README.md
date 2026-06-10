# Skills Gap Analysis Tool

Web-based capstone project for identifying the gap between ICT skills possessed by TVET graduates in Kicukiro District and RTB ICT competency standards.

## Stack

- Frontend: React.js with Vite
- Backend: Node.js and Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT and role-based access control

## Core Analysis Workflow

1. Administrators register RTB ICT standards, required Levels 1-4, and a private scoring question bank.
2. Graduates select a competency area, answer structured questions, and upload supporting evidence.
3. The backend validates answer IDs, privately derives the four source scores, and calculates the weighted competency score using `40% / 30% / 20% / 10%`.
4. The system determines the competency level, retrieves RTB standards, calculates and classifies the gap.
5. Personalized recommendations and a saved competency report are generated automatically.
6. Graduates view their report, recommendations, assessment history, and then log out.

The authoritative implementation is
`server/src/services/skillsGapAnalysisEngine.js`. Gap score is calculated as
`Required RTB Level - Graduate Level`; values less than or equal to zero are classified as `No Gap`.
Graduates never submit numeric scores, and scoring points are not returned by the graduate API.

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

5. Run the app:

```bash
npm run dev
```

The client runs on `http://localhost:5173` and the API runs on `http://localhost:5000`.

## Demo Accounts

After seeding:

- Admin: `admin@skills-gap.local` / `Password123!`
- Institution: `institution@skills-gap.local` / `Password123!`
- Graduate: `graduate@skills-gap.local` / `Password123!`

## Documentation

See [docs/PROJECT_BLUEPRINT.md](docs/PROJECT_BLUEPRINT.md) for architecture, database design, UML diagrams, and roadmap.

For MongoDB setup help, see [docs/database/SETUP.md](docs/database/SETUP.md).
