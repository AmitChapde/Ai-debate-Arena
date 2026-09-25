# AI Debate Arena

AI Debate Arena is an AI-powered debate simulation platform where users defend a position against multiple AI agents.

Instead of simply asking an LLM a question and receiving a response, the application creates a structured debate:

User → Advocate → User → Challenger → Judge

The system evaluates the user's reasoning across multiple dimensions and provides a detailed performance report at the end of the debate.

The project was designed to demonstrate more than CRUD functionality by combining:

- Multi-agent AI orchestration
- Stateful debate workflows
- Configurable AI providers
- Structured LLM output
- Prompt engineering
- Authentication
- MongoDB data modeling
- REST APIs
- React / Next.js frontend
- Automated testing
- Local AI inference with Ollama
- Cloud AI inference with Groq
- Extensible provider architecture

---

## Features

### Debate Simulation

Users select a scenario and choose a position they want to defend.

The debate then proceeds through multiple rounds.

Each round contains:

1. Advocate argument
2. User response
3. Challenger counterargument

After the configured number of rounds, the Judge evaluates the user's performance.

---

### Multi-Agent Architecture

The application uses different AI agents for different responsibilities.

| Agent | Responsibility |
| --- | --- |
| Advocate | Presents arguments supporting the user's selected position |
| Challenger | Challenges the user's reasoning and exposes assumptions |
| Judge | Evaluates the user's complete performance |

This separates generation responsibilities instead of using one generic AI prompt for everything.

---

### Configurable AI Providers

The application uses a provider abstraction.

Currently supported:

- Ollama
- Groq
- Gemini

The architecture allows an Agent to specify:

```text
provider
model
temperature
```

This means different agents can potentially use different models/providers without changing the debate engine.

Example:

```text
Agent
 ├── provider: ollama
 ├── model: qwen3:4b
 └── temperature: 0.7
```

or:

```text
Agent
 ├── provider: groq
 ├── model: openai/gpt-oss-120b
 └── temperature: 0.7
```

The DebateEngine does not need to know how a provider works internally.

---

### Local AI with Ollama

During local development, the application can use Ollama for local inference.

```text
Application
     ↓
DebateEngine
     ↓
AI Provider
     ↓
Ollama
     ↓
Local LLM
```

This allows development without sending every request to a cloud AI provider.

Ollama configuration is controlled through environment variables.

---

### Cloud AI with Groq

For deployment, Ollama is not required.

The production architecture can use Groq's API instead:

```text
User
 ↓
Next.js
 ↓
Express API
 ↓
DebateEngine
 ↓
Groq API
 ↓
LLM
```

The provider abstraction means the debate logic remains unchanged.

Only the Agent configuration and environment variables need to change.

---

### Scenario System

Debates are based on predefined scenarios.

A scenario contains:

- Title
- Description
- Category
- Difficulty
- Context
- Available positions
- Constraints
- Evaluation criteria
- Publication status

Example categories include:

```text
business
technology
leadership
ethics
crisis
strategy
```

Example difficulties:

```text
easy
medium
hard
expert
```

---

### Position Selection

Each scenario can provide multiple positions.

For example:

```text
Scenario:
Expand into a new market

Positions:

Expand
"Enter the new market now to gain an early advantage."

Remain cautious
"Delay expansion until the market has been validated."
```

The user selects one position and must defend it throughout the debate.

---

### AI Evaluation

After the debate finishes, the Judge produces a structured evaluation.

The current evaluation dimensions are:

- Overall: overall debate performance
- Reasoning: quality of logical reasoning
- Evidence: use and quality of supporting evidence
- Counter-argument: ability to address opposing arguments
- Consistency: consistency of reasoning throughout the debate
- Adaptability: ability to respond to new arguments

The Judge also generates:

- Strengths
- Weaknesses
- Feedback

Example:

