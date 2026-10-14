// Run with: npm test  (Node ≥ 22.18 strips TypeScript types natively)
import assert from 'node:assert/strict'
import { advance, idleRun, STAGES } from '../src/lib/pipeline.ts'

function runToEnd(failTest: boolean) {
  let run = idleRun()
  for (let n = 0; n < 50 && !run.outcome; n++) run = advance(run, failTest)
  return run
}

const ok = runToEnd(false)
assert.equal(ok.outcome, 'success')
assert.deepEqual(ok.statuses, STAGES.map(() => 'passed'))

const bad = runToEnd(true)
assert.equal(bad.outcome, 'failure')
assert.deepEqual(bad.statuses, ['passed', 'passed', 'failed', 'skipped', 'skipped', 'skipped'])

// A finished run doesn't change when advanced again.
assert.equal(advance(bad, true), bad)

console.log('pipeline model: ok')
