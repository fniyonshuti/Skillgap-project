# UML Diagrams

## Skills Gap Analysis Tool for TVET ICT Graduates in Kicukiro District

These diagrams reflect the implemented React, Express, MongoDB, JWT, question-bank scoring,
evidence, gap-analysis, recommendation, report, notification, and review workflows.

> Proposal note: The current system stores RTB-aligned competency standards entered and maintained
> by an administrator. It does not currently integrate with an external RTB API. The competency
> wording and reference codes used in the final deployment should be validated with official RTB
> documents or an authorized RTB representative.

## 1. Use Case Diagram

```mermaid
flowchart LR
    Graduate([Graduate])
    Institution([TVET Institution])
    Admin([System Administrator])

    subgraph System["Skills Gap Analysis Tool"]
        UC1(("Register account"))
        UC2(("Login and logout"))
        UC3(("Manage graduate profile"))
        UC4(("Select ICT competency area"))
        UC5(("Complete competency questions"))
        UC6(("Upload supporting evidence"))
        UC7(("Submit assessment"))
        UC8(("View competency report"))
        UC9(("View recommendations"))
        UC10(("View assessment history"))
        UC11(("Manage recommendation progress"))
        UC12(("View notifications"))

        UC13(("View institution graduates"))
        UC14(("Review assessments and evidence"))
        UC15(("View institution analytics"))
        UC16(("View graduate reports"))

        UC17(("Manage user accounts"))
        UC18(("Manage institutions"))
        UC19(("Manage ICT domains"))
        UC20(("Manage RTB competency standards"))
        UC21(("Manage private question bank"))
        UC22(("View system analytics"))

        UC23(("Validate assessment data"))
        UC24(("Calculate source scores"))
        UC25(("Calculate weighted competency score"))
        UC26(("Map result to RTB level"))
        UC27(("Calculate and classify skills gap"))
        UC28(("Generate recommendations"))
        UC29(("Generate and save report"))
        UC30(("Send notification"))
    end

    Graduate --> UC1
    Graduate --> UC2
    Graduate --> UC3
    Graduate --> UC4
    Graduate --> UC5
    Graduate --> UC6
    Graduate --> UC7
    Graduate --> UC8
    Graduate --> UC9
    Graduate --> UC10
    Graduate --> UC11
    Graduate --> UC12

    Institution --> UC1
    Institution --> UC2
    Institution --> UC13
    Institution --> UC14
    Institution --> UC15
    Institution --> UC16
    Institution --> UC11
    Institution --> UC12

    Admin --> UC1
    Admin --> UC2
    Admin --> UC13
    Admin --> UC14
    Admin --> UC16
    Admin --> UC11
    Admin --> UC17
    Admin --> UC18
    Admin --> UC19
    Admin --> UC20
    Admin --> UC21
    Admin --> UC22
    Admin --> UC12

    UC7 -.->|includes| UC23
    UC23 -.->|includes| UC24
    UC24 -.->|includes| UC25
    UC25 -.->|includes| UC26
    UC26 -.->|includes| UC27
    UC27 -.->|includes| UC28
    UC28 -.->|includes| UC29
    UC29 -.->|includes| UC30
    UC20 -.->|includes| UC21
```

### Use-case interpretation

- Graduates never enter numeric marks. They answer questions and submit evidence.
- Administrators define competency requirements, questions, answer options, and private points.
- Institutions review evidence for graduates belonging to their institution.
- Assessment submission automatically invokes scoring, mapping, gap analysis, recommendations,
  reporting, and notification.

## 2. Domain Class Diagram

