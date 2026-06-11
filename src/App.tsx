import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_CONFIG, PROJECT_TYPES, type PromptConfig } from './types'
import { buildPrompt } from './template/buildPrompt'
import { Section, Checkbox, TextField, SelectField, SubBlock } from './components/controls'

const STORAGE_KEY = 'prompt-forge-config-v1'

function loadConfig(): PromptConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Partial<PromptConfig>) }
  } catch {
    // corrupt storage — fall through to defaults
  }
  return DEFAULT_CONFIG
}

export default function App() {
  const [config, setConfig] = useState<PromptConfig>(loadConfig)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }, [config])

  const prompt = useMemo(() => buildPrompt(config), [config])

  const set = <K extends keyof PromptConfig>(key: K) => (value: PromptConfig[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }))

  function copyPrompt() {
    navigator.clipboard
      .writeText(prompt)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {})
  }

  function downloadPrompt() {
    const blob = new Blob([prompt], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'new-project-prompt.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Prompt<span className="text-blue-400">Forge</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Configure how you want to work with Claude — get a ready-to-paste first prompt for your next AI-driven project.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="flex flex-col gap-5">
          <Section title="Project">
            <SelectField label="Project type" value={config.projectType} options={PROJECT_TYPES} onChange={set('projectType')} />
            <TextField label="App name" value={config.appName} onChange={set('appName')} placeholder="DevLog" />
            <TextField label="Purpose (one sentence)" value={config.purpose} onChange={set('purpose')} placeholder="Task tracker with embedded AI agents for engineering teams" />
            <TextField label="Key libraries beyond the base stack" value={config.extraLibs} onChange={set('extraLibs')} placeholder="@anthropic-ai/sdk, better-sqlite3" />
            <TextField label="MVP features (one per line, in order)" value={config.features} onChange={set('features')} multiline placeholder={'Task CRUD with status and priority\nAI prioritization agent\nStatus update generator'} />
          </Section>

          <Section title="Quality & conventions">
            <Checkbox label="Test suite (Vitest)" hint="Aimed at pure logic: parsers, data layer, validation — not mocked component tests" checked={config.tests} onChange={set('tests')} />
            <Checkbox label="Code review checklist before every PR" checked={config.codeReviewChecklist} onChange={set('codeReviewChecklist')} />
            <Checkbox label="Verify changes live before committing" hint="Browser / simulator / curl — type-check passing is necessary, not sufficient" checked={config.browserVerification} onChange={set('browserVerification')} />
            <Checkbox label="Conventional Commits" checked={config.conventionalCommits} onChange={set('conventionalCommits')} />
            <Checkbox label="No Co-Authored-By trailers" hint="Keep commit history clean; document AI involvement elsewhere" checked={config.noCoAuthorTrailers} onChange={set('noCoAuthorTrailers')} />
          </Section>

          <Section title="GitHub">
            <Checkbox label="Use GitHub" hint="Repo, branches, PR workflow" checked={config.github} onChange={set('github')} />
            {config.github && (
              <SubBlock>
                <TextField label="GitHub username" value={config.githubUsername} onChange={set('githubUsername')} placeholder="SuskyiVolodymyr" />
                <SelectField
                  label="Repo visibility"
                  value={config.repoVisibility}
                  options={[
                    { value: 'private', label: 'Private' },
                    { value: 'public', label: 'Public' },
                  ]}
                  onChange={set('repoVisibility')}
                />
                <SelectField
                  label="Branch strategy"
                  value={config.branchStrategy}
                  options={[
                    { value: 'main', label: 'main only — PRs target main' },
                    { value: 'main-develop', label: 'main + develop — PRs target develop' },
                  ]}
                  onChange={set('branchStrategy')}
                />
                <SelectField
                  label="Merge method"
                  value={config.mergeMethod}
                  options={[
                    { value: 'squash', label: 'Squash merge' },
                    { value: 'merge', label: 'Merge commit' },
                  ]}
                  onChange={set('mergeMethod')}
                />
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Claude is allowed to…</p>
                <Checkbox label="Push feature branches" checked={config.permPushBranches} onChange={set('permPushBranches')} />
                <Checkbox label="Open pull requests" checked={config.permCreatePRs} onChange={set('permCreatePRs')} />
                <Checkbox label="Merge pull requests (only when CI is green)" checked={config.permMergePRs} onChange={set('permMergePRs')} />
                <Checkbox label="Remind me to set up branch protection" hint="UI-only step — no git command can do it" checked={config.branchProtectionReminder} onChange={set('branchProtectionReminder')} />

                <Checkbox label="CI — GitHub Actions on every PR" checked={config.ci} onChange={set('ci')} />
                {config.ci && (
                  <SubBlock>
                    <Checkbox label="Type check (tsc --noEmit)" checked={config.ciTypecheck} onChange={set('ciTypecheck')} />
                    <Checkbox label="Lint" checked={config.ciLint} onChange={set('ciLint')} />
                    <Checkbox label="Tests" checked={config.ciTests} onChange={set('ciTests')} />
                    <Checkbox label="Build" checked={config.ciBuild} onChange={set('ciBuild')} />
                  </SubBlock>
                )}
              </SubBlock>
            )}
          </Section>

          <Section title="Claude infrastructure">
            <Checkbox label=".claude/ context files" hint="architecture.md, conventions.md, github.md — the agent's operating instructions" checked={config.claudeFiles} onChange={set('claudeFiles')} />
            {config.claudeFiles && (
              <SubBlock>
                <Checkbox label="On-demand context map" hint="Guides load when relevant instead of eager @-imports — saves tokens, sharpens focus" checked={config.onDemandContext} onChange={set('onDemandContext')} />
                <Checkbox label=".claude/settings.json with permission allowlist" checked={config.settingsPermissions} onChange={set('settingsPermissions')} />
              </SubBlock>
            )}
            <Checkbox label="AGENT_LOG.md" hint="Honest journal of AI-assisted development — updated per phase, not retroactively" checked={config.agentLog} onChange={set('agentLog')} />
          </Section>

          <Section title="Extras">
            <Checkbox label=".env.example" checked={config.envExample} onChange={set('envExample')} />
            {config.envExample && (
              <SubBlock>
                <TextField label="Env vars (one per line)" value={config.envVars} onChange={set('envVars')} multiline placeholder={'ANTHROPIC_API_KEY\nDB_PATH=./app.db'} />
              </SubBlock>
            )}
            <Checkbox label="Demo / seed data" hint="One-click realistic data so every feature is instantly testable" checked={config.seedData} onChange={set('seedData')} />
            <SelectField
              label="Deployment"
              value={config.deploy}
              options={[
                { value: 'none', label: 'None — local only' },
                { value: 'gh-pages', label: 'GitHub Pages' },
                { value: 'vercel', label: 'Vercel' },
              ]}
              onChange={set('deploy')}
            />
          </Section>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="flex max-h-[calc(100vh-4rem)] flex-col rounded-xl border border-zinc-800 bg-zinc-900">
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-3">
              <span className="text-sm font-semibold text-zinc-300">
                Generated prompt <span className="text-xs font-normal text-zinc-500">({prompt.length.toLocaleString()} chars)</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={downloadPrompt}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
                >
                  Download .md
                </button>
                <button
                  onClick={copyPrompt}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500"
                >
                  {copied ? 'Copied ✓' : 'Copy prompt'}
                </button>
              </div>
            </div>
            <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-zinc-300">
              {prompt}
            </pre>
          </div>
        </div>
      </div>

      <footer className="mt-10 text-center text-xs text-zinc-600">
        Paste the result as your first message to Claude Code in an empty project folder.
      </footer>
    </div>
  )
}
