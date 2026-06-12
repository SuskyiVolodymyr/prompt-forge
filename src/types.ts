export type ProjectType = 'nextjs' | 'expo' | 'vite-spa' | 'node-api'
export type ArchPattern = 'type-based' | 'feature-based' | 'layered'
export type TestTiming = 'tdd' | 'per-feature' | 'end'

export interface PromptConfig {
  // Basics
  projectType: ProjectType
  appName: string
  purpose: string
  githubUsername: string
  extraLibs: string
  /** One feature per line; becomes the ordered MVP list */
  features: string

  // Architecture & organization
  archPattern: ArchPattern
  separateLogicFromUI: boolean
  logicInHooks: boolean
  pureUtils: boolean
  thinComponents: boolean

  // Guiding principles
  principleDRY: boolean
  principleYAGNI: boolean
  principleKISS: boolean
  principleSOLID: boolean
  principleComposition: boolean

  // Testing (sub-options gated by `tests`)
  tests: boolean
  testUnit: boolean
  testIntegration: boolean
  testComponent: boolean
  testE2E: boolean
  testTiming: TestTiming
  testBehaviorNotImpl: boolean
  testIsolation: boolean
  testNoRealExternal: boolean
  testCoverage: boolean

  // Quality & conventions
  codeReviewChecklist: boolean
  browserVerification: boolean
  conventionalCommits: boolean
  noCoAuthorTrailers: boolean

  // GitHub (master switch unlocks the sub-block)
  github: boolean
  repoVisibility: 'private' | 'public'
  branchStrategy: 'main' | 'main-develop'
  mergeMethod: 'squash' | 'merge'
  mergeViaGithubOnly: boolean
  permCreatePRs: boolean
  permMergePRs: boolean
  permPushBranches: boolean
  branchProtectionReminder: boolean

  // CI (requires GitHub)
  ci: boolean
  ciTypecheck: boolean
  ciLint: boolean
  ciTests: boolean
  ciBuild: boolean

  // Claude infrastructure
  claudeFiles: boolean
  onDemandContext: boolean
  agentLog: boolean
  settingsPermissions: boolean

  // Extras
  envExample: boolean
  envVars: string
  seedData: boolean
  deploy: 'none' | 'gh-pages' | 'vercel'
}

export const DEFAULT_CONFIG: PromptConfig = {
  projectType: 'nextjs',
  appName: '',
  purpose: '',
  githubUsername: '',
  extraLibs: '',
  features: '',

  archPattern: 'feature-based',
  separateLogicFromUI: true,
  logicInHooks: true,
  pureUtils: true,
  thinComponents: true,

  principleDRY: true,
  principleYAGNI: true,
  principleKISS: true,
  principleSOLID: true,
  principleComposition: false,

  tests: true,
  testUnit: true,
  testIntegration: true,
  testComponent: false,
  testE2E: false,
  testTiming: 'per-feature',
  testBehaviorNotImpl: true,
  testIsolation: true,
  testNoRealExternal: true,
  testCoverage: false,

  codeReviewChecklist: true,
  browserVerification: true,
  conventionalCommits: true,
  noCoAuthorTrailers: true,

  github: true,
  repoVisibility: 'private',
  branchStrategy: 'main-develop',
  mergeMethod: 'squash',
  mergeViaGithubOnly: true,
  permCreatePRs: true,
  permMergePRs: true,
  permPushBranches: true,
  branchProtectionReminder: true,

  ci: true,
  ciTypecheck: true,
  ciLint: true,
  ciTests: true,
  ciBuild: true,

  claudeFiles: true,
  onDemandContext: true,
  agentLog: true,
  settingsPermissions: true,

  envExample: true,
  envVars: '',
  seedData: false,
  deploy: 'none',
}

export const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'nextjs', label: 'Next.js (App Router)' },
  { value: 'expo', label: 'React Native + Expo' },
  { value: 'vite-spa', label: 'Vite + React SPA' },
  { value: 'node-api', label: 'Node.js API (Express)' },
]

export const ARCH_PATTERNS: { value: ArchPattern; label: string }[] = [
  { value: 'type-based', label: 'Group by type (components/, hooks/, lib/)' },
  { value: 'feature-based', label: 'Feature-based / feature-sliced (scales best)' },
  { value: 'layered', label: 'Layered (presentation / domain / data)' },
]

export const TEST_TIMINGS: { value: TestTiming; label: string }[] = [
  { value: 'tdd', label: 'TDD — test before implementation' },
  { value: 'per-feature', label: 'Per feature — tests in the same PR (recommended)' },
  { value: 'end', label: 'At the end — backfill critical paths before release' },
]
