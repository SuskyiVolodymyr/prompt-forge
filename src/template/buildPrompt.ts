import type { PromptConfig, ProjectType } from '../types'

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'my-app'

interface StackDef {
  label: string
  scaffold: (c: PromptConfig) => string[]
  devCommand: string
  buildCommand: string
  structure: string
  conventions: string
  verifyHint: string
}

const STACKS: Record<ProjectType, StackDef> = {
  nextjs: {
    label: 'Next.js (App Router)',
    scaffold: () => [
      'Run: npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --turbopack',
      'Heads-up: the scaffolded Next.js version may be newer than your training data — read the relevant guide in node_modules/next/dist/docs/ before writing code and heed deprecation notices.',
    ],
    devCommand: 'npm run dev',
    buildCommand: 'npm run build',
    structure: `app/                  Pages and API route handlers (thin — delegate to lib/)
components/           React components (PascalCase files)
lib/                  Business logic, data access, shared types, validation
lib/hooks/            Custom hooks (server state, derived state)
public/               Static assets`,
    conventions: `- Business logic lives in lib/ — components and route handlers stay thin
- All data access goes through a single lib module (one source of truth) — never raw queries in components or routes
- Validate every API input at the boundary with Zod; return { error: string } with a proper status on failure
- Every route handler wraps its body in try/catch; never leak internal error messages to the client
- Tailwind utility classes only — no CSS modules, no inline styles
- Server state via TanStack Query if the app fetches data — no manual fetch/useEffect flows`,
    verifyHint: 'run the dev server and click through the changed flow in a real browser',
  },
  expo: {
    label: 'React Native + Expo',
    scaffold: () => [
      'Run: npx create-expo-app@latest . --template blank-typescript',
      'Run: npx expo install --fix',
      'Run: npx expo install expo-haptics @react-native-async-storage/async-storage react-native-safe-area-context react-native-screens @react-navigation/native @react-navigation/native-stack',
      'Run: npm install eslint eslint-config-expo --save-dev',
      "Create .eslintrc.js: module.exports = { extends: 'expo', ignorePatterns: ['/dist/*'] };",
    ],
    devCommand: 'npx expo start',
    buildCommand: 'npx tsc --noEmit',
    structure: `App.tsx               NavigationContainer + providers + Stack navigator
src/components/       UI (one PascalCase folder per component)
src/screens/          Screen-level components
src/context/          React Context + useReducer (Provider + useXxx hook)
src/storage/          storage.ts — ALL AsyncStorage access goes through here
src/theme/            theme.ts — single source of truth for colors/spacing/fontSize
src/constants/        constants.ts — STORAGE_KEYS and named constants, no magic numbers
src/utils/            Pure TS helpers — zero React Native imports`,
    conventions: `- Functional components, named exports only; Props interface directly above the component
- Pressable over TouchableOpacity, always; SafeAreaView from react-native-safe-area-context only
- No inline styles — StyleSheet.create(); all colors/sizes/spacing from src/theme/theme.ts
- No magic numbers — constants live in src/constants/constants.ts
- expo-haptics impactAsync(Light) on every state-changing tap; touch targets >= 44x44 dp
- React.memo on list-item components; only stable useCallback refs as props to memo'd components
- Pure logic files import zero React Native / UI modules
- All AsyncStorage keys prefixed @<slug>/ and accessed only via src/storage/storage.ts`,
    verifyHint: 'run it in Expo Go / simulator and exercise the changed screen by hand',
  },
  'vite-spa': {
    label: 'Vite + React SPA',
    scaffold: () => [
      'Run: npm create vite@latest . -- --template react-ts',
      'Run: npm install && npm install tailwindcss @tailwindcss/vite',
      'Add the tailwind plugin to vite.config.ts and `@import "tailwindcss";` to src/index.css',
    ],
    devCommand: 'npm run dev',
    buildCommand: 'npm run build',
    structure: `src/components/       React components (PascalCase files)
src/lib/              Business logic, shared types, pure helpers
src/hooks/            Custom hooks
src/index.css         Tailwind entry`,
    conventions: `- Business logic in src/lib/ — components stay thin and renderable
- Tailwind utility classes only — no CSS modules, no inline styles
- Derive state where possible; no redundant useState mirroring props
- Pure logic files import zero React/DOM modules so they stay unit-testable`,
    verifyHint: 'run the dev server and click through the changed flow in a real browser',
  },
  'node-api': {
    label: 'Node.js API (Express)',
    scaffold: () => [
      'Run: npm init -y && npm install express zod',
      'Run: npm install -D typescript tsx @types/node @types/express eslint',
      'Run: npx tsc --init --strict (target es2022, module nodenext, outDir dist)',
      'Add scripts: "dev": "tsx watch src/index.ts", "build": "tsc", "start": "node dist/index.js"',
    ],
    devCommand: 'npm run dev',
    buildCommand: 'npm run build',
    structure: `src/index.ts          App entry — wires middleware and routes
src/routes/           Route handlers (thin — delegate to services)
src/services/         Business logic
src/lib/              Data access, shared types, validation schemas
src/middleware/       Error handler, request logging`,
    conventions: `- Routes stay thin: parse/validate input, call a service, shape the response
- Validate every input at the boundary with Zod; central error-handler middleware returns { error: string }
- Never leak internal error messages or stack traces to clients — log server-side, respond generic
- All data access behind one module so the storage engine can be swapped in isolation`,
    verifyHint: 'start the server and hit the changed endpoints with curl, asserting on real responses',
  },
}

