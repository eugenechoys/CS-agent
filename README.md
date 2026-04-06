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

## How to use this repo

This repository serves different audiences:

- Product, operations, and non-technical teammates can use this `README.md` to understand what Bokchoys is and what it is trying to do
- Engineers should read [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the detailed system design, agent model, tool contracts, and suggested code structure
- PMs and prompt reviewers can use [`prompts/README.md`](./prompts/README.md) for the markdown prompt pack, including the full master prompt, specialist prompts, skills, and tool catalog

At this stage, the repo is more about establishing the foundation than documenting a finished production stack. As the system matures, technical setup, deployment, and environment instructions can be expanded here.
