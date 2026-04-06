# Bokchoys V2 — Team Checklists

Each person owns a clear lane. The principle: **agents decide, tools execute, HR steers and approves.**

---

## Janhavi (PM — Owns Prompts, Experience, and Eval)

### Understanding the system
- [ ] Read `ARCHITECTURE.md` and `README.md` to understand agents, tools, skills, artifacts
- [ ] Open `/prompts` editor page — read every prompt file to understand what the agent is told
- [ ] Open `/raw-data` page — browse all 12 datasets to understand what data the agent sees
- [ ] Open `/copilot` — test all 4 starter prompts and see what artifacts come out

### Define ideal experience per intent
- [ ] **Brainstorm**: What should the agent ask? How many ideas? What data should it reference? What's the follow-up flow?
- [ ] **Design Program**: What calendar structure? How many days? What activities? Should polls/surveys have AI-generated questions?
- [ ] **Analyze Data**: What KPIs matter most to HR? What charts are useful? What tables should appear? What's "4-year-old friendly"?
- [ ] **Build Report**: What slides structure? How many? What's leadership-ready vs working draft?

### Own the prompts
- [ ] For each intent, write the ideal prompt behavior in a doc (expected input → expected output)
- [ ] Edit prompts in `/prompts` editor — change master agent, specialists, skills, policies
- [ ] Test each prompt change by sending the same question and comparing artifacts
- [ ] **Key check**: Is the output AI-decided or hardcoded? Open "How I worked on this" trace — if it says "template fallback" that's hardcoded. We want "AI agent decided all content."

### Eval testing
- [ ] Create a spreadsheet of 20 test prompts covering all 4 intents
- [ ] For each: record what the agent returned (message, artifacts, trace)
- [ ] Score: Was the chat short (<30 words)? Were artifacts useful? Was language simple? Did it ask a follow-up?
- [ ] Flag failures: wrong intent routing, missing artifacts, too much chat text, jargon, hardcoded templates
- [ ] Prioritize prompt fixes based on failure patterns

### Deterministic vs AI checklist
- [ ] **Should be AI-decided (non-deterministic)**: idea content, program structure, poll questions, survey questions, comms copy, chart choices, KPI labels, insights
- [ ] **Should be deterministic (tools)**: Zod schema validation, artifact rendering, channel UI mockups, data loading, API routes
- [ ] If you find something AI should decide but is hardcoded → file a task for Atul

---

## Eugene (Lead — Architecture, Agent Design, Evals)

### Architecture guidance
- [ ] Review and refine the agent-to-agent pattern: master → specialist → tools
- [ ] Decide: should specialists call each other? Or always go through master?
- [ ] Decide: should the agent see ALL data rows or just summaries? (token cost vs accuracy tradeoff)
- [ ] Define the memory strategy: what should persist across sessions? (user preferences, past programs, company context)
- [ ] Define eval framework: what metrics measure "good" agent behavior?

### Help Janhavi on experience
- [ ] Review Janhavi's ideal experience docs for each intent
- [ ] Challenge: is this achievable with current OpenAI SDK structured output? What are the limits?
- [ ] Advise on prompt engineering: when to use system prompt vs few-shot examples vs structured output hints

### Eval system
- [ ] Design automated eval pipeline: test prompts → run agent → score outputs
- [ ] Define scoring rubric: chat length, artifact quality, intent accuracy, data grounding
- [ ] Set up regression testing: when prompts change, do old test cases still pass?
- [ ] Track cost per request and latency — optimize context window usage

### Token budget management
- [ ] Audit: how many tokens is the current transcript? (dataset catalog + structured output hint + chat history)
- [ ] Decide: should we compress dataset catalog for long conversations?
- [ ] Decide: should we summarize previous artifacts instead of sending full history?

---

## Atul (Backend — Database, Tools, Agent Infrastructure)

### Connect real data
- [ ] Give the agent access to the real database (start with one company, ideally KK)
- [ ] Replace in-memory `Map` store with real database (Postgres/Supabase)
- [ ] Build data access layer: the agent should query real tables, not just sample CSVs
- [ ] Implement proper joins: employees → programs → participation → surveys

### Connect real tools
- [ ] Expose real Choys tools as agent functions: habits, steps, recognition, moments wall
- [ ] Build `create_poll`, `create_survey`, `create_game` tools that write to the real backend
- [ ] Build `send_notification` tool that sends real Slack/email/WhatsApp messages
- [ ] Implement `create_program` tool that saves programs to the database

### Agent infrastructure research
- [ ] Research A2A (Agent-to-Agent) protocol — is it better than current `.asTool()` pattern?
- [ ] Research other agent frameworks: LangGraph, CrewAI, AutoGen — pros/cons vs OpenAI Agents SDK
- [ ] Research guardrails: how to prevent agent from making dangerous decisions
- [ ] Research observability: how to log and replay agent decisions for debugging

### Memory and context
- [ ] Implement conversation memory: store chat history in database, load on session resume
- [ ] Implement company context: agent should know company name, size, past programs, preferences
- [ ] Implement user context: agent should know who's asking (HR manager vs director vs exec)
- [ ] Research RAG (Retrieval Augmented Generation): should we embed company docs for agent context?
- [ ] **Token optimization**: compress context, use smart retrieval instead of dumping all data

### Work with Janhavi
- [ ] When Janhavi finds something hardcoded that should be AI-decided → make it agent-driven
- [ ] When Janhavi designs new artifact types → build the schema and renderer
- [ ] When evals show the agent picks wrong data → improve the data access layer

---

## Rohit (Frontend + Comms Execution)

### Comms execution (make it real)
- [ ] Slack integration: when agent creates a comms plan, actually send Slack messages
- [ ] Email integration: connect to email service (SendGrid/Resend) for program launch emails
- [ ] Browser extension: build the nudge notification system
- [ ] WhatsApp integration: connect to WhatsApp Business API for high-priority messages
- [ ] Build a "Send now" / "Schedule" button on each comms artifact message

### Frontend with Janhavi
- [ ] Implement Janhavi's ideal experience designs for each intent
- [ ] Build any new artifact renderers Janhavi designs (funnel charts, heatmaps, comparison views)
- [ ] Improve mobile experience based on Janhavi's feedback
- [ ] Build export features: download artifacts as PDF, CSV, or share link
- [ ] Build "approve draft" workflow: HR clicks approve → program goes live

### UI polish
- [ ] Add loading skeletons instead of blank states
- [ ] Add keyboard shortcuts (Enter to send, Cmd+K for new chat)
- [ ] Add toast notifications for save/error states
- [ ] Improve the prompt editor with syntax highlighting
- [ ] Add dark mode support

---

## Shared Principles

1. **Agent decides, tools execute** — if you're hardcoding content the agent should decide, stop and redesign
2. **4-year-old friendly** — all text the user sees should be simple. No jargon. No technical terms.
3. **30-word chat, everything in artifacts** — chat is short summary + follow-up question. Details go right.
4. **Test with prompts, not code** — change behavior by editing `/prompts` MD files, not TypeScript
5. **Data grounds everything** — every insight must reference actual data. No hallucinated numbers.