// --- section builders ---------------------------------------------------

function setupSteps(c: PromptConfig, stack: StackDef): string {
  const steps: string[] = []
  if (c.github) {
    steps.push(
      `Create the GitHub repo "${slugify(c.appName)}" (${c.repoVisibility}) — via mcp__github__create_repository or \`gh repo create\`; if neither is authenticated, STOP and ask me to create it and paste the remote URL.`
    )
  }
  steps.push(...stack.scaffold(c))
  if (c.claudeFiles) steps.push('Create every file listed under "File contents to create" below — these are your operating instructions for all future sessions.')
  if (c.ci) steps.push('Create .github/workflows/ci.yml (content below).')
  if (c.envExample) steps.push('Create .env.example with every env var the app reads (no real values) and make sure .env.local is gitignored.')
  if (c.github) {
    steps.push(
      c.branchStrategy === 'main-develop'
        ? 'Initial commit on main, then create develop from it. All feature branches branch from develop.'
        : 'Initial commit on a chore/scaffold branch → PR → merge to main.'
    )
  } else {
    steps.push('git init and make the initial commit.')
  }
  steps.push(`Verify the scaffold actually runs: ${stack.devCommand} must start without errors before any feature work.`)
  return steps.map((s, i) => `${i + 1}. ${s}`).join('\n')
}

function goldenRules(c: PromptConfig, stack: StackDef): string {
  const rules: string[] = []
  if (c.github) {
    const target = c.branchStrategy === 'main-develop' ? 'develop' : 'main'
    rules.push(`- Never commit directly to ${c.branchStrategy === 'main-develop' ? 'main or develop' : 'main'}. Every change = feature branch + PR targeting ${target}.`)
  }
  if (c.claudeFiles && c.onDemandContext) {
    rules.push('- Before touching an area, read its guide from the Context Map in CLAUDE.md. Do not guess conventions from memory.')
  }
  if (c.github && c.mergeViaGithubOnly) {
    rules.push('- All merges happen on GitHub through pull requests — never `git merge` + push locally, not even for releases. A local merge bypasses CI and review; if a branch needs integrating, open a PR and merge it on GitHub.')
  }
  if (c.codeReviewChecklist) rules.push('- Never open a PR without running every item in .claude/code-review.md first. One failing item = the PR waits.')
  if (c.browserVerification) {
    rules.push(`- Verify every change end-to-end before committing: ${stack.verifyHint}. Type-checks passing is necessary, not sufficient — integration and prompt/format bugs only surface at runtime.`)
  }
  if (c.tests) rules.push('- Run the test suite before every commit. New pure logic (parsers, data access, validation) gets tests in the same PR.')
  rules.push('- Keep docs in sync with code in the same commit: stale CLAUDE.md / architecture notes actively mislead future sessions — updating them is part of the change, not a follow-up.')
  if (c.conventionalCommits) {
    rules.push(`- Conventional Commits: type(scope): description, imperative mood.${c.noCoAuthorTrailers ? ' No Co-Authored-By trailers — ever.' : ''}`)
  } else if (c.noCoAuthorTrailers) {
    rules.push('- No Co-Authored-By trailers in commit messages — ever.')
  }
  rules.push('- When something fails (API error, failing test, broken flow), report it honestly and fix it — never paper over a failure to make output look clean.')
  return rules.join('\n')
}