```mermaid
classDiagram
    class User {
        +ObjectId id
        +String name
        +String email
        -String passwordHash
        +Role role
        +AccountStatus status
        +Date lastLoginAt
        +comparePassword(password)
    }

    class Graduate {
        +ObjectId id
        +ObjectId userId
        +ObjectId institutionId
        +String registrationNumber
        +String program
        +Number graduationYear
        +String phone
        +String district
        +Boolean profileCompleted
    }

    class Institution {
        +ObjectId id
        +ObjectId accountUserId
        +String name
        +String code
        +String district
        +String contactEmail
        +String contactPhone
        +String address
        +RecommendationRule[] recommendationRules
    }

    class RecommendationRule {
        +Priority priority
        +String recommendationText
        +String[] actionItems
        +ResourceType resourceType
    }

    class ICTDomain {
        +ObjectId id
        +String name
        +String description
        +Boolean isActive
    }

    class Competency {
        +ObjectId id
        +ObjectId domainId
        +String title
        +String description
        +String category
        +Number requiredLevel
        +String rtbReference
        +String version
        +Date effectiveDate
        +StandardStatus standardStatus
        +Boolean isActive
    }

    class AssessmentQuestion {
        +ObjectId id
        +EvidenceSource source
        +String prompt
        +Number order
        +Boolean isActive
    }

    class AssessmentOption {
        +ObjectId id
        +String label
        -Number score
    }

    class Assessment {
        +ObjectId id
        +ObjectId graduateId
        +ObjectId domainId
        +ObjectId assessedBy
        +AssessmentType assessmentType
        +AssessmentStatus status
        +ProcessingStatus processingStatus
        +VerificationStatus evidenceVerificationStatus
        +Number overallCompetencyScore
        +Number overallCompetencyLevel
        +String scoringMethod
        +ObjectId reviewedBy
        +Date reviewedAt
    }

    class AssessmentItem {
        +ObjectId competencyId
        +Number competencyScore
        +Number competencyLevel
        +String competencyLabel
        +String evidence
        +String evidenceLink
        +String remarks
        +MappingSnapshot mappingSnapshot
    }

    class AssessmentResponse {
        +ObjectId questionId
        +ObjectId optionId
        +EvidenceSource source
        +String promptSnapshot
        +String selectedLabelSnapshot
    }

    class SourceScore {
        +EvidenceSource source
        +Number questionCount
        +Number score
    }

    class Evidence {
        +ObjectId id
        +ObjectId ownerId
        +ObjectId graduateId
        +ObjectId[] assessmentIds
        +String originalName
        +String storedName
        +String mimeType
        +Number size
    }

    class GapAnalysis {
        +ObjectId id
        +ObjectId assessmentId
        +ObjectId graduateId
        +ObjectId domainId
        +Number overallGapScore
        +Number readinessScore
        +String summary
        +String methodology
        +String engineVersion
    }

    class GapItem {
        +ObjectId competencyId
        +Number requiredLevel
        +Number achievedLevel
        +Number competencyScore
        +String competencyStatus
        +Number gapLevel
        +String severity
        +String classification
        +String priority
        +String rtbReference
        +String standardVersion
    }

    class Recommendation {
        +ObjectId id
        +ObjectId graduateId
        +ObjectId gapAnalysisId
        +ObjectId competencyId
        +String recommendationText
        +String rationale
        +String[] actionItems
        +Number targetLevel
        +String resourceType
        +String priority
        +String status
    }

    class Report {
        +ObjectId id
        +ObjectId ownerId
        +ObjectId graduateId
        +ObjectId assessmentId
        +ObjectId gapAnalysisId
        +ObjectId institutionId
        +String reportType
        +String format
        +Object metadata
        +Object snapshot
        +String status
        +Date generatedAt
    }

    class Notification {
        +ObjectId id
        +ObjectId userId
        +String title
        +String message
        +String type
        +Boolean isRead
    }

    User "1" --> "0..1" Graduate : owns profile
    User "1" --> "0..1" Institution : represents
    Institution "1" --> "0..*" Graduate : enrolls
    ICTDomain "1" --> "0..*" Competency : contains
    Competency "1" *-- "4..*" AssessmentQuestion : defines
    AssessmentQuestion "1" *-- "2..*" AssessmentOption : offers
    Graduate "1" --> "0..*" Assessment : completes
    ICTDomain "1" --> "0..*" Assessment : selected for
    User "1" --> "0..*" Assessment : assessedBy
    Assessment "1" *-- "1..*" AssessmentItem : contains
    AssessmentItem "0..*" --> "1" Competency : maps to
    AssessmentItem "1" *-- "1..*" AssessmentResponse : stores
    AssessmentItem "1" *-- "4" SourceScore : derives
    User "1" --> "0..*" Evidence : owns
    Graduate "1" --> "0..*" Evidence : submits
    Assessment "0..*" -- "0..*" Evidence : references
    Assessment "1" --> "0..1" GapAnalysis : produces
    GapAnalysis "1" *-- "1..*" GapItem : contains
    GapItem "0..*" --> "1" Competency : evaluates
    GapAnalysis "1" --> "0..*" Recommendation : generates
    Graduate "1" --> "0..*" Recommendation : receives
    Assessment "1" --> "0..*" Report : documented by
    GapAnalysis "1" --> "0..*" Report : summarized by
    User "1" --> "0..*" Report : owns
    User "1" --> "0..*" Notification : receives
```

