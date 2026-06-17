# Project Structure Guide

This MERN project is split into a React client and an Express/MongoDB server.
The goal is to keep files close to the feature or domain they belong to.

## Client

```text
client/
  public/                 Static public files served by Vite.
  src/
    assets/
      images/             App images and README screenshots.
      icons/              Icon assets if custom icons are needed.
      styles/             Global CSS.
    components/
      common/             Small reusable UI building blocks.
      charts/             Shared chart components.
      forms/              Shared form components.
      tables/             Shared table components.
    config/               Navigation and client configuration.
    context/              React context providers.
    features/             Feature-specific UI and helper logic.
    hooks/                Shared React hooks.
    layouts/              Page shells such as dashboard and auth layouts.
    pages/
      auth/               Login and registration pages.
      graduate/           Graduate workspace pages.
      admin/              Admin-only pages.
      institution/        Institution workspace pages.
      common/             Public or shared pages.
    routes/               React Router setup and route guards.
    services/             API client wrappers.
    utils/                Small client utilities.
    App.jsx
    main.jsx
  tests/
    unit/                 Client unit tests.
```

## Server

```text
server/
  src/
    config/               Environment, database, CORS, storage, and rate limits.
    middleware/           Express middleware.
    shared/
      helpers/            Cross-domain helper services.
      utils/              Small reusable utilities.
      validators/         Request validation rules.
    modules/
      auth/               Authentication routes, controllers, and service.
      users/              User account model and user management endpoints.
      graduates/          Graduate profile model and endpoints.
      institutions/       Institution model and endpoints.
      competencies/       Competencies, ICT domains, and question bank setup.
      assessments/        Assessment model, routes, and submission workflows.
      evidence/           Evidence upload and validation.
      gaps/               Gap analysis persistence and orchestration.
      recommendations/    Recommendation routes and progress endpoints.
      reports/            Report generation endpoints and report model.
      notifications/      Notification model and endpoints.
      dashboards/         Role-based dashboard analytics.
    engine/
      competency-engine/  Competency scoring logic.
      gap-scoring-engine/ Skills gap scoring logic.
      recommendation-engine/
                           Recommendation text/action generation rules.
    routes/
      index.js            Central API route registration.
    scripts/              Seed and migration scripts.
    app.js                Express app composition.
    server.js             Database connection and server startup.
  tests/
    unit/                 Server unit tests.
    integration/          Integration tests.
    e2e/                  End-to-end tests.
  uploads/                Uploaded evidence files.
```

## Where To Add New Code

Add a new API resource under `server/src/modules/<resource>` with its route,
controller, model, and service files together. Register the route in
`server/src/routes/index.js`.

Put reusable server helpers in `server/src/shared`. Put pure scoring or decision
logic in `server/src/engine` so it can be tested without Express.

Add new React pages under the matching role folder in `client/src/pages`.
Reusable UI belongs in `client/src/components/common`; feature-specific UI should
stay inside `client/src/features/<feature>`.