function features(c: PromptConfig): string {
  const list = c.features.split('\n').map((f) => f.trim()).filter(Boolean)
  if (list.length === 0) return '_(fill in your ordered MVP feature list here)_'
  return list
    .map((f, i) => `${i + 1}. ${f}${c.github ? ` — branch: feature/${slugify(f).slice(0, 40)}` : ''}`)
    .join('\n')
}

function humanChecklist(c: PromptConfig): string {
  const items: string[] = []
  if (c.ci) {
    items.push(
      '- Make sure the git Personal Access Token has the **workflow** scope (classic) or **Workflows: read & write** (fine-grained) — without it, any push containing .github/workflows/ is rejected.'
    )
  }
  if (c.github && c.branchProtectionReminder) {
    const branches = c.branchStrategy === 'main-develop' ? '`develop` and `main`' : '`main`'
    items.push(
      `- After the first CI run: repo Settings → Branches → add protection for ${branches} — require the CI status check${c.permMergePRs ? '' : ' and require a pull request'} before merging. This is UI-only; no git command can do it.`
    )
  }
  if (c.envExample && c.envVars.trim()) {
    items.push('- Put real values for the env vars into .env.local — the agent must never ask for or handle real secrets.')
  }
  if (c.github && !c.permMergePRs) {
    items.push('- Merging PRs stays with you: review the diff, check CI is green, click merge.')
  }
  return items.length ? items.join('\n') : ''
}

// --- file contents ------------------------------------------------------

function claudeMd(c: PromptConfig, stack: StackDef): string {
  const slug = slugify(c.appName)
  const contextRows: string[] = []
  contextRows.push('| Data layer, file structure, types, adding a dependency | .claude/architecture.md |')
  contextRows.push('| Writing or refactoring any code — naming, style, error handling | .claude/conventions.md |')
  if (c.github) contextRows.push('| Branches, commits, PRs, merges | .claude/github.md |')
  if (c.codeReviewChecklist) contextRows.push('| Before opening any PR | .claude/code-review.md |')

  return `# ${c.appName || '{{APP_NAME}}'} — Claude Project Instructions

## What this project is
${c.purpose || '{{ONE_SENTENCE_DESCRIPTION}}'}

**Stack:** ${stack.label}, TypeScript strict.${c.github ? `\n**Repo:** https://github.com/${c.githubUsername || '{{GITHUB_USERNAME}}'}/${slug} (${c.repoVisibility})` : ''}

${
  c.onDemandContext
    ? `## Context map — read the relevant guide before working
The rules in this file always apply. The domain guides below load on demand — read the file with the Read tool before touching its area. Do NOT eagerly import them all; targeted context beats full context.

| If you are working on… | Read first |
|------------------------|------------|
${contextRows.join('\n')}`
    : `## Required reading
Read all .claude/*.md files at the start of every session.`
}

## Critical rules (always apply)
${goldenRules(c, stack)}

## Project structure
\`\`\`
${stack.structure}
\`\`\`

## Running locally
\`\`\`bash
npm install
${stack.devCommand}
\`\`\``
}

const ARCH_NOTES: Record<PromptConfig['archPattern'], string> = {
  'type-based':
    'Group files by type (components/, hooks/, lib/, utils/). Simple and fine for small apps — revisit if one feature\'s files start sprawling across every folder.',
  'feature-based':
    'Feature-sliced: each feature owns its components, hooks, logic, and types under a single folder (e.g. src/features/<feature>/). Cross-feature code lives in src/shared/. A feature can be added or deleted as one unit — this scales best as the app grows. Features must not import each other\'s internals; share through src/shared/ only.',
  'layered':
    'Layered: presentation (UI) depends on domain (framework-free business logic) depends on data (storage/API). Dependencies point inward only — the domain layer never imports UI components or data-client libraries.',
}

