import { useEffect } from 'react'
import { CaseStudy } from './components/CaseStudy'
import { Contact } from './components/Contact'
import { Header, NAV } from './components/Header'
import { Home } from './components/Home'
import { Icon } from './components/Icon'
import { projectBySlug } from './content/projects'
import { availability, basedIn, identity, links } from './content/site'
import { useMotion } from './lib/motion'
import { href, Link, usePath } from './lib/router'

export default function App() {
  const path = usePath()
  const slug = path.match(/^\/work\/([\w-]+)\/?$/)?.[1]
  const project = slug ? projectBySlug(slug) : undefined
  const isContact = /^\/contact\/?$/.test(path)
  const notFound = path !== '/' && !project && !isContact
  useMotion(path)

  // Keep the canonical URL in step with the route, so case studies aren't treated as duplicates of the homepage.
  useEffect(() => {
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://chaabinourelhouda.com${path}`)
  }, [path])

  // Honour a #hash on first load (e.g. a shared link to /#work).
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
        ) : isContact ? (
          <Contact />
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
    </>
  )
}

// Pixel fade measured from the reference footer: 8 rows × 14 squares of the page colour,
// opacity in ninths, dissolving into the footer from the top-left corner.
const PIXEL_FADE = ['98865543131000', '86654331110000', '55440000000000', '54310000000000', '33310000000000', '31100000000000', '00000000000000', '00000000000000']

function Footer() {
  const profiles = [
    { label: 'LinkedIn', href: links.linkedin },
    { label: 'GitHub', href: links.github },
    { label: 'GitLab', href: links.gitlab },
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
        <div className="footer__cta">
          <div>
            <p className="eyebrow eyebrow--light">
              <span>Let’s talk</span>
            </p>
            <h2 className="footer__title">Looking for a DevOps &amp; Cloud intern who ships?</h2>
            {availability && (
              <p className="footer__avail">
                <span className="dot" aria-hidden="true" /> {availability}
              </p>
            )}
          </div>
          <div className="footer__btns">
            <Link to="/contact" className="btn btn--light btn--lg">
              Get in touch <Icon name="arrow" />
            </Link>
            {links.resume && (
              <a className="btn btn--outline-light btn--lg" href={href(`/${links.resume}`)} download>
                <Icon name="download" /> Download CV
              </a>
            )}
          </div>
        </div>

        <div className="footer__cols">
          <div className="footer__about">
            <span className="brand brand--light">
              <span className="brand__mark" aria-hidden="true">
                NH
              </span>
              {identity.name}
            </span>
            <p>{identity.role}. Building cloud infrastructure, CI/CD and Kubernetes platforms that are reproducible, secure and observable.</p>
          </div>
          <div>
            <h3>Navigate</h3>
            <ul>
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Profiles</h3>
            <ul>
              {profiles.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Contact</h3>
            <ul>
              {links.email && (
                <li>
                  <a href={`mailto:${links.email}`}>{links.email.toLowerCase()}</a>
                </li>
              )}
              <li>{basedIn}</li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 {identity.name}</p>
          <p>Static React site · S3 + CloudFront, provisioned with Terraform, deployed by GitHub Actions · no trackers</p>
        </div>
      </div>
    </footer>
  )
}
