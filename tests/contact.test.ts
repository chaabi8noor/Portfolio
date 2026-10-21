// Run with: npm test  (Node ≥ 22.18 strips TypeScript types natively)
import assert from 'node:assert/strict'
// @ts-expect-error plain JS Lambda module, no type declarations
import { handler, validate } from '../infra/lambda/contact/index.mjs'

const good = { name: ' Ada\nLovelace ', email: 'ada@corp.io', company: 'Corp', reason: 'Internship (PFE)', message: 'We have a DevOps internship for you.' }

// A valid message is cleaned: newlines can't reach the email subject.
const ok = validate(good)
assert.equal(ok.error, undefined)
assert.equal(ok.data.name, 'Ada Lovelace')
assert.equal(ok.data.reason, 'Internship (PFE)')

// Rejections the visitor can fix.
assert.match(validate({ ...good, name: '  ' }).error, /name/)
assert.match(validate({ ...good, email: 'not-an-email' }).error, /email/)
assert.match(validate({ ...good, email: 'a@b.c\nBcc: x@y.z' }).error, /email/)
assert.match(validate({ ...good, message: 'hi' }).error, /short/)
assert.equal(validate(null).error, 'Invalid request.')

// Unknown reasons fall back instead of being echoed; oversized messages are capped.
assert.equal(validate({ ...good, reason: '<script>' }).data.reason, 'Internship (PFE)')
assert.equal(validate({ ...good, message: 'x'.repeat(9000) }).data.message.length, 5000)

// The handler answers bad input and the honeypot without touching SES.
assert.equal((await handler({ body: '{nope' })).statusCode, 400)
assert.equal((await handler({ body: JSON.stringify({ ...good, email: '' }) })).statusCode, 400)
assert.equal((await handler({ body: JSON.stringify({ ...good, website: 'spam.biz' }) })).statusCode, 200)

console.log('contact backend: ok')
