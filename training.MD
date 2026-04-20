# Training the CS Agent — How to Use the AI Trainer

This is your guide for training the Choys CS Agent. The goal is simple: you chat with the trainer, it tells you what the agent got right or wrong, and you can update the agent's knowledge on the spot. No code required.

---

## What is the CS Trainer?

The **CS Trainer** (`/cs-trainer`) is a coaching tool that:

- Evaluates CS Agent responses for quality, tone, accuracy, and policy compliance
- Explains what's missing (empathy, clarity, product knowledge, etc.)
- Suggests better answers
- Lets you edit the agent's knowledge base directly from the chat

Think of it as a QA + editor in one. Every edit you save is immediately used by the live CS Agent.

---

## How the Knowledge Base Works

The CS Agent's behaviour is driven by a set of knowledge files:

| Folder | What it controls |
|---|---|
| `cs-general/` | Company info, products, insurance, FAQs, onboarding |
| `cs-modes/employee-cs/` | How the agent talks to employees |
| `cs-modes/hr-expert/` | How the agent talks to HR admins |
| `cs-policies/` | Safety rules, escalation paths |
| `cs-specific/` | Live data guidance, source summaries |

When you save a change in the trainer or the `/prompts` editor, it goes straight to the database and the next agent response picks it up.

---

## Daily Training Workflow (15–20 min)

This is the recommended routine. Stick to it and the agent will get noticeably better within a week.

### Step 1 — Open the CS Agent and test a scenario

Go to `/cs-agent` and ask something a real employee would ask. A few good starting points:

- "How do I submit a mental health claim?"
- "I can't find my insurance card"
- "What challenges can I join this month?"
- "My coverage doesn't include dental, why?"

### Step 2 — Review the response and copy it

If the answer feels off — wrong tone, missing information, too vague — copy the full exchange (your question + the agent's reply).

### Step 3 — Paste it into the Trainer

Go to `/cs-trainer` and say something like:

> "Evaluate this response: [paste the exchange]"

The trainer will score it and explain what's good and what to improve.

### Step 4 — Ask the Trainer to fix the knowledge gap

Once you know what's wrong, ask the trainer to update the relevant knowledge file. For example:

> "The agent didn't mention the 3-day claims processing window. Can you update the claims knowledge file to include this?"

The trainer will propose an edit and — if you confirm — write it directly to the knowledge base.

### Step 5 — Re-test

Go back to `/cs-agent` and ask the same question again. The new response should reflect your update.

---

## Editing Knowledge Files Directly

You can also edit files yourself without the trainer:

1. Go to `/prompts`
2. Find the file you want to edit (use the sidebar categories)
3. Make your changes in the editor
4. Click **Save** — the change is stored in the database immediately

The file editor is useful for bulk updates or when you already know exactly what to change.

---

## Downloading the Knowledge Base

To export the full knowledge base (e.g. to share with a new hire or back up before a big edit):

```
GET /api/admin/export-prompts
```

Open that URL in your browser while logged in. It downloads a JSON file with every prompt — both the defaults that ship with the app and all your team's edits.

To restore or share: send the JSON to whoever is setting up a new deployment and they can seed their database from it.

---

## What to Train

Prioritise these areas when you're not sure what to work on:

1. **New product features** — whenever Choys ships something new, add it to `cs-general/products.md`
2. **Common employee questions** — if you see the same question come up more than twice, make sure the agent has a good answer
3. **Claims and insurance edge cases** — this is where most confusion happens; be specific
4. **Tone calibration** — if the agent sounds too robotic or too casual, edit the `cs-modes/employee-cs/agent.md` system prompt
5. **Escalation rules** — keep `cs-policies/` updated whenever the support process changes

---

## Deployment

The app is deployed on **Vercel** (frontend) with a **Railway PostgreSQL** database for persistent storage.

### First-time setup

1. **Railway — create a PostgreSQL service**
   - Go to [railway.app](https://railway.app) → New Project → Add PostgreSQL
   - Copy the `DATABASE_URL` from the Connect tab

2. **Vercel — deploy the app**
   - Go to [vercel.com](https://vercel.com) → Import Git Repository → select `bokchoys-v2`
   - Add environment variables:
     - `OPENAI_API_KEY` — your OpenAI key
     - `DATABASE_URL` — from Railway above
     - `CHOYS_API_ENV` — `prod` or `dev`
     - `CHOYS_API_BASE_URL_DEV` / `CHOYS_API_BASE_URL_PROD` — Choys API URLs
     - `CHOYS_DEMO_ACCESS_TOKEN` — (optional) skip OTP in demo mode
   - Click Deploy

3. **The database schema is created automatically** on first use — no migrations to run.

### Subsequent deploys

Push to `main` on GitHub. Vercel auto-deploys. All saved prompts stay in Railway — they survive redeploys.

---

## Tips

- **No memory between sessions** — the agent doesn't remember past conversations. Each session is fresh. That's why the knowledge base is the only thing that carries over.
- **One edit at a time** — make a targeted change, re-test it, then make the next one. Big batch edits are hard to debug.
- **Be specific in knowledge files** — "claims take 3–5 business days" is better than "claims take a while".
- **The trainer is honest** — if it scores a response poorly, take that seriously. It's calibrated against the same rubric your real users experience.
- **Commit regularly** — the save button writes to the DB. But if you make a big structural change, also push the files to Git so there's a code-level backup.
