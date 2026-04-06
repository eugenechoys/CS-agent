# Bokchoys Prompt Pack

This directory exists so product managers, designers, and engineers can inspect and improve the Bokchoys agent harness without needing to read TypeScript first.

These markdown files are the **human-readable prompt layer** for the current system:

- full master agent prompt
- specialist agent prompts
- reusable skills
- tool catalog and tool contracts

## Why this exists

The runtime implementation lives in `lib/agents`, `lib/skills`, and `lib/tools`, but prompt iteration often happens outside engineering. This prompt pack makes it easier to:

- review the original prompt intent
- pressure-test phrasing
- design evaluations
- compare prompt revisions over time
- discuss agent behavior with PMs and non-engineering teammates

## How to use this folder

- Read [`master-agent.md`](./master-agent.md) to understand the main orchestrator prompt.
- Read files in [`specialists/`](./specialists) to inspect each specialist role.
- Read files in [`skills/`](./skills) to inspect the reusable reasoning modules.
- Read [`tools.md`](./tools.md) to understand what the model can call and what should stay deterministic.

## Source-of-truth note

For now:

- TypeScript is the runtime source of truth
- markdown is the PM-friendly review and eval layer

That means when prompts change in code, this folder should be updated in the same change. The goal is to keep the docs and runtime aligned closely enough that a PM can use this folder as the current prompt reference.

## Eval usage suggestion

When using these prompts for evals, test both:

- **behavioral quality**
  - Does Bokchoys choose the right mode?
  - Does it stay opinionated but editable?
  - Does it include communications by default in program design?

- **harness quality**
  - Does the master agent choose the right specialist?
  - Does it use tools when the work should be deterministic?
  - Does it keep outputs as draft artifacts instead of free-form prose only?

