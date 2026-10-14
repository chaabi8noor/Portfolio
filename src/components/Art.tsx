import { useEffect, useState } from 'react'
import type { Project } from '../content/projects'

// Icon art: '#' is a filled cell. Rendered as ASCII characters like the reference.
const PIXELS: Record<'cloud' | 'pipeline' | 'cube' | 'shield', string[]> = {
  cloud: ['..............', '.....####.....', '....######....', '..##########..', '.############.', '##############', '##############', '.############.'],
  pipeline: ['.......##.....', '.......###....', '###########...', '############..', '###########...', '.......###....', '.......##.....', '..............'],
  cube: ['.....####.....', '...########...', '.############.', '.##..####..##.', '.##...##...##.', '.##...##...##.', '...##.##.##...', '.....####.....'],
  shield: ['.############.', '##############', '######..######', '#####....#####', '.#####..#####.', '..##########..', '....######....', '......##......'],
}

const toAscii = (rows: string[]) =>
  rows.map((r) => [...r].map((c) => (c === '#' ? (Math.random() < 0.8 ? '%%' : '%#') : '  ')).join('')).join('\n')

/** ASCII-art icon whose characters slowly flicker between % and # (as on the reference). */
export function AsciiIcon({ kind }: { kind: keyof typeof PIXELS }) {
  const [art, setArt] = useState(() => toAscii(PIXELS[kind]))
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => {
      setArt((a) => [...a].map((ch) => (ch === '%' || ch === '#' ? (Math.random() < 0.03 ? (ch === '%' ? '#' : '%') : ch) : ch)).join(''))
    }, 160)
    return () => clearInterval(id)
  }, [])
  return (
    <pre className="ascii" aria-hidden="true">
      {art}
    </pre>
  )
}

const short = (s: string) => (s.length > 15 ? s.slice(0, 14) + '…' : s)

/** Miniature of a project's documented architecture (or its stack). Decorative: the full, accessible version lives in the case study. */
export function ArchMini({ p }: { p: Project }) {
  const arch = p.architecture
  if (!arch) {
    return (
      <svg viewBox="0 0 640 380" className="mini" aria-hidden="true">
        {p.stack.slice(0, 6).map((l, i) => (
          <g key={l} className="mini__node is-mine">
            <rect x={120 + (i % 2) * 20} y={30 + i * 56} width="380" height="44" rx="6" />
            <text x={310 + (i % 2) * 20} y={58 + i * 56} textAnchor="middle">{l}</text>
          </g>
        ))}
      </svg>
    )
  }
  const byId = Object.fromEntries(arch.nodes.map((n) => [n.id, n]))
  return (
    <svg viewBox="0 0 640 380" className="mini" aria-hidden="true">
      {arch.edges.map(([a, b]) => (
        <line key={a + b} className="mini__edge" x1={byId[a].x} y1={byId[a].y} x2={byId[b].x} y2={byId[b].y} />
      ))}
      {arch.nodes.map((n) => (
        <g key={n.id} className={`mini__node ${n.mine ? 'is-mine' : ''}`}>
          <rect x={n.x - 60} y={n.y - 20} width="120" height="40" rx="6" />
          <text x={n.x} y={n.y + 5} textAnchor="middle">{short(n.label)}</text>
        </g>
      ))}
    </svg>
  )
}
