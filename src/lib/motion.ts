import { useEffect } from 'react'

// Scroll motion modelled on the reference site:
//  - [data-reveal] text reveals letter by letter / word by word when it enters the viewport,
//  - the hero photo sinks at 0.4x scroll speed and is clipped by the hero (as on the reference),
//  - project images scale 1.1x → 1x between entering the viewport and their top reaching 31% of it.
// Nothing runs under prefers-reduced-motion: content is simply shown as-is.
export function useMotion(key: string) {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.documentElement
    root.classList.add('motion')

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    )
    document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el))

    let frame = 0
    const update = () => {
      frame = 0
      const vh = innerHeight
      const photo = document.querySelector<HTMLElement>('.hero__photo-wrap')
      if (photo && scrollY < vh * 2) photo.style.transform = `translate3d(0, ${scrollY * 0.4}px, 0)`
      // Experience timeline: the sky line fills as the list scrolls past 60% of the screen.
      document.querySelectorAll<HTMLElement>('.tl').forEach((tl) => {
        const r = tl.getBoundingClientRect()
        tl.style.setProperty('--tl', Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height)).toFixed(4))
      })
      document.querySelectorAll<HTMLElement>('.card__zoom').forEach((z) => {
        const r = z.parentElement!.getBoundingClientRect()
        if (r.bottom < 0 || r.top > vh) return
        const t = Math.min(1, Math.max(0, (r.top - vh * 0.31) / (vh * 0.69)))
        z.style.transform = `scale(${(1 + 0.1 * t).toFixed(4)})`
      })
    }
    // Cursor spotlight on cards: a soft sky glow follows the pointer inside any .spot element.
    const onPointer = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('.spot')
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    addEventListener('pointermove', onPointer, { passive: true })
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
      removeEventListener('pointermove', onPointer)
    }
  }, [key])
}
