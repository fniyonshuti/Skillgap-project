# API Endpoints

Base URL: `/api`

## Auth

- `POST /auth/register` - supports `role: "graduate"`, `role: "institution"`, and `role: "admin"`
- `POST /auth/login`
- `GET /auth/me`

## Analytics

- `GET /analytics/dashboard`

## Institutions

- `GET /institutions`
- `POST /institutions`
- `PATCH /institutions/:id`
- `DELETE /institutions/:id`

## Domains and Competencies

- `GET /domains`
- `POST /domains`
- `PATCH /domains/:id`
- `GET /competencies`
- `GET /competencies/assessment?domainId=:id` - graduate-safe question bank without scoring points
- `GET /competencies/manage` - full administrator view including private scoring points
- `POST /competencies`
- `PATCH /competencies/:id`
- `DELETE /competencies/:id`

## Graduates

- `GET /graduates/me`
- `PATCH /graduates/me`
- `GET /graduates`
- `GET /graduates/:id`

## Assessments and Gap Analysis

- `GET /assessments`
- `POST /assessments` - submits evidence and generates mapping, gap analysis, and recommendations
- `GET /assessments/:id`
- `PATCH /assessments/:id/review`
- `GET /gaps/graduate/:graduateId/latest`
- `GET /gaps/assessment/:assessmentId`

## Evidence

- `POST /evidence/upload` - upload one authenticated graduate evidence file
- `GET /evidence/:id/download` - securely download accessible evidence
- `DELETE /evidence/:id` - remove evidence that is not attached to a submitted assessment

Accepted evidence formats are PDF, Word, PNG, JPEG, and WebP, with a maximum file size of 5 MB.

## Recommendations

- `GET /recommendations`
- `PATCH /recommendations/:id/status`

## Reports

- `GET /reports/graduate/:graduateId`
- `GET /reports/graduate/:graduateId?format=csv`
- `GET /reports/graduate/:graduateId?format=pdf`

## Notifications

- `GET /notifications`
- `PATCH /notifications/:id/read`

## Assessment Request Example

```json
{
  "domainId": "DOMAIN_OBJECT_ID",
  "items": [
    {
      "competencyId": "COMPETENCY_OBJECT_ID",
      "responses": [
        {
          "questionId": "QUESTION_OBJECT_ID",
          "optionId": "SELECTED_OPTION_OBJECT_ID"
        }
      ],
      "evidence": "Responsive web application and practical lab assessment.",
      "evidenceLink": "https://github.com/example/project",
      "evidenceIds": ["UPLOADED_EVIDENCE_OBJECT_ID"],
      "remarks": "Deployment security requires more practice."
    }
  ]
}
```

The request must include one response for every active question in every active competency in the
selected domain. The server resolves each selected option's private points, derives the four source
scores, and then runs the weighted skills gap engine.

The API rejects missing, duplicate, or foreign question/option IDs. It also rejects any
graduate-supplied `evidenceScores` field with the message that scores are calculated by the system.
