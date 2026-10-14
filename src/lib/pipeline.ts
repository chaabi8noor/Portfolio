// Pure model for the demo pipeline in the Lab section. Illustrative only:
// nothing here talks to a real CI system, cloud API or repository.

export const STAGES = ['Commit', 'Build', 'Test', 'Package', 'Deploy', 'Observe'] as const
export type Status = 'idle' | 'running' | 'passed' | 'failed' | 'skipped'
export type Run = { statuses: Status[]; outcome: 'success' | 'failure' | null }

const TEST = STAGES.indexOf('Test')

export const idleRun = (): Run => ({ statuses: STAGES.map(() => 'idle'), outcome: null })

/** One tick: start the run, finish the running stage, or stop. Returns the same object when done. */
export function advance(run: Run, failTest: boolean): Run {
  if (run.outcome) return run
  const statuses = [...run.statuses]
  const i = statuses.indexOf('running')
  if (i === -1) {
    statuses[0] = 'running'
    return { statuses, outcome: null }
  }
  if (i === TEST && failTest) {
    statuses[i] = 'failed'
    for (let j = i + 1; j < statuses.length; j++) statuses[j] = 'skipped'
    return { statuses, outcome: 'failure' }
  }
  statuses[i] = 'passed'
  if (i === statuses.length - 1) return { statuses, outcome: 'success' }
  statuses[i + 1] = 'running'
  return { statuses, outcome: null }
}

export const LOGS: Record<(typeof STAGES)[number], string[]> = {
  Commit: ['$ git push origin feature/tiny-cloud', 'received commit 3f2a9c1 (example)'],
  Build: ['installing dependencies…', 'compiled 42 modules (pretend)'],
  Test: ['running 18 example tests…', 'all 18 passed'],
  Package: ['building image demo-app:3f2a9c1', 'image tagged (not pushed anywhere)'],
  Deploy: ['rolling out 2 imaginary replicas…', 'rollout complete'],
  Observe: ['checking health endpoint… 200 OK', 'error rate 0% over a 30s pretend window'],
}

export const FAIL_LOG = ['running 18 example tests…', '✗ test_health_returns_ok: expected 200, got 500', '1 failed, 17 passed']

export const FAIL_EXPLANATION =
  'A pretend test caught a health endpoint returning 500 instead of 200. The pipeline stops here, so the broken build is never packaged or deployed. Later stages are skipped, not failed.'
