import { useEffect, useState } from 'react'
import { projects, type Project } from '../content/projects'
import { identity } from '../content/site'
import { Link } from '../lib/router'
import { ArchMini } from './Art'

export function CaseStudy({ p }: { p: Project }) {
  useEffect(() => {
    document.title = `${p.title} · ${identity.name}`
    return () => {
      document.title = `${identity.name} · DevOps & Cloud Engineering`
    }
  }, [p])

  const i = projects.indexOf(p)
  const nextP = projects[(i + 1) % projects.length]

  return (
    <article className={`case case--${p.accent}`}>
      <Link to="/#work" className="case__back">
        ← All projects
      </Link>
      <header className="case__hero">
        <div>
          <p className="panel__meta">
            <span className="tag">{p.kind}</span> <span className="mono">{p.when}</span>
          </p>
          <h1>{p.title}</h1>
          <p className="case__kicker">{p.kicker}</p>
          <p className="case__summary">{p.summary}</p>
          <p className="case__links">
            <a className="btn btn--primary" href={p.source.href}>
              View source · <span className="mono">{p.source.label}</span>
            </a>
            {p.demo && (
              <a className="btn btn--ghost" href={p.demo.href}>
                Live demo
              </a>
            )}
          </p>
        </div>
        <div className="case__art">
          <ArchMini p={p} />
        </div>
      </header>

      <div className="case__grid">
        <section aria-labelledby="c-problem">
          <h2 id="c-problem">The problem</h2>
          <p>{p.problem}</p>
          <h3>Constraints</h3>
          <ul>
            {p.constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="c-mine" className="case__mine">
          <h2 id="c-mine">What I did</h2>
          <ul>
            {p.contribution.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <ul className="chips" aria-label="Technologies">
            {p.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      </div>

      {p.architecture && (
        <>
          <ArchitectureExplorer p={p} />
        </>
      )}
      <section aria-labelledby="c-decisions">
        <h2 id="c-decisions">Implementation decisions</h2>
        <div className="decisions">
          {p.decisions.map((d) => (
            <div key={d.title} className="decision">
              <h3>{d.title}</h3>
              <p>{d.body}</p>
              {d.source && (
                <a href={d.source.href} className="evidence">
                  {d.source.label}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="case__grid">
        <section aria-labelledby="c-results">
          <h2 id="c-results">Evidence & results</h2>
          <ul className="results">
            {p.results.map((r) => (
              <li key={r.text}>
                {r.text}{' '}
                {r.source && (
                  <a href={r.source.href} className="evidence">
                    {r.source.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="c-next" className="case__next">
          {p.notVerified.length > 0 && (
            <>
              <h2 id="c-next">Honest limits</h2>
              <ul>
                {p.notVerified.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </>
          )}
          {p.next.length > 0 && (
            <>
              <h3>What I’d improve next</h3>
              <p className="tag tag--soft">Proposed, not built</p>
              <ul>
                {p.next.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      <nav className="case__pager" aria-label="More projects">
        <Link to="/#work">← Back to all projects</Link>
        <Link to={`/work/${nextP.slug}`}>
          Next: {nextP.title} →
        </Link>
      </nav>
    </article>
  )
}

const W = 640
const H = 380

function ArchitectureExplorer({ p }: { p: Project }) {
  const arch = p.architecture!
  const [sel, setSel] = useState(arch.nodes[0].id)
  const node = arch.nodes.find((n) => n.id === sel)!
  const byId = Object.fromEntries(arch.nodes.map((n) => [n.id, n]))
  const linked = (id: string) => arch.edges.filter(([a, b]) => a === id || b === id)
  const connections = (id: string) =>
    linked(id).map(([a, b]) => (a === id ? `→ ${byId[b].label}` : `← ${byId[a].label}`))

  return (
    <section className="arch" aria-labelledby="c-arch">
      <h2 id="c-arch">How it fits together</h2>
      <p className="arch__caption">
        {arch.caption} Select a component to see its role and the file that backs it up.{' '}
        <span className="arch__legend">
          <span className="legend-mine" aria-hidden="true" /> my part
        </span>
      </p>
      <div className="arch__layout">
        <div className="arch__diagram">
          <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            <defs>
              <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="var(--muted)" />
              </marker>
            </defs>
            {arch.edges.map(([a, b]) => {
              const A = byId[a], B = byId[b]
              // Stop the line at the edge of the target's label box so the arrow stays visible.
              const dx = B.x - A.x, dy = B.y - A.y
              const k = Math.min(62 / Math.abs(dx || 1e-9), 26 / Math.abs(dy || 1e-9))
              const on = a === sel || b === sel
              return (
                <line key={a + b} x1={A.x} y1={A.y} x2={B.x - dx * k} y2={B.y - dy * k} className={`arch__edge ${on ? 'is-on' : ''}`} markerEnd="url(#arr)" />
              )
            })}
          </svg>
          {arch.nodes.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`arch__node ${n.mine ? 'is-mine' : ''} ${n.id === sel ? 'is-sel' : ''}`}
              style={{ left: `${(n.x / W) * 100}%`, top: `${(n.y / H) * 100}%` }}
              aria-pressed={n.id === sel}
              onClick={() => setSel(n.id)}
            >
              <span className="arch__light" aria-hidden="true" />
              {n.label}
            </button>
          ))}
        </div>
        <div className="arch__detail" aria-live="polite">
          <p className="mono arch__detail-kicker">selected component</p>
          <h3>{node.label}</h3>
          <p>{node.role}</p>
          {linked(node.id).length > 0 && (
            <>
              <h4>Connections</h4>
              <ul className="arch__conns">
                {connections(node.id).map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </>
          )}
          <h4>Source evidence</h4>
          <ul className="arch__evidence">
            {node.evidence.map((e) => (
              <li key={e.href}>
                <a href={e.href} className="evidence">
                  {e.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <details className="arch__list" open>
        <summary>All components as a list</summary>
        <ol>
          {arch.nodes.map((n) => (
            <li key={n.id}>
              <strong>{n.label}</strong>
              {n.mine && <span className="tag tag--soft">my part</span>} — {n.role}
              {linked(n.id).length > 0 && <span className="arch__list-conns"> Connections: {connections(n.id).join(', ')}.</span>}{' '}
              {n.evidence.map((e, k) => (
                <span key={e.href}>
                  {k > 0 && ' · '}
                  <a href={e.href}>{e.label}</a>
                </span>
              ))}
            </li>
          ))}
        </ol>
      </details>
    </section>
  )
}
