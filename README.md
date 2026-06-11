# PromptForge

Configure how you want to work with Claude — get a ready-to-paste first prompt for your next AI-driven project.

**Live:** https://suskyivolodymyr.github.io/prompt-forge/

## What it does

A single-page form (project type, GitHub workflow + granular agent permissions, CI steps, Claude context-file setup, testing strategy, deployment target) that assembles a complete "first message to Claude Code": ordered setup steps, golden rules, the full contents of `CLAUDE.md` / `.claude/*.md` / `ci.yml`, and a checklist of things only a human can do (PAT workflow scope, branch protection).

The defaults encode lessons from building a real project with Claude Code end-to-end:

- **On-demand context map** instead of eager `@`-imports — targeted context beats full context
- **Live verification before commit** — type-checks passing is necessary, not sufficient
- **Tests aimed at pure logic** (parsers, data layer, validation), not mocked component tests
- **CI on every PR** with the PAT `workflow`-scope gotcha called out up front
- **Granular GitHub permissions** for the agent — may push branches / open PRs / merge, never push to protected branches
- **AGENT_LOG.md** — honest journaling of AI-assisted development, written per phase

## Run locally

```bash
npm install
npm run dev
```

## Stack

Vite + React + TypeScript + Tailwind. No backend — selections persist in localStorage, the prompt is generated client-side.