```json
{
  "overallScore": 87,
  "reasoningScore": 92,
  "evidenceScore": 85,
  "counterArgumentScore": 95,
  "consistencyScore": 90,
  "adaptabilityScore": 88,
  "strengths": [
    "Effective use of counterarguments",
    "Clear argumentation"
  ],
  "weaknesses": [
    "Overreliance on assumptions"
  ],
  "feedback": "..."
}
```

---

# Architecture

The application follows a client-server architecture.

```text
                    ┌─────────────────────┐
                    │      Next.js        │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │   Express + Node    │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
       ┌───────────┐     ┌─────────────┐   ┌─────────────┐
       │  MongoDB  │     │ DebateEngine│   │ Auth System │
       └───────────┘     └──────┬──────┘   └─────────────┘
                                │
                                ▼
                         ┌─────────────┐
                         │ AI Provider │
                         │ Abstraction │
                         └──────┬──────┘
                                │
                   ┌────────────┼────────────┐
                   │            │            │
                   ▼            ▼            ▼
                Ollama        Groq         Gemini
```

---

# Debate Flow

The debate is stateful.

A simplified flow is:

```text
Create Debate
     ↓
Start Debate
     ↓
Advocate
     ↓
User Response
     ↓
Challenger
     ↓
Is final round?
   /       \
 No        Yes
 |          |
 ↓          ↓
Next      Judge
Round       ↓
 |       Evaluation
 └──────────┘
```

The number of rounds is configurable in the debate engine.

The current default is:

```text
DEFAULT_DEBATE_ROUNDS = 3;
```

The round counter starts at `1`.

After each non-final Challenger response:

```text
currentRound++
```

Once the configured number of rounds is completed, the debate moves to the Judge.

---

# Backend

The backend is built with:

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- Zod
- JWT authentication
- Vitest

---

## Backend Structure

The backend follows a modular structure.

Conceptually:

```text
server/
└── src/
    ├── config/
    ├── middleware/
    ├── routes/
    └── modules/
        ├── auth/
        ├── users/
        ├── agents/
        ├── scenarios/
        ├── debates/
        └── ai/
            ├── ai.factory.ts
            ├── ai.provider.ts
            ├── ai.types.ts
            └── providers/
                ├── ollama.provider.ts
                ├── groq.provider.ts
                └── gemini.provider.ts
```

---

# AI Provider Architecture

The provider abstraction is one of the core architectural decisions of the project.

The DebateEngine depends on:

```text
AIProvider
```

rather than directly depending on Ollama, Groq, or Gemini.

The interface is conceptually:

```ts
interface AIProvider {
  generate(
    request: GenerateRequest
  ): Promise<GenerateResponse>;
}
```

This gives the application a common interface for different LLM providers.

---

## Provider Factory

The provider factory determines which implementation should be used.

```text
provider = ollama
       ↓
OllamaProvider

provider = groq
       ↓
GroqProvider

provider = gemini
       ↓
GeminiProvider
```

The DebateEngine does not contain provider-specific HTTP logic.

---

# Agent Configuration

Agents are stored separately from the debate itself.

An Agent contains configuration such as:

```text
name
role
provider
model
temperature
systemPrompt
```

This allows AI behavior to be configured without changing the DebateEngine.

For example:

```text
Advocate
provider: ollama
model: qwen3:4b

Challenger
provider: groq
model: openai/gpt-oss-120b

Judge
provider: gemini
model: ...
```

The application currently supports Ollama, Groq, and Gemini.

OpenAI is not currently implemented.

---

# Debate Engine

The DebateEngine orchestrates the entire debate.

Its responsibilities include:

- Loading the debate
- Loading the scenario
- Loading Agent configuration
- Selecting the appropriate AI provider
- Generating Advocate responses
- Processing user responses
- Generating Challenger responses
- Managing rounds
- Triggering the Judge
- Saving messages
- Completing the debate
- Persisting evaluation results

Conceptually:

```text
DebateEngine
     │
     ├── Advocate Agent
     │       └── AI Provider
     │
     ├── User Response
     │
     ├── Challenger Agent
     │       └── AI Provider
     │
     └── Judge Agent
             └── AI Provider
```