function organizationRules(c: PromptConfig): string {
  const rules: string[] = []
  if (c.separateLogicFromUI) rules.push('- Separate business logic from UI: logic lives in framework-free modules; components/screens render and wire, they do not compute.')
  if (c.logicInHooks) rules.push('- Stateful or reusable component logic goes into custom hooks (useXxx) — not inlined in components.')
  if (c.pureUtils) rules.push('- Pure, side-effect-free helpers live in utils/ — no framework imports, unit-testable in isolation. Never duplicate a helper across files.')
  if (c.thinComponents) rules.push('- Keep components thin and presentational; data fetching and business rules live in hooks or lib, not in the component body.')
  return rules.join('\n')
}

function principlesBlock(c: PromptConfig): string {
  const lines: string[] = []
  if (c.principleDRY) lines.push('- **DRY** — every piece of logic has one home; extract a shared function instead of copy-pasting a block you will later need to change in two places.')
  if (c.principleYAGNI) lines.push('- **YAGNI** — build only what the current feature needs. No speculative abstraction, config, or generality for a future that may never arrive.')
  if (c.principleKISS) lines.push('- **KISS** — prefer the simplest solution that works; reach for cleverness only when a concrete problem demands it.')
  if (c.principleSOLID) lines.push('- **SOLID** — one responsibility per module; open for extension, closed for modification: adding a variant should be a new file or registry entry, not edits scattered across a switch.')
  if (c.principleComposition) lines.push('- **Composition over inheritance** — build behavior by composing small functions, hooks, and components; avoid deep class hierarchies and god-objects.')
  return lines.join('\n')
}

function conventionsMd(stack: StackDef, c: PromptConfig): string {
  const principles = principlesBlock(c)
  const organization = organizationRules(c)
  return `# Coding Conventions
> Read before writing any component, function, or module.

## TypeScript
- Strict mode. No \`any\`. No non-null assertions unless provably safe — comment why.
- Explicit return types on exported functions.
- Validate untyped external data (API responses, parsed JSON, LLM output) with Zod before using it.

## Project conventions
${stack.conventions}
${organization ? `\n## Code organization\n${organization}\n` : ''}${principles ? `\n## Guiding principles\n${principles}\n` : ''}
## Comments
Only for non-obvious WHY. Never narrate what the next line does — if a comment explains why a change is correct, it belongs in the PR description, not the code.

## Errors
- Handle every async failure path; never swallow errors silently.
- Error messages shown to users must be actionable; internal details stay in server logs.`
}

function architectureMd(c: PromptConfig, stack: StackDef): string {
  return `# Architecture
> Read before creating/moving files, adding dependencies, or changing types.

## Organizing principle
${ARCH_NOTES[c.archPattern]}

## Base structure (adapt to the organizing principle above)
\`\`\`
${stack.structure}
\`\`\`

## Modularity
- One module owns each concern (data access, theming, storage) — everything else imports it.
- Registries over switch-statements: adding a feature should mean one new entry + one new file, not edits across the codebase.
- Keep modules swappable in isolation: the storage engine, the model provider, the styling layer.

## Core types
_Fill in as the domain model emerges — and keep this section in sync with the code in the same commit._

## Dependencies
Document every dependency added beyond the scaffold with one line of WHY.
${c.extraLibs.trim() ? `Planned from the start: ${c.extraLibs.trim()}` : ''}`
}

