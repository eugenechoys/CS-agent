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

## Recommendations to consider

This section is for engineers (especially Atul) and PM (Janhavi) to research next. Each topic is tagged: **current state** (what exists today), **recommended next step** (highest-value thing to do), and **future consideration** (worth knowing, not urgent).

### 1. Agent communication patterns

**Current state**: Hub-and-spoke. The master agent calls 5 specialist agents via `.asTool()` in `lib/agents/master.ts`. Specialists are leaf nodes with no inter-specialist routing. The master keeps conversation control at all times.

**Pattern comparison**:

| Pattern | What it means | Best for |
|---------|--------------|----------|
| Sequential / prompt chaining | Agent A → Agent B → Agent C | Tasks with clear ordered steps |
| Parallel | Multiple agents run simultaneously | Independent subtasks, speed |
| Orchestrator-workers | Hub agent delegates to specialists | Complex, dynamic task decomposition |
| Handoffs | One agent transfers control to another | Routing and specialization |
| Evaluator-optimizer | Generate → evaluate → refine loop | Quality-sensitive outputs |
| Agents as tools | Call other agents like function tools | Bounded subtasks, keep main conversation |

**Recommendation**: Keep the current agents-as-tools pattern for V1. It is simple to debug, simple to evaluate, and keeps one stable voice for HR. Prototype one handoff (analyze_data → build_report) to measure whether specialist-owned conversation improves quality.

**Key distinction**: Use agents as tools when the specialist helps with a bounded subtask but should not take over the conversation. Use handoffs when the specialist should own the next part of the interaction.

**Must-read resources**:

1. [OpenAI — Agent Orchestration](https://openai.github.io/openai-agents-python/multi_agent/) — Covers chaining, parallel, evaluator loops, handoffs, and the tools-vs-handoffs distinction. Most relevant since we use the OpenAI SDK.
2. [OpenAI Cookbook — Parallel Agents](https://developers.openai.com/cookbook/examples/agents_sdk/parallel_agents) — Fan-out and fan-in patterns using `asyncio.gather` for independent subtasks.
3. [OpenAI Cookbook — Multi-Agent Portfolio Collaboration](https://cookbook.openai.com/examples/agents_sdk/multi-agent-portfolio-collaboration/multi_agent_portfolio_collaboration) — Hub-and-spoke demo comparing handoff vs agent-as-tool collaboration.
4. [Anthropic — Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) — Foundational article on prompt chaining, parallelization, orchestrator-workers, and evaluator-optimizer patterns.
5. [Anthropic — Multi-Agent Architecture Guide](https://resources.anthropic.com/building-effective-ai-agents) — Decision framework for single-agent vs multi-agent vs workflow-based architectures.

### 2. Multi-tenant considerations

**Current state**: `companyName` is hardcoded to `"Choys"` in `run-master-agent.ts`. The in-memory `Map` store has no company scoping. All datasets are shared across all requests.

**Problem**: Each company will have its own data tables, its own active programs, and its own tool permissions. Not every company will want or have access to all tools (for example, one company might use Slack but not WhatsApp).

**Recommended next step**: Add a `companyId` field to `RunContext`. Scope all data access (datasets, programs, artifacts) by company. Introduce a per-company tool manifest that controls which tools are available to the agent for that company.

**Future consideration**: Multi-company analytics (benchmarking across companies), company-specific prompt customization, and role-based access control within a company.

### 3. Model selection strategy

**Current state**: All 6 agents use `gpt-5.1` (set in `lib/agents/master.ts` and `lib/agents/specialists.ts`).

**Recommendation**: Not every agent needs the same model. Complex reasoning agents should use stronger models. Simple formatting agents can use cheaper and faster models.

| Agent | Reasoning complexity | Recommended model | Why |
|-------|---------------------|-------------------|-----|
| MasterHRAgent | High (routing, multi-step decisions) | gpt-5.1 | Needs deep reasoning to choose specialists |
| HRStrategistAgent | High (creative ideation) | gpt-5.1 | Needs to generate novel program ideas |
| InsightsAnalystAgent | High (cross-dataset reasoning) | gpt-5.1 | Needs to reason about data relationships |
| ProgramDesignerAgent | Medium (structured output) | gpt-4.1-mini | Mostly fills structured schemas |
| CommsPlannerAgent | Medium (message writing) | gpt-4.1-mini | Structured output with template-like patterns |
| ReportComposerAgent | Medium (formatting) | gpt-4.1-mini | Packages existing analysis, less novel reasoning |
| Intent classifier | Low (keyword routing) | gpt-4.1-mini or code | Could even be deterministic |

**Cost implication**: Using gpt-4.1-mini for 3 specialists could reduce cost by approximately 40-60% per request with minimal quality loss on structured output tasks.

**Future consideration**: Thinking models (o3, o4-mini) for the analyst agent when complex multi-step data reasoning is required.

### 4. Guardrails

**Current state**: Safety guardrails are prompt-only, loaded from `prompts/policies/safety-policy.md`. No SDK-level validation.

**Recommended next step**: Add SDK-level guardrails:

- **Input guardrails**: Check for PII in user messages, validate that requests are within HR wellbeing scope, reject harmful or discriminatory requests before they reach the agent.
- **Output guardrails**: Validate that the agent's structured output passes Zod schema, verify that analysis claims reference actual data values, check that no medical diagnoses or discriminatory recommendations appear in the output.

**HR-specific guardrail rules**:
- Never diagnose physical or mental health conditions
- Never recommend discriminatory, coercive, or employee-harmful interventions
- Never claim certainty when data is weak or partial
- All outputs must be flagged as drafts for HR review

**Resource**: [OpenAI Agents SDK — Guardrails](https://openai.github.io/openai-agents-python/guardrails/)

### 5. Sessions, memory, and context management

This is the most important section for making Bokchoys production-ready.

#### The 3 layers of agent memory

Think of memory as three distinct tiers, each with a different lifespan:

| Layer | Scope | Example | Implementation |
|-------|-------|---------|----------------|
| In-session (short-term) | Within one conversation | Remembering what user said 3 messages ago | `MemorySession` from JS SDK (Python SDK has `SQLiteSession`) |
| Cross-session (mid-term) | Across multiple conversations | Remembering a user's preferences from last week | `RunContextWrapper` + DB-backed state |
| Long-term / semantic | Permanent, searchable | Fetching user history via vector DB | Pinecone, Weaviate, Zep, or Mem0 |

For simple automation, session memory alone might be enough. But for enterprise-level personalization and reasoning, long-term vector memory becomes key.

#### How OpenAI SDK handles memory natively

**Sessions** (built-in, the simplest approach): Sessions store conversation history for a specific session, allowing agents to maintain context without requiring explicit manual memory management. Each subsequent run with the same session includes the full conversation history.

**Note**: The Python SDK has `SQLiteSession` for file-based persistence. The JavaScript SDK (which Bokchoys uses) has `MemorySession` (in-memory only). For persistent sessions in JS, implement the `Session` interface with your own database backend.

```typescript
// JavaScript/TypeScript SDK (@openai/agents v0.8.3)
import { Agent, run } from "@openai/agents";

const agent = new Agent({ name: "Choys Agent", model: "gpt-5.1", instructions: "..." });

// In-memory session (lost on restart)
import { MemorySession } from "@openai/agents";
const session = new MemorySession();
const result = await run(agent, "Hello!", { session });

// For persistent sessions, implement the Session interface with PostgreSQL/Supabase
```

**Current Bokchoys state**: Conversation history is passed from the frontend as a transcript string on every request. No server-side session persistence. This means: lost on page refresh, no cross-session memory, growing token cost as conversation gets longer.

**Recommended next step**: Use `MemorySession` from the JS SDK for development. Plan a custom `Session` implementation backed by PostgreSQL or Supabase for production.

#### Managing long contexts (2 strategies)

As conversations get longer, you will hit token limits. Two approaches:

**Strategy 1 — Context trimming** (simple, deterministic): Drop older turns while keeping only the last N turns. Deterministic and simple, no summarizer variability, easy to reason about state, zero added latency. Latest tool results and parameters stay verbatim.

Best for: Customer support, short task agents, debugging.

**Strategy 2 — Summarization** (smarter, more memory): Summarize older conversation history into a compact "state of the world so far" message. Past requirements, decisions, and rationales persist beyond the N-turn window. Creates smoother UX where the agent "remembers" commitments.

Tradeoff: Details can be dropped or misweighted. If a bad fact enters the summary it can poison future behavior ("context poisoning").

Best for: Coaching agents, policy Q&A, long planning sessions.

**For Bokchoys**: Start with trimming (most copilot sessions are short). Add summarization later for multi-session program planning where HR works on a program over several days.

#### Persistent long-term memory (cross-session)

The `RunContextWrapper` in the OpenAI Agents SDK provides the foundation for state-based memory. It allows developers to define structured state objects that persist across runs.

**The recommended pattern from OpenAI**: State object (user profile + global memory notes) stored in your system → distill memories during a run (tool call → session notes) → consolidate session notes into global notes at the end (dedupe + conflict resolution) → inject a well-crafted state at the start of each run with precedence rules: latest user input → session overrides → global defaults.

**For vector/semantic memory** (retrieve by meaning, not exact match): Use a vector database like Pinecone, Weaviate, or Zep. Mem0 is a popular plug-in for the OpenAI SDK specifically.

**For Bokchoys specifically, what should persist**:
- Company context: name, size, department list, active programs, past program results
- User context: role, department, past conversations, preferences
- Program history: what was created, what worked, participation rates

#### Core design principles

1. **Design memory around the task, not generically.** Ask: "If this were a human HR analyst performing the same task, what would they actively hold in working memory to get the job done?"
2. **State-based is better than retrieval-based for structured data.** Retrieval-based memory treats past interactions as loosely related documents. State-based memory encodes knowledge as structured, authoritative fields with clear precedence. The agent behaves more like a persistent concierge than a search engine.
3. **Start simple, layer up.** MemorySession first (JS SDK), then implement Session interface with DB, then add vector DB. Do not over-engineer from day one.
4. **Bound noisy content aggressively.** Tool outputs should be truncated, long text middle-truncated, and function output content items budgeted. Auto-compaction should trigger when usage crosses approximately 90% of the model's context window.

#### Quick decision guide

- Need memory within ONE session? → Use `MemorySession` (JS SDK) or `SQLiteSession` (Python SDK)
- Need memory ACROSS sessions (user preferences, history)? → Use `RunContextWrapper` + structured state object, or plug in Mem0 or Redis
- Need memory by MEANING (semantic search)? → Add a vector DB (Pinecone, Weaviate, Zep)
- Conversation getting too long? → Short tasks: context trimming (last N turns). Long tasks: summarization.

#### Key links

- [Sessions (official docs)](https://openai.github.io/openai-agents-python/sessions/)
- [Short-term memory and context trimming](https://cookbook.openai.com/examples/agents_sdk/session_memory)
- [Long-term memory and state management](https://developers.openai.com/cookbook/examples/agents_sdk/context_personalization)
- [Memory API reference](https://openai.github.io/openai-agents-python/ref/memory/)

### 6. Streaming

**Current state**: The `run()` function in `run-master-agent.ts` returns a complete result. Users see a thinking indicator with animated dots while waiting.

**Recommendation**: Use `run(agent, input, { stream: true })` (JS SDK) with Server-Sent Events to show real-time agent activity. **Status: IMPLEMENTED** — the API route now supports `{ stream: true }` and emits SSE events for thinking steps, specialist calls, and tool usage.

**Current implementation**: `lib/agents/run-master-streamed.ts` iterates `RunStreamEvent` objects and emits `thinking`, `complete`, and `error` SSE events. The frontend reads the stream and updates the thinking indicator in real-time.

**Impact**: Better UX. Users see which specialist is working and what tools are being called, similar to OpenAI's ChatGPT interface or Claude's thinking process.

**Resource**: [OpenAI Agents SDK — Streaming](https://openai.github.io/openai-agents-python/streaming/)

### 7. Handoffs

**Current state**: V1 deliberately chose NOT to use handoffs (`ARCHITECTURE.md`, section "Why manager-style orchestration"). This was the right starting point for simpler debugging and a stable single voice.

**When handoffs add value**: Multi-step workflows where a specialist should own the next part of the conversation. For example, after the analyst finds that Engineering stress is high, the conversation could hand off to the strategist to brainstorm a targeted program — without returning to the master in between.

**Recommendation**: Prototype one handoff for the analyze_data → build_report chain. Measure whether quality improves compared to the current master-routes-both approach.

**Resource**: [OpenAI Agents SDK — Handoffs](https://openai.github.io/openai-agents-python/handoffs/)

### 8. Evals

**Current state**: Manual testing only (documented in `TEAM-CHECKLISTS.md`). No automated scoring.

#### What to evaluate

| Dimension | How to measure | Deterministic? |
|-----------|---------------|----------------|
| Intent accuracy | Does classified intent match expected? | Yes — exact match |
| Chat brevity | Word count under 30? | Yes — count words |
| Artifact presence | Did the agent return structured artifacts? | Yes — check if kpis, tables, charts are non-empty |
| Data grounding | Do insights reference real data values? | Partial — check datasetsUsed is non-empty |
| Follow-up quality | Does message end with a question? | Yes — regex check |
| Specialist routing | Did master call the right specialist? | Yes — check trace.specialists |
| Language simplicity | Is the language 4-year-old friendly? | No — needs LLM judge |
| Artifact quality | Are the KPIs, charts, and tables useful? | No — needs LLM judge |

#### Approach: 2-layer eval

**Layer 1 — Deterministic checks**: Run `runMasterAgent()` with test prompts, check outputs programmatically (word count, schema validation, intent match, datasetsUsed array).

**Layer 2 — LLM judge**: For subjective quality, use a judge prompt that scores the response:

```
You are evaluating an HR copilot response. Score 1-5 on each dimension:

1. SIMPLICITY: Is the language simple enough for a non-technical HR person?
   (1 = jargon-heavy, 5 = crystal clear)
2. USEFULNESS: Would an HR person find the artifacts actionable?
   (1 = generic, 5 = specific and actionable)
3. DATA GROUNDING: Are claims backed by actual data values?
   (1 = hallucinated, 5 = every claim has a number)
4. COMPLETENESS: Does the response fully address the user question?
   (1 = missed the point, 5 = comprehensive)
5. BREVITY: Is the chat message appropriately short with details in artifacts?
   (1 = wall of text, 5 = concise)

Return a JSON object with scores for each dimension and a brief justification.
```

#### Future: automated eval script

Create `scripts/eval.ts` that runs 20 test prompts, collects outputs, runs deterministic checks, and optionally runs the LLM judge. Output a scorecard CSV. Track scores over time to detect prompt regressions.

#### Key links

- [OpenAI Evals guide](https://developers.openai.com/api/docs/guides/evals)
- [OpenAI Evals API reference](https://developers.openai.com/api/reference/resources/evals)

## Current implementation note

This repo includes:

- documentation for engineers and non-technical starters
- a Next.js starter shell
- typed schemas
- mock dataset ingestion and analysis
- artifact renderers
- an OpenAI Agents SDK integration layer with a safe mock fallback when the runtime is unavailable

That means engineers can start from a concrete foundation now, while still having a clean path to swap in real persistence, live integrations, stronger evaluation, and more capable tool execution later.