---

# Debate Data Model

A debate stores:

```text
userId
scenarioId
status
currentTurn
currentRound
selectedPosition
messages
evaluation
startedAt
completedAt
createdAt
updatedAt
```

---

## Debate Status

Possible states:

```text
created
active
judging
completed
abandoned
```

---

## Debate Turn

Possible turns:

```text
advocate
user_response
challenger
judge
completed
```

This allows the backend to maintain the current state of a debate.

---

# Debate Messages

Every message contains:

```text
speaker
content
round
createdAt
```

Possible speakers:

```text
user
advocate
challenger
judge
```

Example:

```json
{
  "speaker": "challenger",
  "content": "Your argument assumes...",
  "round": 2
}
```

This makes the debate history persistent and replayable.

---

# API

The backend exposes REST APIs for the main application flows.

Typical areas include:

```text
/auth
/scenarios
/debates
/profile
```

---

## Authentication

Authentication includes:

```text
Register
Login
Current User
Logout
```

Authentication uses JWT-based sessions and HTTP cookies.

---

## Scenarios

Scenario functionality includes:

```text
GET /scenarios
GET /scenarios/:id
```

Scenario listing supports filtering by fields such as:

```text
category
difficulty
status
```

---

## Debates

Debate functionality includes operations for:

```text
Create debate
Start debate
Submit response
Generate challenger response
Judge debate
Retrieve debate
```

The exact routes are implemented in the server's debate module.

---

# Frontend

The frontend is built using:

- Next.js
- React
- TypeScript
- Tailwind CSS
- App Router
- Vitest
- React Testing Library

---

## Frontend Structure

Conceptually:

```text
client/
└── src/
    ├── app/
    │   ├── dashboard/
    │   ├── scenarios/
    │   ├── debate/
    │   └── profile/
    │
    ├── components/
    └── lib/
        ├── api.ts
        ├── auth.ts
        ├── scenarios.ts
        └── debates.ts
```

---

# Main User Flow

The primary user journey is:

```text
Register / Login
      ↓
Dashboard
      ↓
Browse Scenarios
      ↓
Select Scenario
      ↓
Choose Position
      ↓
Start Debate
      ↓
Advocate
      ↓
User Response
      ↓
Challenger
      ↓
Repeat for configured rounds
      ↓
Judge
      ↓
Evaluation
      ↓
Profile / Debate History
```

---

# Scenario Page

The scenario page displays:

- Scenario category
- Difficulty
- Title
- Description
- Situation
- Constraints
- Available positions

The user selects a position before starting the debate.

---

# Debate Page

The debate page displays the conversation chronologically.

Messages are associated with:

```text
speaker
round
content
```

The interface distinguishes between:

```text
Advocate
You
Challenger
Judge
```

The user can submit their response during the user-response stage.

---

# Evaluation Page

After the debate is complete, the evaluation displays:

- Overall score
- Individual criteria scores
- Strengths
- Areas for improvement
- Judge feedback

This turns the debate into a learning loop rather than simply an AI chat.

---

# Authentication

The application provides:

```text
Register
Login
Logout
Current user
Profile
```

Protected resources require authentication.

The frontend sends authenticated requests using cookies:

```text
credentials: "include"
```

---

# Environment Variables

## Server

Create:

```text
server/.env
```

Example:

```env
NODE_ENV=development

PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/ai_debate_arena

JWT_SECRET=your_secret

OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=your-local-model

GEMINI_API_KEY=

GROQ_API_KEY=
```

Do not commit real API keys.

---

## Client

Create:

```text
client/.env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

# Local Development

## Requirements

Install:

- Node.js
- npm
- MongoDB
- Ollama (optional if using Groq/Gemini)
- Git

---

## Clone

```bash
git clone <repository-url>

cd ai-debate-arena
```

---

# Install Backend

```bash
cd server

npm install
```

---

# Install Frontend

```bash
cd client

