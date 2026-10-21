import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { identity, links } from '../content/site'
import { href, Link, usePath } from '../lib/router'
import { Icon, type IconName } from './Icon'

export const NAV: { to: string; label: string; icon: IconName }[] = [
  { to: '/#skills', label: 'Skills', icon: 'spark' },
  { to: '/#toolbox', label: 'Toolbox', icon: 'grid' },
  { to: '/#experience', label: 'Experience', icon: 'briefcase' },
  { to: '/#work', label: 'Projects', icon: 'folder' },
  { to: '/#education', label: 'Education', icon: 'cap' },
]

/** Which home section is on screen, for the nav's active pill. */
function useActiveSection(path: string) {
  const [active, setActive] = useState('')
  useEffect(() => {
    if (path !== '/') return setActive('')
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    NAV.forEach((n) => {
      const el = document.getElementById(n.to.split('#')[1])
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [path])
  return active
}

// Floating glass bar: name on the left, section links in the middle, CV + Contact on the right.
// Under 1000px the links move into the + menu.
export function Header() {
  const path = usePath()
  const active = useActiveSection(path)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const close = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 24)
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])

  const doClose = (restoreFocus = true) => {
    setClosing(true)
    const ms = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 260
    setTimeout(() => {
      setOpen(false)
      setClosing(false)
      if (restoreFocus) document.querySelector<HTMLElement>('.plus')?.focus()
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

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
      <div className="nav__bar">
        <Link to="/" className="brand">
          <span className="brand__mark" aria-hidden="true">
            NH
          </span>
          <span className="brand__name">{identity.wordmark}</span>
        </Link>
        <nav className="nav__links" aria-label="Sections">
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className={active === n.to.split('#')[1] ? 'is-active' : undefined} aria-current={active === n.to.split('#')[1] ? 'location' : undefined}>
                  <Icon name={n.icon} size={16} />
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav__actions">
          {links.resume && (
            <a className="btn btn--ghost btn--sm nav__cv" href={href(`/${links.resume}`)} download>
              <Icon name="download" size={16} /> CV
            </a>
          )}
          <Link to="/contact" className="btn btn--primary btn--sm">
            Contact <Icon name="arrow" size={16} />
          </Link>
          <button type="button" className="plus" aria-expanded={open} aria-controls="site-menu" aria-label="Open menu" onClick={() => setOpen(true)}>
            <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>

      {open && (
        <div id="site-menu" className={`menu${closing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" aria-label="Site menu">
          <div className="menu__bg" onClick={() => doClose()} />
          <div className="menu__panel">
            <div className="menu__top">
              <span className="brand">{identity.wordmark}</span>
              <button ref={close} type="button" className="menu__x" aria-label="Close menu" onClick={() => doClose()}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <nav aria-label="Main">
              <ul>
                {[{ to: '/', label: 'Home' }, ...NAV, { to: '/contact', label: 'Contact' }].map((n, i) => (
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
