// Contact form backend: POST /api/contact → validates the message → emails it to me with Amazon SES.
// The visitor's address goes in Reply-To, so answering is one click. Node.js 22 runtime (AWS SDK v3 built in).

export const REASONS = ['Internship (PFE)', 'Project collaboration', 'Just saying hi']
const LIMITS = { name: 100, email: 200, company: 120, message: 5000 }
const EMAIL = /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[^\s@<>()",;]{2,}$/

const clean = (v, max) => (typeof v === 'string' ? v.replace(/\s+$/g, '').trim().slice(0, max) : '')
const oneLine = (s) => s.replace(/[\r\n\t]+/g, ' ')

/** Returns { data } for a valid message, or { error } with a message safe to show the visitor. */
export function validate(body) {
  if (!body || typeof body !== 'object') return { error: 'Invalid request.' }
  const data = {
    name: oneLine(clean(body.name, LIMITS.name)),
    email: oneLine(clean(body.email, LIMITS.email)),
    company: oneLine(clean(body.company, LIMITS.company)),
    reason: REASONS.includes(body.reason) ? body.reason : REASONS[0],
    message: clean(body.message, LIMITS.message),
  }
  if (!data.name) return { error: 'Please add your name.' }
  if (!EMAIL.test(data.email)) return { error: 'Please add a valid email address so I can reply.' }
  if (data.message.length < 10) return { error: 'Your message is a bit short. Tell me a little more.' }
  return { data }
}

const reply = (statusCode, body) => ({
  statusCode,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  body: JSON.stringify(body),
})

export async function handler(event) {
  let body
  try {
    const raw = event.isBase64Encoded ? Buffer.from(event.body ?? '', 'base64').toString('utf8') : event.body
    body = JSON.parse(raw || '{}')
  } catch {
    return reply(400, { error: 'Invalid request.' })
  }
  // Honeypot: a hidden field people never fill. Bots get a fake success and nothing is sent.
  if (body.website) return reply(200, { ok: true })

  const { data, error } = validate(body)
  if (error) return reply(400, { error })

  const { SESv2Client, SendEmailCommand } = await import('@aws-sdk/client-sesv2')
  const text = [
    data.message,
    '',
    '—',
    `From: ${data.name} <${data.email}>`,
    ...(data.company ? [`Company: ${data.company}`] : []),
    `About: ${data.reason}`,
    'Sent from the contact form on chaabinourelhouda.com',
  ].join('\n')
  try {
    await new SESv2Client({}).send(
      new SendEmailCommand({
        FromEmailAddress: process.env.FROM_ADDRESS,
        Destination: { ToAddresses: [process.env.TO_ADDRESS] },
        ReplyToAddresses: [data.email],
        Content: { Simple: { Subject: { Data: `Portfolio · ${data.reason} · ${data.name}` }, Body: { Text: { Data: text } } } },
      }),
    )
  } catch (e) {
    console.error('SES send failed', e?.name, e?.message)
    return reply(502, { error: 'The message could not be sent right now.' })
  }
  return reply(200, { ok: true })
}
