import { useState, type CSSProperties, type ReactNode } from 'react'
import { projects } from '../content/projects'
import { availability, capabilities, experience, heroPhoto, identity, languagesCode, links } from '../content/site'
import { href, Link } from '../lib/router'
import { ArchMini, AsciiIcon } from './Art'
import { PipelineLab } from './PipelineLab'
import { Reveal } from './Reveal'

export function Home() {
  return (
    <>
      <Hero />
      <Statement />
      <Capabilities />
      <Experience />
      <Work />
      <Lab />
    </>
  )
}

/** Link with the reference hover: a small square fades in and the label slides right. */
export function Cta({ to, href: ext, children, download, muted }: { to?: string; href?: string; children: ReactNode; download?: boolean; muted?: boolean }) {
  const inner = (
    <>
      <span className="cta__icon" aria-hidden="true">
        <i />
      </span>
      <span className="cta__txt">{children}</span>
    </>
  )
  const cls = `cta${muted ? ' cta--muted' : ''}`
  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <a href={ext} className={cls} {...(download ? { download: '' } : {})}>
      {inner}
    </a>
  )
}

function Head({ title, sub, id }: { title: string; sub: string; id: string }) {
  return (
    <header className="section__head">
      <h2 id={id}>
        <span className="sr-only">
          {title} {sub}
        </span>
        <span aria-hidden="true">
          <Reveal as="span" mode="words" text={title} className="head__a" />
          <Reveal as="span" mode="words" text={sub} className="head__b" />
        </span>
      </h2>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <p className="hero__label">
        {identity.role} <span aria-hidden="true">|</span> Open to a PFE · 2027
      </p>
      <h1 id="hero-title" className="hero__headline">
        <span>{identity.headline[0]}</span>
        <span className="hero__headline-2">{identity.headline[1]}</span>
      </h1>
      <p className="hero__word" aria-hidden="true">
        <span>{identity.bigWord}</span>
      </p>
      <div className="hero__below">
        <div className="hero__copy">
          <p className="hero__intro">{identity.intro}</p>
          {availability && (
            <p className="hero__avail">
              <span className="dot" aria-hidden="true" /> {availability}
            </p>
          )}
          <p className="hero__ctas">
            <Cta to="/#work">See my work</Cta>
            {links.resume && (
              <Cta href={href(`/${links.resume}`)} download muted>
                Download CV
              </Cta>
            )}
          </p>
        </div>
        <div className="hero__photo-wrap">
          <img className="hero__photo" src={href(`/${heroPhoto.src}`)} alt={heroPhoto.alt} width={heroPhoto.width} height={heroPhoto.height} fetchPriority="high" />
        </div>
      </div>
    </section>
  )
}

function Statement() {
  const [lead, rest] = identity.statement
  return (
    <section className="section statement" aria-label="Summary">
      <Reveal as="p" mode="words" text={(lead + rest).trim()} muteFrom={lead.trim().split(' ').length} />
    </section>
  )
}

function Capabilities() {
  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <Head title="What I do." sub="Hover a row to see the tools behind it." id="skills-title" />
      <ul className="caps">
        {capabilities.map((c) => (
          <li key={c.title} className="cap" tabIndex={0}>
            <div className="cap__text">
              <Reveal as="h3" text={c.title} />
              <Reveal as="p" text={c.body} />
            </div>
            <ul className="cap__pills" aria-label={`${c.title} tools`}>
              {c.tags.map((t, i) => (
                <li key={t} className="pill" style={{ '--d': `${(i + 1) * 0.2}s` } as CSSProperties}>
                  <span className="pill__bg" aria-hidden="true" />
                  <span className="pill__txt">{t}</span>
                </li>
              ))}
            </ul>
            <AsciiIcon kind={c.icon} />
          </li>
        ))}
      </ul>
      <p className="caps__also">
        Also: <span>{languagesCode.join(' · ')}</span>
      </p>
    </section>
  )
}

function Experience() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section id="experience" className="section" aria-labelledby="exp-title" tabIndex={-1}>
      <Head title="Where I’ve built things." sub="Internships and projects, most recent first." id="exp-title" />
      <ol className="jobs">
        {experience.map((j, i) => {
          const isOpen = open === i
          return (
            <li key={j.org} className={`job${isOpen ? ' is-open' : ''}`}>
              <button type="button" className="job__head" aria-expanded={isOpen} aria-controls={`job-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                <span className="job__who">
                  <Reveal as="span" text={j.role} className="job__role" />
                  <Reveal as="span" text={j.org} className="job__org" />
                </span>
                <span className="job__when">{j.when || j.where}</span>
                <span className="job__plus" aria-hidden="true">
                  +
                </span>
              </button>
              <div className="job__body" id={`job-${i}`} role="region" aria-label={`${j.org} details`}>
                <div>
                  <ul>
                    {j.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  {j.project && <Cta to={`/work/${j.project}`}>Read the case study</Cta>}
                </div>
              </div>
              <span className="job__line" aria-hidden="true">
                <i />
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function Work() {
  return (
    <section id="work" className="section" aria-labelledby="work-title" tabIndex={-1}>
      <Head title="Recent work." sub="(2026)" id="work-title" />
      <ul className="cards">
        {projects.map((p) => (
          <li key={p.slug} className="card">
            <Link to={`/work/${p.slug}`} className="card__link">
              <span className="card__img">
                <span className="card__zoom">
                  <ArchMini p={p} />
                </span>
              </span>
              <span className="card__cat">{p.kind}</span>
              <Reveal as="span" text={p.title} className="card__title" />
              <Reveal as="span" text={p.kicker} className="card__kicker" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Lab() {
  return (
    <section id="lab" className="section" aria-labelledby="lab-title" tabIndex={-1}>
      <Head title="Pipeline lab." sub="Run it, then inject a test failure." id="lab-title" />
      <PipelineLab />
    </section>
  )
}
