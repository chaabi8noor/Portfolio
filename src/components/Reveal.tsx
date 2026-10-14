import type { CSSProperties, ElementType } from 'react'

// Text effect copied from the reference: the text is split into letters (titles,
// descriptions) or words (big statements) that fade from opacity 0 to 1 in sequence
// once the element scrolls into view (motion.ts adds `.is-in`). Screen readers get the
// plain text; the split copy is aria-hidden. Words never break across lines.
type Props = { as?: ElementType; text: string; mode?: 'letters' | 'words'; className?: string; muteFrom?: number; id?: string }

export function Reveal({ as: Tag = 'p', text, mode = 'letters', className = '', muteFrom, id }: Props) {
  const words = text.split(' ')
  let i = 0
  return (
    <Tag className={`reveal ${className}`} data-reveal={mode} id={id}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, wi) => {
          const muted = muteFrom !== undefined && wi >= muteFrom
          const word =
            mode === 'words' ? (
              <span className={`u${muted ? ' u--muted' : ''}`} style={{ '--i': i++ } as CSSProperties}>
                {w}
              </span>
            ) : (
              <span className={`wd${muted ? ' u--muted' : ''}`}>
                {[...w].map((ch, ci) => (
                  <span key={ci} className="u" style={{ '--i': i++ } as CSSProperties}>
                    {ch}
                  </span>
                ))}
              </span>
            )
          return (
            <span key={wi}>
              {word}
              {wi < words.length - 1 ? ' ' : ''}
            </span>
          )
        })}
      </span>
    </Tag>
  )
}
