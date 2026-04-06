# Bokchoys Tool Catalog

This file explains the tool layer in plain language so PMs and engineers can review what is deterministic versus what should remain agent reasoning.

## Tool philosophy

The model should decide **what** to create. Tools should decide **how to construct and validate** the resulting object.

That means:

- format and schema enforcement belong in tools
- reusable generation building blocks belong in tools
- stable business logic belongs in tools or policies
- higher-level judgment belongs in agents and skills

## Program tools

### `generate_program_outline`

Purpose:
- turn a brief into an initial strategic program frame

Input:
- `brief`
- optional `cadence`
- optional `targetAudience`

Output:
- title
- objective
- target audience
- cadence

### `generate_program_calendar`

Purpose:
- build a full draft program with calendar, engagement items, and communications

Input:
- `brief`
- optional `cadence`
- optional `targetAudience`

Output:
- `ProgramDraft`

### `generate_comms_plan`

Purpose:
- build a communication plan across before, during, and after phases

Input:
- `title`
- `objective`
- `cadence`

Output:
- `CommsPlan`

### `generate_message_sequence`

Purpose:
- generate the individual draft messages in a communication plan

Input:
- `title`
- `objective`
- `cadence`

Output:
- list of `MessageDraft`

## Engagement draft tools

### `build_poll_draft`

Purpose:
- generate a poll recommendation as a typed draft

Input:
- `topic`

### `build_survey_draft`

Purpose:
- generate a survey recommendation as a typed draft

Input:
- `topic`

### `build_game_draft`

Purpose:
- generate a game recommendation from the available game template set

Input:
- `topic`

Current game template library:
- `would_you_rather`
- `tap_challenge`
- `trivia`
- `guess_the_fact`
- `this_or_that`

## Data tools

### `ingest_dataset`

Purpose:
- fetch an uploaded dataset or fall back to the mock dataset

Input:
- optional `datasetId`

### `analyze_dataset`

Purpose:
- produce a grounded analytical result from the dataset

Input:
- optional `datasetId`
- optional `query`

Output:
- `DatasetAnalysisResult`

## Artifact tools

### `build_table_artifact`

Purpose:
- turn analysis rows into a typed table artifact

### `build_chart_spec`

Purpose:
- turn analysis into a standard chart specification

Current chart types:
- `bar`
- `line`
- `pie`
- `kpi`
- `trend`

### `build_slides_artifact`

Purpose:
- create a slide-style summary artifact from an analysis result

## What PMs should review here

When reviewing tools, ask:

- should this behavior stay deterministic?
- does the tool contract expose the right knobs?
- should this be one tool or two?
- are there rules hiding in prompt text that should move into code?

