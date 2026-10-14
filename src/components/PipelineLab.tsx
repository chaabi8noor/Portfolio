import { useEffect, useRef, useState } from 'react'
import { advance, FAIL_EXPLANATION, FAIL_LOG, idleRun, LOGS, STAGES, type Status } from '../lib/pipeline'

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

const logFor = (i: number, failTest: boolean) => {
  const stage = STAGES[i]
  const lines = stage === 'Test' && failTest ? FAIL_LOG : LOGS[stage]
  return [`▸ ${stage}`, ...lines.map((x) => `  ${x}`)]
}

const ICON: Record<Status, string> = { idle: '○', running: '◐', passed: '✓', failed: '✗', skipped: '–' }

export function PipelineLab() {
  const [run, setRun] = useState(idleRun)
  const [failTest, setFailTest] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const [announce, setAnnounce] = useState('')
  const timer = useRef<number | undefined>(undefined)
  const running = run.statuses.some((s) => s === 'running')
  const started = run.statuses.some((s) => s !== 'idle')

  useEffect(() => () => clearTimeout(timer.current), [])

  // Drive the run: each tick finishes the running stage after a short delay.
  useEffect(() => {
    if (!running) return
    const i = run.statuses.indexOf('running')
    const stage = STAGES[i]
    timer.current = window.setTimeout(() => {
      const next = advance(run, failTest)
      setRun(next)
      const j = next.statuses.indexOf('running')
      if (j !== -1) setLog((l) => [...l, ...logFor(j, failTest)])
      const s = next.statuses[i]
      if (next.outcome === 'success') setAnnounce('Simulation finished: all six stages passed.')
      else if (next.outcome === 'failure') setAnnounce(`${stage} failed. Package, Deploy and Observe were skipped.`)
      else setAnnounce(`${stage} ${s}.`)
    }, reducedMotion() ? 250 : 900)
    return () => clearTimeout(timer.current)
  }, [run, running, failTest])

  const start = () => {
    if (running) return // no overlapping runs
    setLog(logFor(0, failTest))
    setAnnounce('Simulation started.')
    setRun(advance(idleRun(), failTest))
  }
  const reset = () => {
    clearTimeout(timer.current)
    setRun(idleRun())
    setLog([])
    setAnnounce('Simulation reset.')
  }

  const passed = run.statuses.filter((s) => s === 'passed').length
  const result = run.outcome ?? (running ? 'running' : 'idle')

  return (
    <div className="lab">
      <div className="lab__head">
        <span className="badge badge--sim">Simulation</span>
        <p className="lab__disclaimer">
          An illustrative pipeline with pretend logs. Nothing here runs a command, calls a cloud API or reflects any real repository.
        </p>
      </div>

      <div className="lab__controls">
        <button type="button" className="btn btn--primary" onClick={start} aria-disabled={running}>
          {running ? 'Running…' : started ? 'Run demo pipeline again' : 'Run demo pipeline'}
        </button>
        <label className="toggle">
          <input type="checkbox" checked={failTest} disabled={running} onChange={(e) => setFailTest(e.target.checked)} />
          <span>Simulate a test failure</span>
        </label>
        {started && !running && (
          <button type="button" className="btn btn--ghost" onClick={reset}>
            Reset
          </button>
        )}
      </div>

      <ol className="stages" aria-label="Pipeline stages">
        {STAGES.map((name, i) => {
          const s = run.statuses[i]
          return (
            <li key={name} className={`stage stage--${s}`}>
              <span className="stage__icon" aria-hidden="true">{ICON[s]}</span>
              <span className="stage__name">{name}</span>
              <span className="stage__status">{s}</span>
              {i < STAGES.length - 1 && <span className="stage__cable" aria-hidden="true"><i /></span>}
            </li>
          )
        })}
      </ol>

      <div className="lab__body">
        <pre className="lab__log" aria-label="Simulated log output" tabIndex={0}>
          {log.length ? log.join('\n') : '# press “Run demo pipeline” to start\n# logs here are made up for the demo'}
        </pre>
        <div className="lab__side">
          <dl className="lab__summary">
            <div><dt>result</dt><dd className={`res res--${result}`}>{result}</dd></div>
            <div><dt>stages passed</dt><dd>{passed} / {STAGES.length}</dd></div>
            <div><dt>failure injection</dt><dd>{failTest ? 'on' : 'off'}</dd></div>
          </dl>
          {run.outcome === 'failure' && (
            <div className="lab__explain" role="note">
              <strong>Why it stopped:</strong> {FAIL_EXPLANATION}
            </div>
          )}
          {run.outcome === 'success' && <p className="lab__explain">All gates passed. Deployed to a pretend environment; no real resources were touched.</p>}
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {announce}
      </p>
    </div>
  )
}
