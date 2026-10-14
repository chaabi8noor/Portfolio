import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react'

// Tiny history router: two kinds of page ('/' and '/work/:slug') don't justify a library.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '') // '' or '/portfolio'

const subscribe = (cb: () => void) => {
  addEventListener('popstate', cb)
  return () => removeEventListener('popstate', cb)
}
const current = () => location.pathname.slice(BASE.length) || '/'

export const usePath = () => useSyncExternalStore(subscribe, current)

/** Build a real href for an app path like '/work/x' or '/#lab'. */
export const href = (to: string) => BASE + to

export function navigate(to: string) {
  const [path, hash] = to.split('#')
  const samePage = (path || '/') === current()
  if (!samePage) {
    history.pushState(null, '', href(to))
    dispatchEvent(new PopStateEvent('popstate'))
  } else if (hash) {
    history.pushState(null, '', href(to))
  }
  // Defer until the new page has rendered before scrolling / focusing.
  setTimeout(() => {
    const target = hash ? document.getElementById(hash) : document.getElementById('main')
    if (target) {
      target.scrollIntoView({ block: 'start' })
      target.focus({ preventScroll: true })
    } else {
      scrollTo(0, 0)
    }
  })
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }

export function Link({ to, onClick, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(to)
  }
  return <a href={href(to)} onClick={handle} {...rest} />
}
