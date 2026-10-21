import { useState, type FormEvent } from 'react'
import { availability, basedIn, links } from '../content/site'
import { href } from '../lib/router'
import { Icon } from './Icon'

const REASONS = ['Internship (PFE)', 'Project collaboration', 'Just saying hi']

type Status = { state: 'idle' | 'sending' | 'sent' } | { state: 'error'; message: string }

export function Contact() {
  const email = links.email ?? ''
  const [reason, setReason] = useState(REASONS[0])
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<Status>({ state: 'idle' })
  const [replyTo, setReplyTo] = useState('')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked: the address stays visible to copy by hand.
    }
  }

  // Posts to /api/contact (CloudFront → API Gateway → Lambda → SES), which emails me directly.
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const body = { ...Object.fromEntries(new FormData(form)), reason }
    setStatus({ state: 'sending' })
    try {
      const res = await fetch(href('/api/contact'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      const out = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(out.error ?? 'The message could not be sent right now.')
      setReplyTo(String(new FormData(form).get('email')))
      form.reset()
      setStatus({ state: 'sent' })
    } catch (err) {
      setStatus({ state: 'error', message: err instanceof Error && err.message !== 'Failed to fetch' ? err.message : 'The message could not be sent right now.' })
    }
  }

  return (
    <section className="section contact" aria-labelledby="contact-title">
      <p className="eyebrow">
        <span>Contact</span>
      </p>
      <h1 id="contact-title" className="contact__title">
        Let’s build something <span className="contact__accent">reliable</span> together.
      </h1>
      <p className="contact__lede">Recruiting for a DevOps or Cloud internship, or have a project in mind? Send me a message here and it lands straight in my inbox.</p>

      <div className="contact__grid">
        <aside className="contact__info" aria-label="Contact details">
          <div className="info spot">
            <span className="info__icon">
              <Icon name="mail" />
            </span>
            <span className="info__body">
              <span className="info__label">Email</span>
              <a href={`mailto:${email}`} className="info__value">
                {email.toLowerCase()}
              </a>
            </span>
            <button type="button" className="info__copy" onClick={copy} aria-label="Copy email address">
              <Icon name={copied ? 'check' : 'copy'} size={16} />
              <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          {links.linkedin && (
            <a className="info info--link spot" href={links.linkedin} target="_blank" rel="noreferrer">
              <span className="info__icon">
                <img src={href('/logos/linkedin.svg')} alt="" width={20} height={20} />
              </span>
              <span className="info__body">
                <span className="info__label">LinkedIn</span>
                <span className="info__value">Nour El Houda Chaabi</span>
              </span>
              <Icon name="arrow" size={16} />
            </a>
          )}
          <a className="info info--link spot" href={links.github} target="_blank" rel="noreferrer">
            <span className="info__icon">
              <img src={href('/logos/github.svg')} alt="" width={20} height={20} />
            </span>
            <span className="info__body">
              <span className="info__label">GitHub · GitLab</span>
              <span className="info__value">@chaabi8noor</span>
            </span>
            <Icon name="arrow" size={16} />
          </a>
          <div className="info spot">
            <span className="info__icon">
              <Icon name="pin" />
            </span>
            <span className="info__body">
              <span className="info__label">Based in</span>
              <span className="info__value">{basedIn}</span>
            </span>
          </div>
          {availability && (
            <div className="info spot">
              <span className="info__icon">
                <Icon name="calendar" />
              </span>
              <span className="info__body">
                <span className="info__label">Availability</span>
                <span className="info__value">{availability}</span>
              </span>
            </div>
          )}
        </aside>

        {status.state === 'sent' ? (
          <div className="form form--done spot" role="status">
            <span className="form__tick">
              <Icon name="check" size={28} />
            </span>
            <h2>Message sent.</h2>
            <p>
              Thank you. It’s in my inbox now, and I’ll reply to <strong>{replyTo}</strong>.
            </p>
            <button type="button" className="btn btn--ghost" onClick={() => setStatus({ state: 'idle' })}>
              Send another message
            </button>
          </div>
        ) : (
          <form className="form spot" onSubmit={submit}>
            <fieldset className="form__reasons">
              <legend>What’s it about?</legend>
              {REASONS.map((r) => (
                <label key={r} className={`chip${reason === r ? ' is-on' : ''}`}>
                  <input type="radio" name="reason-choice" value={r} checked={reason === r} onChange={() => setReason(r)} />
                  {r}
                </label>
              ))}
            </fieldset>
            <div className="form__row">
              <label className="field">
                <span>Your name</span>
                <input name="name" required maxLength={100} autoComplete="name" placeholder="Jane Doe" />
              </label>
              <label className="field">
                <span>Your email</span>
                <input name="email" type="email" required maxLength={200} autoComplete="email" placeholder="jane@company.com" />
              </label>
            </div>
            <label className="field">
              <span>
                Company <em>(optional)</em>
              </span>
              <input name="company" maxLength={120} autoComplete="organization" placeholder="Acme Cloud" />
            </label>
            <label className="field">
              <span>Message</span>
              <textarea name="message" required minLength={10} maxLength={5000} rows={6} placeholder="Hi Nour, we have a 6-month DevOps internship starting in January…" />
            </label>
            {/* Honeypot: hidden from people, filled by bots. */}
            <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <button type="submit" className="btn btn--primary btn--lg" disabled={status.state === 'sending'}>
              <Icon name="send" size={18} /> {status.state === 'sending' ? 'Sending…' : 'Send message'}
            </button>
            {status.state === 'error' && (
              <p className="form__note form__note--error" role="alert">
                {status.message} You can also email me directly at <a href={`mailto:${email}`}>{email.toLowerCase()}</a>.
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}
