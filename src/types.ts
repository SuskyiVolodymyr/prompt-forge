export type ProjectType = 'nextjs' | 'expo' | 'vite-spa' | 'node-api'

export interface PromptConfig {
  // Basics
  projectType: ProjectType
  appName: string
  purpose: string
  githubUsername: string
  extraLibs: string
  /** One feature per line; becomes the ordered MVP list */
  features: string

  // Quality & conventions
  tests: boolean
  codeReviewChecklist: boolean
  browserVerification: boolean
  conventionalCommits: boolean
  noCoAuthorTrailers: boolean

  // GitHub (master switch unlocks the sub-block)
  github: boolean
  repoVisibility: 'private' | 'public'
  branchStrategy: 'main' | 'main-develop'
  mergeMethod: 'squash' | 'merge'
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

  tests: true,
  codeReviewChecklist: true,
  browserVerification: true,
  conventionalCommits: true,
  noCoAuthorTrailers: true,

  github: true,
  repoVisibility: 'private',
  branchStrategy: 'main-develop',
  mergeMethod: 'squash',
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
