# Bokchoys

Bokchoys is an AI HR engagement copilot being built by Choys. Its job is to help HR teams improve wellbeing programs with more strategy, clearer execution, and better communication.

This repo is the foundation for that product. It gives the team a shared model for what Bokchoys is, how it behaves, and how engineers should structure the system as it grows.

## What Bokchoys does

Bokchoys helps HR teams with four kinds of work:

- Brainstorming when the idea is still vague
- Designing concrete programs when the idea is already clear
- Analyzing uploaded or mock data
- Generating report-style outputs with tables, charts, and slide-like summaries

The important product principle is simple:

- The agent decides what to recommend
- HR steers and approves
- Tools build validated outputs
- The UI renders typed artifacts

Bokchoys is not meant to be a passive assistant that only reformats instructions. It is meant to behave more like an HR strategist that can recommend the right program shape, engagement format, and communication pattern.

## How Bokchoys thinks

If HR arrives with a vague request, Bokchoys should help shape the idea first. That usually means:

- clarifying the goal
- challenging weak assumptions
- proposing a few stronger directions
- turning the early concept into a usable draft artifact

If HR arrives with a clear request, Bokchoys should move directly into program design. That means the system can decide:

- what poll, survey, or game best fits
- what the cadence should look like
- how communication should be staged
- what draft outputs need to be produced

Every designed program should include a communication plan by default:

- before the program
- during the program
- after the program

## Channels and engagement types

Bokchoys is designed to think across these channels:

- WhatsApp for more direct or important moments
- Email for official communication, launches, and summaries
- Slack for reminders and in-work nudges
- Teams for reminders and in-work prompts
- Browser extension for ambient nudges

It is also designed to recommend and draft multiple engagement formats:

- Polls
- Surveys
- Games
- Communication sequences
- Program calendars
- Analytical tables
- Chart summaries
- Slides-style reports

## Example workflows

### 1. Vague idea

“We want to do something around employee stress, but we do not know what the program should look like.”

Bokchoys should brainstorm a few directions first, show the tradeoffs, and recommend which one to turn into a real program draft.

### 2. Clear program brief

“Design a one-day hydration challenge and include the communications before, during, and after.”

Bokchoys should move straight into program design, choose the right engagement mix, and produce a full draft program plus communications plan.

### 3. Data question

“We uploaded engagement data. Show us the most useful table and explain what stands out.”

Bokchoys should ground the answer in the available data and produce a draft analytical artifact that HR can review.

### 4. Report request

“Turn this participation dataset into a short leadership-ready report.”

Bokchoys should generate a report-style package with tables, charts, and slide-like outputs.

## Getting started

### Prerequisites

- Node.js 18 or later
- An OpenAI API key (GPT-5.1 access recommended)

### Setup

```bash
git clone https://github.com/eugworld/bokchoy.git
cd bokchoy
cp .env.example .env.local
# Edit .env.local and add your OpenAI API key
npm install
npm run dev
# Open http://localhost:3000
```

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key. The copilot needs this to run the agent. |

## Pages

| Page | URL | What it does |
|------|-----|-------------|
| Landing | `/` | Product overview, architecture visualization, technical education |
| Copilot | `/copilot` | Main chat interface — 30% chat, 70% artifacts, resizable |
| Prompt Editor | `/prompts` | View and edit all 17 agent, specialist, skill, and policy prompts |
| Raw Data | `/raw-data` | Browse all 12 sample datasets in table format |

## How to use this repo

### If you are new

1. Read this `README.md` to understand what Bokchoys does
2. Open `/copilot` and try the starter prompts
3. Open `/raw-data` to see what data the agent can analyze

### If you are a PM (Janhavi)

1. Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the system design
2. Open `/prompts` to read and edit all agent prompts
3. Read [`TEAM-CHECKLISTS.md`](./TEAM-CHECKLISTS.md) for your checklist
4. Focus on: defining ideal experience per intent, owning prompts, running evals

### If you are an engineer (Atul, Rohit)

1. Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) — especially the new "Recommendations to consider" section
2. Read [`TEAM-CHECKLISTS.md`](./TEAM-CHECKLISTS.md) for your specific checklist
3. Read the 5 key files first:
   - `lib/agents/run-master-agent.ts` — the main orchestration flow
   - `lib/agents/master.ts` — how the master agent is created
   - `lib/agents/specialists.ts` — how specialists are created and connected
   - `lib/schemas/bokchoys.ts` — all Zod schemas
   - `lib/prompts/load-prompt.ts` — how prompts are loaded, cached, and saved
4. Read [`prompts/README.md`](./prompts/README.md) for the prompt pack

### If you are testing evals

1. Read the "Evals" section in [`ARCHITECTURE.md`](./ARCHITECTURE.md)
2. Use `/copilot` with the 4 starter prompts to test all intent paths
3. Check "How I worked on this" trace on each response to verify AI-decided vs template fallback
4. Score responses using the judge prompt template in ARCHITECTURE.md
