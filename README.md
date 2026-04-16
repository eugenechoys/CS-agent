# CS Agent — CHOYS AI Agent Harness

This repo is an AI agent harness demo built on top of the [OpenAI Agents SDK](https://github.com/openai/openai-agents-python). It contains two production-style AI agents:

1. **Bokchoys HR Copilot** — helps HR teams brainstorm, design, and communicate employee engagement programs
2. **CS Agent** — a customer success agent for the CHOYS employee wellbeing platform, with a paired trainer agent for evaluation and coaching

## What this is

This project demonstrates how to build multi-agent systems using Next.js + the OpenAI Agents SDK. It includes:

- Multi-agent orchestration with a master agent coordinating specialists
- Streaming responses with real-time thinking indicators
- Guardrails to keep agents on-scope
- Structured outputs validated through Zod schemas
- Tool-based execution for deterministic operations
- Prompt management with live editing via the UI
- A trainer/evaluator agent pattern for CS quality assurance

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router), TypeScript |
| AI | OpenAI Agents SDK (`@openai/agents`), OpenAI API |
| Validation | Zod |
| Styling | Tailwind CSS |
| Runtime | Node.js 18+ |

## Getting started

### Prerequisites

- Node.js 18 or later
- An OpenAI API key (GPT-4o or GPT-4.1 access recommended)

### Setup

```bash
git clone https://github.com/eugenechoys/CS-agent.git
cd CS-agent
cp .env.example .env.local
# Edit .env.local and add your OpenAI API key
npm install
npm run dev
# Open http://localhost:3000
```

### Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | **Yes** | Your OpenAI API key. Get one at platform.openai.com |
| `CHOYS_DEMO_ACCESS_TOKEN` | No | Pre-seeded demo token to skip OTP sign-in on the CS agent demo |
| `CHOYS_API_ENV` | No | Backend environment — `dev` or `prod` (default: `dev`) |
| `CHOYS_API_BASE_URL_DEV` | No | Override for the dev API base URL |
| `CHOYS_API_BASE_URL_PROD` | No | Override for the prod API base URL |
| `CHOYS_APP_PLATFORM` | No | Platform identifier (default: `choys-web-app`) |

> **Never commit `.env.local`** — it is gitignored by default.

## Pages

| Page | URL | What it does |
|------|-----|-------------|
| Landing | `/` | Product overview and architecture visualization |
| HR Copilot | `/copilot` | Main Bokchoys chat interface — 30% chat, 70% artifact panel |
| CS Agent | `/cs-agent` | Customer success chat agent demo with employee data lookup |
| CS Trainer | `/cs-trainer` | Trainer agent that evaluates CS agent responses |
| Prompt Editor | `/prompts` | View and live-edit all agent, specialist, skill, and policy prompts |
| Raw Data | `/raw-data` | Browse all sample datasets in table format |

## The CS Agent

The CS Agent is a warm, friendly support assistant for the CHOYS employee wellbeing platform. It handles two types of users:

- **Employees** asking about their insurance, benefits, wellness programs, or how to use the app
- **Prospects** considering CHOYS who have questions about the product or features

### What it can do

- Answer questions about CHOYS products, features, insurance plans, and benefits
- Look up a logged-in employee's personal data (insurance, benefits, enrollment status)
- Guide users through common tasks like filing a claim, resetting a password, or joining a challenge

### What it cannot do

- Make changes to accounts, insurance, or benefits — it directs users to HR or support@getchoys.com
- Provide medical or legal advice
- Share one employee's data with another
- Approve or deny insurance claims

### Demo login

To try the CS agent with sample employee data, use the demo login page. You can set a `CHOYS_DEMO_ACCESS_TOKEN` in your `.env.local` to pre-authenticate.

## The CS Trainer Agent

The CS Trainer evaluates CS agent responses for quality, tone, accuracy, and policy compliance. It is designed to:

- Score CS agent responses against a rubric
- Identify gaps in empathy, clarity, or policy adherence
- Suggest improved responses
- Help onboard new CS team members by demonstrating ideal responses

Access it at `/cs-trainer`.

## The HR Copilot (Bokchoys)

Bokchoys helps HR teams with four kinds of work:

- **Brainstorming** — clarifying vague ideas into strong program directions
- **Program design** — building concrete engagement programs with communication plans
- **Data analysis** — grounded analysis of employee engagement datasets
- **Report generation** — leadership-ready slide and table artifacts

Every designed program includes a communication plan covering before, during, and after the program.

Access it at `/copilot`.

## Project structure

```
app/
  api/           # API routes for each agent
  copilot/       # HR copilot UI
  cs-agent/      # CS agent UI
  cs-trainer/    # CS trainer UI
  prompts/       # Live prompt editor
  raw-data/      # Sample data browser
lib/
  agents/        # Agent definitions and run loops
  config/        # API key loading
  cs-demo/       # CS demo authentication and session
  data/          # Sample datasets
  prompts/       # Prompt loading and caching
  schemas/       # Zod validation schemas
  tools/         # Deterministic execution tools
components/      # React UI components
prompts/         # Markdown prompt files (editable via /prompts)
```

## Key files

| File | What it does |
|------|-------------|
| `lib/agents/cs-agent.ts` | CS agent definition and tool wiring |
| `lib/agents/trainer-agent.ts` | Trainer agent for evaluating CS responses |
| `lib/agents/run-master-agent.ts` | HR copilot orchestration loop |
| `lib/agents/run-cs-streamed.ts` | CS agent streaming run loop |
| `lib/agents/run-trainer-streamed.ts` | Trainer agent streaming run loop |
| `lib/schemas/cs-schemas.ts` | Zod schemas for CS agent I/O |
| `lib/tools/cs-tools.ts` | CS tools (employee lookup, knowledge base) |
| `lib/tools/trainer-tools.ts` | Trainer tools (scoring, evaluation) |
| `prompts/cs-agent.md` | CS agent system prompt (editable at `/prompts`) |
| `prompts/cs-trainer-agent.md` | Trainer agent system prompt |