npm install
```

---

# Start MongoDB

Make sure MongoDB is running locally.

The default development connection is configured through:

```text
MONGODB_URI
```

---

# Start Ollama

If using Ollama locally:

```bash
ollama serve
```

Then make sure the configured model exists:

```bash
ollama list
```

The application uses:

```text
OLLAMA_BASE_URL
OLLAMA_MODEL
```

---

# Start Backend

```bash
cd server

npm run dev
```

The backend will run on the configured port, typically:

```text
http://localhost:5000
```

---

# Start Frontend

In another terminal:

```bash
cd client

npm run dev
```

The frontend will typically run at:

```text
http://localhost:3000
```

---

# AI Provider Configurations

## Ollama

Ollama is useful for local development because inference runs locally.

Example:

```env
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:4b
```

The actual model should match the model installed locally.

---

## Groq

Groq can be used when deploying the application because the backend cannot rely on the developer's local Ollama installation.

Configure:

```env
GROQ_API_KEY=your_api_key
```

Then configure the Agent to use:

```text
provider: groq
model: <supported Groq model>
```

The application does not globally hardcode a Groq model.

The model is selected through Agent configuration.

---

## Gemini

Gemini is also supported as a provider.

Configure:

```env
GEMINI_API_KEY=your_api_key
```

The Agent specifies which Gemini model should be used.

---

# Deployment Architecture

Ollama is ideal for local development, but a deployed backend cannot normally access Ollama running on a developer's personal computer.

Therefore, the production architecture can use Groq:

```text
                   Production

┌──────────────┐
│   Vercel     │
│   Next.js    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Render    │
│   Express    │
└──────┬───────┘
       │
       ├───────────────┐
       │               │
       ▼               ▼
   MongoDB          Groq API
                       │
                       ▼
                      LLM
```

Local development can remain:

```text
Next.js
   ↓
Express
   ↓
Ollama
   ↓
Local LLM
```

Production can become:

```text
Next.js
   ↓
Express
   ↓
Groq
   ↓
Cloud LLM
```

The DebateEngine does not need to change because both implementations satisfy the same `AIProvider` interface.

---

# Testing

Testing is included to demonstrate application reliability and provide coverage of the core flows.

The project uses:

```text
Vitest
```

---

# Backend Tests

The backend currently contains focused unit and integration tests.

The test suite covers:

### Validation

Debate request validation is tested for:

- valid input
- missing scenario ID
- missing position
- invalid/empty values
- response length constraints

### Provider Factory

Tests verify:

- Ollama provider selection
- Gemini provider selection
- Groq provider selection

### Debate Round Progression

Tests verify:

- round progression
- final round detection
- transition to judging
- prevention of premature judging

### API Integration

Integration tests cover major API flows including:

- Registration
- Login
- Current user
- Published scenarios
- Debate creation
- Debate start
- User response
- Judging
- Evaluation
- Profile retrieval

AI network calls are mocked where appropriate.

This keeps tests deterministic and avoids requiring a live LLM provider.

---

# Backend Test Commands

Run tests:

```bash
npm test
```

Run coverage:

```bash
npm run test:coverage
```

Typecheck:

```bash
npm run typecheck
```

---

# Frontend Tests

The frontend uses:

```text
Vitest
React Testing Library
jsdom
```

Current frontend tests cover scenario and debate flows.

Examples include:

- Rendering scenario data
- Scenario interactions
- Debate message rendering
- Debate response interactions

Run:

```bash
npm test
```

Typecheck:

```bash
npm run typecheck
```

---

# Testing Strategy

The project intentionally uses multiple levels of testing.

```text
                 Testing Pyramid

                    E2E
                   /   \
                  /     \
             Integration
                /       \
               /         \
             Unit Tests
