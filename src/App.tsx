import { useEffect } from 'react'
import { CaseStudy } from './components/CaseStudy'
import { Header, NAV } from './components/Header'
import { Home } from './components/Home'
import { projectBySlug } from './content/projects'
import { availability, identity, links } from './content/site'
import { useMotion } from './lib/motion'
import { href, Link, usePath } from './lib/router'

export default function App() {
  const path = usePath()
  const slug = path.match(/^\/work\/([\w-]+)\/?$/)?.[1]
  const project = slug ? projectBySlug(slug) : undefined
  const notFound = path !== '/' && !project
  useMotion(path)

  // Honour a #hash on first load (e.g. a shared link to /#lab).
  useEffect(() => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView()
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        {project ? (
          <CaseStudy p={project} />
        ) : notFound ? (
          <section className="section lost">
            <h1>404 · route not found</h1>
            <p>No page is served at this path.</p>
            <Link to="/" className="btn btn--primary">
              Back to home
            </Link>
          </section>
        ) : (
          <Home />
        )}
      </main>
      <Footer />
      <Link to="/#contact" className="reach-out">
        Reach out
      </Link>
    </>
  )
}

// Pixel fade measured from the reference footer: 8 rows × 14 squares of the page colour,
// opacity in ninths, dissolving into the footer from the top-left corner.
const PIXEL_FADE = ['98865543131000', '86654331110000', '55440000000000', '54310000000000', '33310000000000', '31100000000000', '00000000000000', '00000000000000']

function Footer() {
  const socials = [
    { label: 'LinkedIn', href: links.linkedin },
    { label: 'GitHub', href: links.github },
    { label: 'GitLab', href: links.gitlab },
    { label: 'Download CV', href: links.resume && href(`/${links.resume}`) },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href))
  return (
    <footer id="contact" className="footer" tabIndex={-1}>
      <div className="footer__pixels" aria-hidden="true">
        {PIXEL_FADE.map((row, y) => (
          <div key={y}>
            {[...row].map((o, x) => (
              <i key={x} style={{ opacity: +o / 9 }} />
            ))}
          </div>
        ))}
      </div>
      <div className="footer__inner">
        <p className="kicker kicker--light">Let’s build reliable infrastructure together</p>
        {availability && <p className="footer__avail">{availability}</p>}
        {links.email && (
          <a className="footer__email" href={`mailto:${links.email}`}>
            {links.email.toLowerCase()}
          </a>
        )}
        <div className="footer__cols">
          <ul aria-label="Pages">
            {NAV.slice(0, 4).map((n) => (
              <li key={n.to}>
                <Link to={n.to}>{n.label}</Link>
              </li>
            ))}
          </ul>
          <ul aria-label="Profiles">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} {...(s.label === 'Download CV' ? { download: '' } : {})}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="footer__credit">© 2026 {identity.name} · static site, no trackers</p>
      </div>
    </footer>
  )
}
