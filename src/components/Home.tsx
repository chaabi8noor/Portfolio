import { type CSSProperties, type ReactNode } from 'react'
import { projects } from '../content/projects'
import { activities, capabilities, education, experience, heroPhoto, identity, links, spokenLanguages, toolbox, type Tool } from '../content/site'
import { href, Link } from '../lib/router'
import { ArchMini, AsciiIcon } from './Art'
import { Icon } from './Icon'
import { Reveal } from './Reveal'

export function Home() {
  return (
    <>
      <Hero />
      <LogoStrip />
      <Statement />
      <Capabilities />
      <Toolbox />
      <Experience />
      <Work />
      <Education />
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

function Head({ num, eyebrow, title, sub, id }: { num: string; eyebrow: string; title: string; sub: string; id: string }) {
  return (
    <header className="section__head">
      <p className="eyebrow fade-up" data-reveal="fade">
        <span>{num}</span> {eyebrow}
      </p>
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

// Every figure is counted from the content files, so it can't drift from what the site shows.
const STATS = [
  { value: String(experience.filter((j) => j.role.includes('Intern')).length), label: 'internships, summer 2026' },
  { value: String(projects.length), label: 'documented projects' },
  { value: `${new Set(toolbox.flatMap((g) => g.tools.map((t) => t.name))).size}`, label: 'tools across my projects' },
  { value: 'AWS', label: 'this site, live via Terraform' },
]

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <p className="hero__label">
        <span className="status">
          <span className="dot" aria-hidden="true" /> Open to a 6-month internship · Jan 2027
        </span>
        <span className="hero__role">{identity.role}</span>
      </p>
      <h1 id="hero-title" className="hero__headline">
        <span>{identity.headline[0]}</span>
        <span className="hero__headline-2">
          <span className="hl">
            {identity.headline[1]}
            <span className="hl__box" aria-hidden="true" />
            <svg className="hl__cursor" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M14.08 2.18a.5.5 0 0 1 .1.56L8.53 15.47a.5.5 0 0 1-.92-.01L5.57 10.7.8 8.65a.5.5 0 0 1 0-.92l12.73-5.65a.5.5 0 0 1 .55.1z" />
            </svg>
          </span>
        </span>
      </h1>
      <p className="hero__word" aria-hidden="true">
        <span>{identity.bigWord}</span>
      </p>
      <div className="hero__below">
        <div className="hero__copy">
          <p className="hero__intro">{identity.intro}</p>
          <p className="hero__ctas">
            <Link to="/contact" className="btn btn--primary btn--lg">
              Get in touch <Icon name="arrow" />
            </Link>
            {links.resume && (
              <a className="btn btn--ghost btn--lg" href={href(`/${links.resume}`)} download>
                <Icon name="download" /> Download CV
              </a>
            )}
          </p>
          <dl className="stats">
            {STATS.map((s) => (
              <div key={s.label} className="stat">
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
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
      <Head num="01" eyebrow="Skills" title="What I do." sub="Hover a row to see the tools behind it." id="skills-title" />
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
    </section>
  )
}

function Experience() {
  return (
    <section id="experience" className="section" aria-labelledby="exp-title" tabIndex={-1}>
      <Head num="03" eyebrow="Experience" title="Where I’ve built things." sub="Internships and projects, most recent first." id="exp-title" />
      <ol className="tl">
        {experience.map((j) => (
          <li key={j.org} className="tl__item">
            <div className="tl__side">
              <span className="tl__dot" aria-hidden="true" />
              <span className="tl__when">{j.when || j.where}</span>
            </div>
            <article className="tl__card spot fade-up" data-reveal="fade">
              <header className="tl__head">
                <span className="badge" aria-hidden="true">
                  {j.badge}
                </span>
                <span>
                  <h3 className="tl__role">{j.role}</h3>
                  <span className="tl__org">
                    {j.org} · {j.where}
                  </span>
                </span>
              </header>
              <ul className="tl__points">
                {j.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
              <Tags items={j.tags} />
              {j.project && <Cta to={`/work/${j.project}`}>Read the case study</Cta>}
            </article>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Work() {
  return (
    <section id="work" className="section section--glow" aria-labelledby="work-title" tabIndex={-1}>
      <Head num="04" eyebrow="Projects" title="Recent work." sub="(2026)" id="work-title" />
      <ul className="cards">
        {projects.map((p, i) => (
          <li key={p.slug} className={`card fade-up${i === 0 ? ' card--featured' : ''}`} data-reveal="fade" style={{ '--d': `${(i % 2) * 0.12}s` } as CSSProperties}>
            <Link to={`/work/${p.slug}`} className="card__link spot">
              <span className="card__img">
                <span className="card__zoom">
                  <ArchMini p={p} />
                </span>
              </span>
              <span className="card__body">
                <span className="card__cat">{p.kind}</span>
                <span className="card__title">{p.title}</span>
                <span className="card__kicker">{p.kicker}</span>
                {i === 0 && <span className="card__summary">{p.summary}</span>}
                <Tags items={i === 0 ? p.stack : p.stack.slice(0, 5)} />
                <span className="card__more">
                  Read the case study <Icon name="arrow" size={16} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Logo({ t }: { t: Tool }) {
  return t.logo ? (
    <img src={href(`/logos/${t.logo}.svg`)} alt="" width={44} height={44} loading="lazy" />
  ) : (
    <span className="tool__mono" aria-hidden="true">
      {t.name.slice(0, 2)}
    </span>
  )
}

/** Quiet logo strip under the hero: grey logos that take their colour on hover. Two copies loop seamlessly. */
function LogoStrip() {
  const all = [...new Map(toolbox.flatMap((g) => g.tools).map((t) => [t.name, t])).values()]
  return (
    <div className="strip" aria-label="Tools I work with">
      <p className="strip__label">Tools I ship with</p>
      <div className="strip__viewport">
        <div className="strip__track">
          {[0, 1].map((k) => (
            <ul key={k} aria-hidden={k === 1 || undefined}>
              {all.map((t) => (
                <li key={t.name}>
                  <Logo t={t} />
                  <span>{t.name}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  )
}

function Toolbox() {
  return (
    <section id="toolbox" className="section section--glow" aria-labelledby="tools-title">
      <Head num="02" eyebrow="Toolbox" title="Toolbox." sub="What I reach for, grouped by job." id="tools-title" />
      <div className="toolbox">
        {toolbox.map((g, gi) => (
          <div key={g.group} className="toolbox__group spot fade-up" data-reveal="fade" style={{ '--d': `${(gi % 2) * 0.1}s` } as CSSProperties}>
            <h3 className="toolbox__name">
              <span>{String(gi + 1).padStart(2, '0')}</span> {g.group}
              <em>{g.tools.length}</em>
            </h3>
            <ul className="tools">
              {g.tools.map((t, i) => (
                <li key={t.name} className="tool" style={{ '--d': `${i * 0.06}s` } as CSSProperties}>
                  <Logo t={t} />
                  <span>{t.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function Tags({ items }: { items: string[] }) {
  return (
    <ul className="tags" aria-label="Tools">
      {items.map((t) => (
        <li key={t} className="tag">
          {t}
        </li>
      ))}
    </ul>
  )
}

function Education() {
  return (
    <section id="education" className="section" aria-labelledby="edu-title" tabIndex={-1}>
      <Head num="05" eyebrow="Education" title="Education." sub="And what I do beyond it." id="edu-title" />
      <ul className="edu">
        {education.map((e) => (
          <li key={e.school} className="edu__card spot fade-up" data-reveal="fade">
            <span className="badge" aria-hidden="true">
              {e.badge}
            </span>
            <span className="edu__when">{e.when}</span>
            <h3 className="tl__role">{e.what}</h3>
            <span className="tl__org">
              {e.school} · {e.where}
            </span>
          </li>
        ))}
      </ul>
      <div className="edu__extra fade-up" data-reveal="fade">
        <div>
          <h3 className="toolbox__name">Languages</h3>
          <ul className="tags">
            {spokenLanguages.map((l) => (
              <li key={l} className="tag">
                {l}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="toolbox__name">Community</h3>
          <ul className="tags">
            {activities.map((a) => (
              <li key={a} className="tag">
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