function githubMd(c: PromptConfig): string {
  const target = c.branchStrategy === 'main-develop' ? 'develop' : 'main'
  const perms: string[] = []
  if (c.permPushBranches) perms.push('- You MAY push feature branches to origin.')
  perms.push(`- You may NEVER push directly to ${c.branchStrategy === 'main-develop' ? 'main or develop' : 'main'}.`)
  if (c.permCreatePRs) perms.push('- You MAY open pull requests (gh CLI or GitHub MCP).')
  else perms.push('- Do NOT open PRs yourself — prepare the branch and hand over.')
  if (c.permMergePRs) perms.push(`- You MAY merge a PR only when CI is green${c.codeReviewChecklist ? ' and the code-review checklist passed' : ''}. Merge method: ${c.mergeMethod}. Delete the branch after merge.`)
  else perms.push('- You may NEVER merge PRs — the human reviews and merges.')

  return `# Git & GitHub Workflow
> Read before any git operation.

## Branches
\`\`\`
${c.branchStrategy === 'main-develop' ? 'main          production-ready, only receives merges from develop\ndevelop       integration branch, PRs target this\n' : 'main          protected, PRs target this\n'}feature/*     new features        fix/*  bug fixes
chore/*       tooling/deps/docs   refactor/*  no behavior change
\`\`\`
Always kebab-case, branch from latest ${target}.

## Permissions — what you may and may not do
${perms.join('\n')}

## Commits${c.conventionalCommits ? ' (Conventional Commits)' : ''}
\`\`\`
type(scope): short description, imperative, max 72 chars

[optional body — the WHY, not the what]
\`\`\`
Types: feat fix chore refactor test docs ci${c.noCoAuthorTrailers ? '\nNo Co-Authored-By trailers — ever.' : ''}

## PR rules
- One concern per PR; title in commit format; body: what / why / how it was verified.
- PRs target ${target}.${c.ci ? '\n- CI must be green before merge — no exceptions, no --no-verify.' : ''}${
    c.mergeViaGithubOnly
      ? `\n- Integrate ONLY by merging a PR on GitHub (merge button / GitHub MCP / gh pr merge). Never \`git merge\` + push to ${c.branchStrategy === 'main-develop' ? 'develop or main' : 'main'} locally — that bypasses CI and review.${c.branchStrategy === 'main-develop' ? ' develop → main releases are PRs too.' : ''}`
      : ''
  }${c.branchStrategy === 'main-develop' && !c.mergeViaGithubOnly ? '\n- develop → main merges happen at stable release points only.' : ''}`
}

function codeReviewMd(c: PromptConfig, stack: StackDef): string {
  return `# Code Review Checklist
> Run every item before opening any PR. One failure = blocked.

## Correctness
- [ ] Happy path traced manually end-to-end (${stack.verifyHint})
- [ ] Edge cases: empty state, max values, rapid repeated actions
- [ ] All async failure paths handled — no unhandled rejections, no silent catch {}
- [ ] No stale closures — effect dependency arrays complete

## Quality
- [ ] Zero \`any\`, zero unjustified non-null assertions
- [ ] No duplicated logic that should be a shared helper
- [ ] No magic numbers/strings where a named constant should be
- [ ] External/untyped data validated at the boundary
- [ ] Docs touched by this change updated in the same diff
${c.tests ? `
## Tests
- [ ] New pure logic has tests; existing tests pass
- [ ] Tests assert behavior, not implementation details` : ''}

## Security
- [ ] No secrets in code, logs, or error messages
- [ ] User-facing errors are generic; details logged server-side only
- [ ] Any user input that reaches a query, command, or LLM prompt is validated and length-capped`
}

function settingsJson(c: PromptConfig): string {
  const allow = ['Read', 'Edit', 'Write', 'Glob', 'Grep', 'Bash(npm:*)', 'Bash(npx:*)', 'Bash(git:*)']
  if (c.github) allow.push('Bash(gh:*)', 'mcp__github__*')
  return JSON.stringify({ permissions: { allow } }, null, 2)
}

function ciYml(c: PromptConfig, stack: StackDef): string {
  const target = c.branchStrategy === 'main-develop' ? '[main, develop]' : '[main]'
  const steps: string[] = []
  if (c.ciTypecheck) steps.push('      - name: Type check\n        run: npx tsc --noEmit')
  if (c.ciLint) steps.push('      - name: Lint\n        run: npm run lint')
  if (c.ciTests) steps.push('      - name: Test\n        run: npm test')
  if (c.ciBuild) steps.push(`      - name: Build\n        run: ${stack.buildCommand}`)
  return `name: CI

on:
  pull_request:
  push:
    branches: ${target}

jobs:
  ci:
    runs-on: ubuntu-latest
    # If the build constructs an SDK client at import time (e.g. an AI SDK),
    # give CI a dummy key — no real calls happen here:
    # env:
    #   SOME_API_KEY: ci-dummy-key
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
${steps.join('\n')}`
}