```

### Unit Tests

Used for:

- Validation
- Provider selection
- Debate state logic
- Round progression

### Integration Tests

Used for:

- Express routes
- Authentication flows
- Database interactions
- Debate lifecycle

### Frontend Tests

Used for:

- React components
- User interactions
- Scenario flows
- Debate flows

### AI Calls

Actual external AI calls are mocked during automated testing.

This prevents tests from depending on:

- Ollama availability
- Groq API availability
- Gemini API availability
- API keys
- model latency
- external network availability

---

# Security Considerations

Sensitive configuration should be stored in environment variables.

Never commit:

```text
.env
.env.local
API keys
JWT secrets
database credentials
```

API keys should never be exposed to the browser.

The frontend communicates with the backend, while AI provider credentials remain server-side.

---

# Design Decisions

## Why use an AI Provider abstraction?

Without an abstraction, the DebateEngine would contain provider-specific logic:

```text
if Ollama...
if Groq...
if Gemini...
```

That would tightly couple the application to individual providers.

Instead:

```text
DebateEngine
      ↓
AIProvider
      ↓
Provider implementation
```

This makes adding another provider significantly easier.

---

## Why are Agents separate from Providers?

A provider describes how the application communicates with an AI service.

An Agent describes what role the AI is performing.

For example:

```text
Provider:
Groq

Agent:
Challenger
```

These are different concepts.

The same Challenger Agent could potentially use:

```text
Ollama
Groq
Gemini
```

without changing the debate logic.

---

# Why Multiple AI Agents?

A normal chatbot might use:

```text
User → AI → User → AI
```

AI Debate Arena instead separates responsibilities:

```text
             ┌───────────┐
             │  Advocate │
             └─────┬─────┘
                   ↓
                User
                   ↓
             ┌───────────┐
             │ Challenger│
             └─────┬─────┘
                   ↓
                User
                   ↓
             ┌───────────┐
             │   Judge   │
             └───────────┘
```

This allows each AI to have a different objective.

### Advocate

Supports the selected position.

### Challenger

Attempts to expose weaknesses and challenge assumptions.

### Judge

Evaluates the user's actual performance rather than simply continuing the conversation.

---

# Why Store Debate State?

The debate is not a stateless chat.

The backend needs to know:

```text
Which round?
Whose turn?
Has the debate started?
Has the debate finished?
Should the Challenger respond?
Should the Judge run?
```

Therefore the debate stores:

```text
status
currentTurn
currentRound
messages
evaluation
```

This makes the workflow deterministic and recoverable.

---

# Future Improvements

Potential future improvements include:

- Dynamic difficulty
- Adaptive debate rounds
- More sophisticated Judge scoring
- Evidence verification
- AI-generated scenarios
- Debate history analytics
- Leaderboards
- User performance trends
- Skill-specific debate training
- Additional AI providers
- Streaming AI responses
- Better Markdown rendering
- Improved mobile UI
- Real-time debate updates
- More advanced E2E testing

---

# Current Scope

The current version focuses on the core experience:

```text
Authentication
      ↓
Scenario Selection
      ↓
Position Selection
      ↓
Multi-round Debate
      ↓
AI Challenger
      ↓
AI Judge
      ↓
Performance Evaluation
      ↓
Profile / History
```

The goal is to demonstrate an AI-powered application with meaningful state management and orchestration rather than a conventional CRUD application.

---

# Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- App Router
- Vitest
- React Testing Library

## Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- Zod
- JWT
- Vitest

## AI

- Ollama
- Groq
- Gemini

## Deployment

Potential deployment architecture:

- Vercel — Next.js frontend
- Render — Express backend
- MongoDB Atlas — database
- Groq — production LLM inference

Local development can use:

- Ollama — local LLM inference

---

# Project Goals

AI Debate Arena was built to demonstrate practical full-stack and AI engineering concepts:

- Designing modular backend architecture
- Building stateful workflows
- Integrating multiple LLM providers
- Designing AI agents with distinct responsibilities
- Controlling structured LLM output
- Managing authentication
- Designing MongoDB schemas
- Building REST APIs
- Testing backend and frontend flows
- Separating local development infrastructure from production infrastructure

The central idea is simple:

> Don't just ask AI for an answer. Make AI compete, reason, and evaluate.
