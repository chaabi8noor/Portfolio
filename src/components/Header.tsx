import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { identity } from '../content/site'
import { Link } from '../lib/router'

export const NAV = [
  { to: '/', label: 'Home' },
  { to: '/#experience', label: 'Experience' },
  { to: '/#work', label: 'Projects' },
  { to: '/#lab', label: 'Lab' },
  { to: '/#contact', label: 'Contact' },
]

// Layout copied from the reference: on desktop, a fixed left rail with a vertical
// "Reach out" and a fixed right rail with the + menu and a vertical wordmark.
// On small screens: a top bar plus a floating "Reach out" pill (rendered in App).
export function Header() {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const close = useRef<HTMLButtonElement>(null)

  const doClose = (restoreFocus = true) => {
    setClosing(true)
    const ms = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 260
    setTimeout(() => {
      setOpen(false)
      setClosing(false)
      if (restoreFocus) [...document.querySelectorAll<HTMLElement>('.plus')].find((b) => b.offsetParent)?.focus()
    }, ms)
  }

  useEffect(() => {
    if (!open) return
    close.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') doClose()
      // Keep Tab inside the open menu.
      if (e.key === 'Tab') {
        const items = [...document.querySelectorAll<HTMLElement>('#site-menu a, #site-menu button')]
        const first = items[0], last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [open])

  const plus = (
    <button type="button" className="plus" aria-expanded={open} aria-controls="site-menu" aria-label="Open menu" onClick={() => setOpen(true)}>
      <span aria-hidden="true">+</span>
    </button>
  )

  return (
    <header className="site-header">
      {/* small screens */}
      <div className="topbar">
        <Link to="/" className="brand">
          <span aria-hidden="true">©</span> {identity.wordmark}
        </Link>
        {plus}
      </div>
      {/* desktop rails */}
      <div className="rail rail--left">
        <Link to="/#contact" className="rail__reach">
          Reach out
        </Link>
      </div>
      <div className="rail rail--right">
        <span className="rail__plus">{plus}</span>
        <Link to="/" className="brand brand--vertical">
          <span aria-hidden="true">©</span> {identity.wordmark}
        </Link>
      </div>

      {open && (
        <div id="site-menu" className={`menu${closing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" aria-label="Site menu">
          <div className="menu__bg" onClick={() => doClose()} />
          <div className="menu__panel">
            <div className="menu__top">
              <span className="brand">
                <span aria-hidden="true">©</span> {identity.wordmark}
              </span>
              <button ref={close} type="button" className="menu__x" aria-label="Close menu" onClick={() => doClose()}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <nav aria-label="Main">
              <ul>
                {NAV.map((n, i) => (
                  <li key={n.to} style={{ '--i': i } as CSSProperties}>
                    <Link to={n.to} onClick={() => doClose(false)}>
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <p className="menu__foot">
              {identity.role} <span aria-hidden="true">|</span> Open to a PFE · 2027
            </p>
          </div>
        </div>
      )}
    </header>
  )
}
