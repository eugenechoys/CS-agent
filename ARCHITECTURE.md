# Bokchoys Architecture

## Why Bokchoys exists

Bokchoys is the Choys foundation for an AI HR engagement copilot focused on wellbeing. The product exists to help HR teams move from vague ideas to strong programs, and from disconnected engagement actions to coherent program design.

The goal is not to create a generic assistant that simply rewrites HR requests. The goal is to create an agent system that can make informed recommendations about:

- which engagement approach fits the problem
- which poll, survey, or game should be used
- what communication sequence should happen before, during, and after a program
- what analysis or report output is most useful

The operating principle is:

- the agent decides
- HR steers and approves
- tools build validated outputs
- the UI renders typed artifacts

That principle is important because it shapes the whole architecture. Bokchoys is an agentic system, not a template engine.

## The four intent paths

Bokchoys supports four top-level intent modes:

### 1. `brainstorm`

Use this when HR is still in ideation mode.

Typical input:

- “We want something around stress.”
- “Help us think of a wellbeing engagement idea.”

Expected system behavior:

- clarify the objective
- surface stronger options
- challenge shallow ideas
- produce an initial artifact such as an idea board

### 2. `design_program`

Use this when HR already has a clear enough direction to move into program creation.

Typical input:

- “Create a 2-week stress reset program.”
- “Design a one-day hydration challenge.”

Expected system behavior:

- choose the best activity mix
- build the program calendar
- decide the right polls, surveys, and games
- create the communication plan by default

### 3. `analyze_data`

Use this when HR wants answers grounded in uploaded or mock data.

Typical input:

- “Analyze this participation dataset.”
- “Show me what stands out in this survey data.”

Expected system behavior:

- inspect only available data
- produce grounded findings
- generate a draft analytical table and, when useful, chart-friendly output

### 4. `build_report`

Use this when HR wants a presentation-ready or leadership-ready artifact.

Typical input:

- “Create a report from this dataset.”
- “Show this as a short deck.”

Expected system behavior:

- interpret the analysis
- choose the clearest structure
- return table, chart, and slide-style artifacts

## Agent-system mental model

This section is for engineers who are new to agent harness design.

### What is an agent?

An agent is an LLM configured with:

- instructions
- tools
- a model
- optional structured output contracts

An agent is useful when the system must reason about what to do next, not just fill a template.

### What is a specialist agent?

A specialist agent is an agent with narrower responsibility. It should own one domain of reasoning clearly, such as:

- ideation
- program design
- communications planning
- analysis
- reporting

Specialists are helpful because they keep prompts smaller, reduce role confusion, and make the system easier to debug.

### What is a tool?

A tool is deterministic code that the model can invoke. Tools should do structured work such as:

- generating a typed program draft
- generating a comms plan
- analyzing a dataset
- building an artifact contract

Important rule:

- agents reason
- tools execute

If something needs schema validation, deterministic behavior, or stable business logic, it should usually live in a tool rather than only in prompt text.

### What is a skill?

In this repo, a skill is a reusable prompt or instruction module. Skills are where we keep reasoning guidance that may evolve over time, for example:

- how to think about wellbeing program design
- how to decide channels and message cadence
- how to stay grounded in data
- how to package a report for leadership

### What is an artifact?

An artifact is a typed output contract that the frontend can render. The artifact is not just raw HTML or plain text. It is structured data, for example:

- idea board
- program calendar
- comms plan
- table report
- chart report
- slides report

Important rule:

- the artifact contract is the source of truth
- the renderer is just a presentation layer

## Why manager-style orchestration

V1 should use a manager-style master agent, not handoffs.

That means:

- the master agent keeps control of the conversation
- specialist agents are called as tools
- the user experiences one stable assistant voice

This is the right starting point for Bokchoys because it gives us:

- simpler debugging
- simpler approval flow
- clearer responsibility boundaries
- better onboarding for engineers who are new to multi-agent systems

## V1 agent stack

### `MasterHRAgent`

Owns the conversation and final response.

Responsibilities:

- classify and interpret the request
- decide whether to brainstorm, design, analyze, or report
- call specialist agents as needed
- merge outputs into a coherent draft response
- enforce the HR approval boundary

### `HRStrategistAgent`

Handles vague inputs and early ideation.

Responsibilities:

- clarify the problem
- propose directions
- challenge weak assumptions
- shape the first artifact

### `ProgramDesignerAgent`

Handles concrete program design.

Responsibilities:

- create the program structure
- choose activities
- decide when polls, surveys, or games fit
- produce a draft program calendar

### `CommsPlannerAgent`

Handles communication strategy.

Responsibilities:

- plan before, during, and after sequences
- choose channels
- recommend cadence
- draft messages

### `InsightsAnalystAgent`

Handles dataset-grounded analysis.

Responsibilities:

- inspect uploaded or mock data
- compute useful starter metrics
- produce grounded findings
- prepare table or chart inputs

### `ReportComposerAgent`

Handles reporting and executive packaging.

Responsibilities:

- transform analysis into clearer artifacts
- produce chart-ready outputs
- create slide-style summaries

## Skills in this repo

The `lib/skills` directory holds prompt modules for:

- wellbeing program ideation
- HR engagement design
- communication strategy
- game/poll/survey selection
- data analysis discipline
- executive reporting
- artifact composition

These are not transport mechanisms and not APIs. They are modular reasoning guides.

Use them to keep prompts maintainable and composable.

For PM-friendly prompt review, this repo also includes a markdown prompt pack under [`prompts/`](./prompts), including the compiled master prompt, specialist prompts, and the current skill texts.

## Tools in this repo

The `lib/tools` directory contains deterministic, schema-oriented helpers for:

- `generate_program_outline`
- `generate_program_calendar`
- `generate_comms_plan`
- `generate_message_sequence`
- `build_poll_draft`
- `build_survey_draft`
- `build_game_draft`
- `ingest_dataset`
- `analyze_dataset`
- `build_table_artifact`
- `build_chart_spec`
- `build_slides_artifact`

These tools are the execution layer. They should be easy to test and safe to call from agents.

## Communication strategy model

Communication planning is part of every designed program by default.

Every generated program should include:

- pre-program messages
- during-program messages
- post-program messages

Each message draft should include:

- phase
- channel
- timing or offset
- purpose
- importance
- draft copy
- rationale
- editable status

Current channel policy:

- WhatsApp for direct, important, more personal moments
- Email for formal launches, summaries, and wrap-ups
- Slack for reminders and work-context nudges
- Teams for reminders and participation prompts
- Browser extension for ambient nudges

This policy should guide the model, but HR can override it.

## Artifact contract

Artifacts are structured JSON and rendered by the UI.

Current artifact types:

- `idea_board`
- `program_calendar`
- `comms_plan`
- `table_report`
- `chart_report`
- `slides_report`

Do not let model-authored HTML become the core contract.

If HTML export is needed later, derive it from typed artifact data after validation.

## Data and control model

This repo currently supports:

- uploaded datasets
- mock datasets

The current storage layer is intentionally simple and process-local. It exists to make the foundation tangible without pretending we already have production persistence.

Control boundary:

- the agent can recommend
- HR can steer or override
- outputs are drafts in v1

This matters because the system should feel opinionated without becoming unsafe or over-automated.

## Suggested repo structure

This repo is organized around the intended production shape:

- `app/`
- `app/copilot/`
- `app/api/`
- `components/`
- `lib/agents/`
- `lib/skills/`
- `lib/tools/`
- `lib/artifacts/`
- `lib/schemas/`
- `lib/policies/`
- `lib/store/`

Responsibilities:

- `app`: routes and pages
- `components`: UI surfaces
- `agents`: orchestration, intent handling, OpenAI runtime wiring
- `skills`: prompt modules
- `tools`: deterministic execution functions
- `artifacts`: renderers and export helpers
- `schemas`: shared Zod contracts
- `policies`: business rules and guardrails
- `store`: temporary in-memory registry for artifacts and datasets

## Engineering principles

### 1. Separate reasoning from execution

Prompts and agents should decide. Tools should do structured work. Avoid mixing both concerns in the same layer.

### 2. Keep prompts modular

Do not pile everything into one giant system prompt. Use skills and role-specific agents so reasoning remains understandable.

### 3. Keep contracts typed

Artifacts, program drafts, comms plans, analysis results, and chart specs should all be typed and validated.

### 4. Put stable business rules in code

If a rule should always hold, such as draft-only approval or channel policy defaults, do not rely on prompt wording alone.

### 5. Stay grounded in source data

Analysis and reports should only say what the data supports. If data is missing or ambiguous, say so.

### 6. Design for future service replacement

Today’s upload-backed or mock-backed helpers should be replaceable by future Choys services without changing the higher-level agent contract.

## Current implementation note

This repo includes:

- documentation for engineers and non-technical starters
- a Next.js starter shell
- typed schemas
- mock dataset ingestion and analysis
- artifact renderers
- an OpenAI Agents SDK integration layer with a safe mock fallback when the runtime is unavailable

That means engineers can start from a concrete foundation now, while still having a clean path to swap in real persistence, live integrations, stronger evaluation, and more capable tool execution later.