## 3. Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string role
        string status
        date lastLoginAt
    }

    INSTITUTIONS {
        ObjectId _id PK
        ObjectId accountUserId FK
        string name
        string code UK
        string district
        string contactEmail
    }

    GRADUATES {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId institutionId FK
        string registrationNumber UK
        string program
        number graduationYear
        boolean profileCompleted
    }

    ICT_DOMAINS {
        ObjectId _id PK
        string name UK
        string description
        boolean isActive
    }

    COMPETENCIES {
        ObjectId _id PK
        ObjectId domainId FK
        string title
        number requiredLevel
        string rtbReference
        string version
        string standardStatus
        array assessmentQuestions
    }

    ASSESSMENTS {
        ObjectId _id PK
        ObjectId graduateId FK
        ObjectId domainId FK
        ObjectId assessedBy FK
        string status
        string processingStatus
        string evidenceVerificationStatus
        array items
        number overallCompetencyScore
        number overallCompetencyLevel
        string scoringMethod
    }

    EVIDENCES {
        ObjectId _id PK
        ObjectId ownerId FK
        ObjectId graduateId FK
        array assessmentIds
        string originalName
        string storedName UK
        string mimeType
        number size
    }

    GAP_ANALYSES {
        ObjectId _id PK
        ObjectId assessmentId FK
        ObjectId graduateId FK
        ObjectId domainId FK
        number overallGapScore
        number readinessScore
        string engineVersion
        array gapItems
    }

    RECOMMENDATIONS {
        ObjectId _id PK
        ObjectId graduateId FK
        ObjectId gapAnalysisId FK
        ObjectId competencyId FK
        string recommendationText
        number targetLevel
        string priority
        string status
    }

    REPORTS {
        ObjectId _id PK
        ObjectId ownerId FK
        ObjectId graduateId FK
        ObjectId assessmentId FK
        ObjectId gapAnalysisId FK
        ObjectId institutionId FK
        string reportType
        string format
        object snapshot
        date generatedAt
    }

    NOTIFICATIONS {
        ObjectId _id PK
        ObjectId userId FK
        string title
        string message
        string type
        boolean isRead
    }

    USERS ||--o| GRADUATES : has
    USERS ||--o| INSTITUTIONS : represents
    INSTITUTIONS ||--o{ GRADUATES : enrolls
    ICT_DOMAINS ||--o{ COMPETENCIES : defines
    GRADUATES ||--o{ ASSESSMENTS : completes
    ICT_DOMAINS ||--o{ ASSESSMENTS : categorizes
    USERS ||--o{ ASSESSMENTS : submits_or_reviews
    USERS ||--o{ EVIDENCES : owns
    GRADUATES ||--o{ EVIDENCES : provides
    ASSESSMENTS }o--o{ EVIDENCES : attaches
    ASSESSMENTS ||--o| GAP_ANALYSES : produces
    GRADUATES ||--o{ GAP_ANALYSES : receives
    ICT_DOMAINS ||--o{ GAP_ANALYSES : groups
    GAP_ANALYSES ||--o{ RECOMMENDATIONS : generates
    COMPETENCIES ||--o{ RECOMMENDATIONS : targets
    GRADUATES ||--o{ RECOMMENDATIONS : follows
    USERS ||--o{ REPORTS : owns
    ASSESSMENTS ||--o{ REPORTS : documents
    GAP_ANALYSES ||--o{ REPORTS : summarizes
    USERS ||--o{ NOTIFICATIONS : receives
```

## 4. Graduate Assessment Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Graduate
    participant UI as React Graduate UI
    participant Auth as JWT Auth Middleware
    participant API as Assessment Controller
    participant QS as Question Scoring Service
    participant GE as Skills Gap Engine
    participant GS as Gap and Recommendation Service
    participant RS as Report Service
    participant DB as MongoDB

    Graduate->>UI: Select ICT domain
    UI->>Auth: GET /api/competencies/assessment
    Auth->>API: Authenticated graduate request
    API->>DB: Load active competencies and question banks
    DB-->>API: Competencies, options, and private points
    API-->>UI: Questions and option labels only
    Note over API,UI: Private option scores are removed before transmission

    Graduate->>UI: Answer all questions
    Graduate->>UI: Upload evidence file
    UI->>Auth: POST /api/evidence/upload
    Auth->>API: Authorized evidence upload request
    API->>DB: Verify graduate and store evidence metadata
    DB-->>UI: Evidence ID

    Graduate->>UI: Submit assessment
    UI->>Auth: POST /api/assessments with questionId and optionId
    Auth->>API: Authenticated graduate request
    API->>API: Reject graduate-supplied evidenceScores
    API->>DB: Load graduate, standards, questions, and evidence
    API->>API: Validate all active competencies are included
    API->>API: Validate evidence ownership
    API->>QS: Score selected options for each competency
    QS->>QS: Average scores by evidence source
    QS-->>API: Practical, portfolio, academic, self-assessment scores
    API->>DB: Save processing assessment and response snapshots

    loop For each competency
        API->>GE: Run weighted scoring and RTB mapping
        GE->>GE: P*0.40 + PF*0.30 + A*0.20 + S*0.10
        GE->>GE: Determine achieved Level 1-4
        GE->>GE: Gap = required level - achieved level
        GE-->>API: Score, level, gap class, priority
    end

    API->>GS: Generate gap analysis and recommendations
    GS->>DB: Save GapAnalysis and Recommendation records
    API->>RS: Build competency report snapshot
    RS-->>API: Report payload
    API->>DB: Save Report and completed Assessment
    API->>DB: Create assessment-ready notification
    API-->>UI: Assessment, gap analysis, recommendations, and report
    UI-->>Graduate: Display final results
```

## 5. Assessment Activity Diagram

```mermaid
flowchart TD
    Start([Start]) --> Login[Graduate logs in or registers]
    Login --> ValidCredentials{Credentials valid?}
    ValidCredentials -- No --> AuthError[Display authentication error]
    AuthError --> Login
    ValidCredentials -- Yes --> SelectDomain[Select ICT competency domain]
    SelectDomain --> LoadQuestions[System loads active RTB competencies and safe question data]
    LoadQuestions --> Ready{Every competency has a complete question bank?}
    Ready -- No --> AdminRequired[Block submission and request administrator configuration]
    Ready -- Yes --> AnswerQuestions[Graduate answers all competency questions]
    AnswerQuestions --> AddEvidence[Upload file, enter evidence description, or provide evidence link]
    AddEvidence --> Complete{All questions answered and evidence supplied?}
    Complete -- No --> AnswerQuestions
    Complete -- Yes --> Submit[Submit assessment]
    Submit --> RejectScores{Request contains graduate-entered scores?}
    RejectScores -- Yes --> Invalid[Reject request]
    RejectScores -- No --> Validate[Validate IDs, domain coverage, answers, and evidence ownership]
    Validate --> ValidData{Submission valid?}
    ValidData -- No --> Invalid
    Invalid --> Correct[Graduate corrects submission]
    Correct --> AnswerQuestions
    ValidData -- Yes --> Derive[System derives four source scores from private option points]
    Derive --> Weighted[Calculate weighted competency score]
    Weighted --> Level[Determine graduate competency Level 1-4]
    Level --> Standard[Retrieve required RTB level]
    Standard --> Gap[Calculate gap score]
    Gap --> Classify[Classify no, low, moderate, or high gap]
    Classify --> Recommend[Generate personalized recommendations]
    Recommend --> Report[Generate and save competency report]
    Report --> Notify[Create notification]
    Notify --> Display[Display report and recommendations]
    Display --> Review{Institution or admin reviews evidence?}
    Review -- No --> Provisional[Evidence remains submitted]
    Review -- Yes --> Verified[Mark assessment reviewed and evidence verified]
    Provisional --> End([End])
    Verified --> End
```

## 6. Assessment State Diagram

```mermaid
stateDiagram-v2
    [*] --> Processing: Graduate submits valid assessment
    Processing --> ValidatingData
    ValidatingData --> StoringData
    StoringData --> CalculatingScore
    CalculatingScore --> DeterminingLevel
    DeterminingLevel --> RetrievingRTBStandards
    RetrievingRTBStandards --> CalculatingGap
    CalculatingGap --> ClassifyingGap
    ClassifyingGap --> GeneratingRecommendations
    GeneratingRecommendations --> GeneratingReport
    GeneratingReport --> SavingResults
    SavingResults --> Submitted: Processing completed
    Submitted --> Reviewed: Institution or admin verifies evidence
    Processing --> RolledBack: Processing error
    RolledBack --> [*]: Partial records deleted
    Reviewed --> [*]
```

## 7. Component Diagram

```mermaid
flowchart LR
    subgraph Client["React Client"]
        Home[Homepage and authentication]
        GD[Graduate dashboard]
        ID[Institution dashboard]
        AD[Administrator dashboard]
        AU[Axios API client]
    end

    subgraph Server["Node.js and Express API"]
        Security[Helmet, CORS, rate limiting]
        JWT[JWT authentication and RBAC]
        Controllers[REST controllers and validation]
        QS[Assessment question scoring service]
        Engine[Skills gap analysis engine]
        Rec[Recommendation service]
        Report[Report service with PDFKit]
        Notify[Notification service]
        Models[Mongoose models]
        Upload[Multer evidence upload]
    end

    subgraph Data["Data Layer"]
        Mongo[(MongoDB)]
        Files[(Evidence file storage)]
    end

    Home --> AU
    GD --> AU
    ID --> AU
    AD --> AU
    AU --> Security
    Security --> JWT
    JWT --> Controllers
    Controllers --> QS
    Controllers --> Engine
    Controllers --> Rec
    Controllers --> Report
    Controllers --> Notify
    Controllers --> Upload
    QS --> Models
    Engine --> Models
    Rec --> Models
    Report --> Models
    Notify --> Models
    Models --> Mongo
    Upload --> Files
    Upload --> Models
```

## 8. Deployment Diagram

```mermaid
flowchart TB
    subgraph UserDevices["User Devices"]
        GB["Graduate web browser"]
        IB["Institution web browser"]
        AB["Administrator web browser"]
    end

    subgraph WebTier["Frontend Tier"]
        React["React and Vite static application"]
    end

    subgraph ApplicationTier["Application Tier"]
        Express["Node.js and Express server"]
        JWT["JWT authentication"]
        Engine["Question scoring and skills gap engine"]
        PDF["PDF and CSV report generator"]
        Uploads["Evidence upload handler"]
    end

    subgraph DataTier["Data Tier"]
        Mongo[("MongoDB database")]
        Storage[("Evidence file storage")]
    end

    GB -->|HTTPS| React
    IB -->|HTTPS| React
    AB -->|HTTPS| React
    React -->|REST API and JWT| Express
    Express --> JWT
    Express --> Engine
    Express --> PDF
    Express --> Uploads
    Express -->|Mongoose| Mongo
    Uploads --> Storage
    Uploads --> Mongo
```

## 9. Architecture Decisions Represented

1. **Three roles:** `graduate`, `institution`, and `admin` are enforced through JWT and role-based
   authorization.
2. **Server-authoritative scoring:** graduates submit answer IDs, not numeric scores.
3. **Protected scoring key:** question option points remain on the server and are not exposed through
   graduate, report, recommendation, or gap-analysis APIs.
4. **Weighted method:** practical `40%`, portfolio `30%`, academic `20%`, and self-assessment `10%`.
5. **Auditable standards:** every assessment item stores an RTB reference, title, required level, and
   standard-version snapshot.
6. **Institution review:** generated results can be reviewed and evidence marked as verified.
7. **Persistent outputs:** assessments, gap analyses, recommendations, reports, evidence metadata,
   workflow logs, and notifications are stored in MongoDB.
8. **No external RTB integration yet:** standards are manually managed in the administrator panel.