function agentLogMd(): string {
  return `# AGENT_LOG — AI-Assisted Development Journal

Honest record of how this project is built with an AI coding agent. Update it as part of each significant phase — not retroactively at the end.

For each phase record:
- **What I asked the agent to do**
- **What the agent did** (including what it got wrong and how it was caught)
- **What needed human judgment** — taste calls, scope decisions, things the agent rationalized but a human rejected

Honesty beats polish: "the agent produced a subtle N+1 and I caught it in the logs" is worth more than ten flawless-sounding entries.`
}

// --- assembly -----------------------------------------------------------

export function buildPrompt(c: PromptConfig): string {
  const stack = STACKS[c.projectType]
  const slug = slugify(c.appName)
  const parts: string[] = []

  parts.push(`I'm starting a new ${stack.label} project. Set up the entire project from scratch, exactly as specified below.

## Project info
- App name: ${c.appName || '{{APP_NAME}}'}
- Slug: ${slug}
- Purpose: ${c.purpose || '{{ONE_SENTENCE_DESCRIPTION}}'}${c.github ? `\n- GitHub username: ${c.githubUsername || '{{GITHUB_USERNAME}}'}` : ''}${c.extraLibs.trim() ? `\n- Key libraries beyond the base stack: ${c.extraLibs.trim()}` : ''}

## What to do first (in order, before any feature work)
${setupSteps(c, stack)}

## Golden rules — from the very first commit, no exceptions
${goldenRules(c, stack)}

## MVP features to implement after scaffold (in order)
${features(c)}`)

  const human = humanChecklist(c)
  if (human) {
    parts.push(`## Things only I (the human) can do — remind me at the right moment
${human}`)
  }

  if (c.claudeFiles || c.ci || c.agentLog || c.envExample) {
    const files: string[] = []
    if (c.claudeFiles) {
      files.push(`### CLAUDE.md\n${claudeMd(c, stack)}`)
      files.push(`### .claude/architecture.md\n${architectureMd(c, stack)}`)
      files.push(`### .claude/conventions.md\n${conventionsMd(stack, c)}`)
      if (c.github) files.push(`### .claude/github.md\n${githubMd(c)}`)
      if (c.codeReviewChecklist) files.push(`### .claude/code-review.md\n${codeReviewMd(c, stack)}`)
      if (c.settingsPermissions) files.push(`### .claude/settings.json\n\`\`\`json\n${settingsJson(c)}\n\`\`\``)
    }
    if (c.agentLog) files.push(`### AGENT_LOG.md\n${agentLogMd()}`)
    if (c.ci) files.push(`### .github/workflows/ci.yml\n\`\`\`yaml\n${ciYml(c, stack)}\n\`\`\``)
    if (c.envExample) {
      const vars = c.envVars.split('\n').map((v) => v.trim()).filter(Boolean)
      files.push(`### .env.example\n\`\`\`\n${vars.length ? vars.map((v) => (v.includes('=') ? v : `${v}=`)).join('\n') : '# add every env var the app reads, without real values'}\n\`\`\``)
    }
    parts.push(`---

## File contents to create

${files.join('\n\n')}`)
  }

  if (c.tests) {
    parts.push(`## Testing strategy
Aim tests at the highest-regression-risk pure logic first: data access, parsers, validation schemas. Skip component tests that would mostly mock the interesting parts — ${c.browserVerification ? 'live verification covers that layer' : 'manual verification covers that layer'}. Use Vitest. Tests must run in CI and locally via npm test.`)
  }

  if (c.seedData) {
    parts.push(`## Demo data
Add a one-click seed (dev-only route or script) that loads realistic demo data — intentionally varied so every feature has something meaningful to operate on. Document how to use it in the README.`)
  }

  if (c.deploy !== 'none') {
    parts.push(
      c.deploy === 'gh-pages'
        ? `## Deployment
Deploy to GitHub Pages via a workflow (actions/deploy-pages). Remember: the Vite/Next base path must match the repo name, and Pages must be enabled in repo Settings → Pages → Source: GitHub Actions (UI-only step — remind me).`
        : `## Deployment
Target Vercel. Keep zero-config compatibility (no custom server). Remind me to set env vars in the Vercel dashboard — never commit real values.`
    )
  }

  parts.push(`## How to work with me
- When my request is ambiguous, ask one focused question instead of guessing.
- Propose before building anything large; implement directly for small reversible changes.
- Report failures honestly (failing tests, broken flows) — never present unverified work as done.`)

  return parts.join('\n\n')
}
