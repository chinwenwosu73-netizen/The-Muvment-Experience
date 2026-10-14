const test = require("node:test");
const assert = require("node:assert/strict");
const { sendBookingEmails, customerEmail, adminEmail, reference, longDate } = require("../lib/email.js");

const booking = {
  id: "3f2a9c1e-1111-2222-3333-444455556666",
  package_title: "Artsy Couple",
  price_ngn: 294000,
  price_basis: "couple",
  estimated_total_ngn: 588000,
  name: "Ada <b>Obi</b>",
  email: "ada@example.com",
  phone: "+234 801 234 5678",
  preferred_date: "2026-10-16",
  group_size: 3,
  utm: { utm_source: "instagram" },
};

function fakeTransport({ fail = [] } = {}) {
  const sent = [];
  return {
    sent,
    async sendMail(msg) {
      if (fail.includes(msg.to) || fail.includes(msg.to && msg.to.address)) throw new Error("smtp down");
      sent.push(msg);
      return { messageId: String(sent.length) };
    },
  };
}

test.beforeEach(() => {
  delete process.env.BREVO_API_KEY;
  delete process.env.SENDER_EMAIL;
  process.env.GMAIL_USER = "muvment@gmail.com";
  process.env.GMAIL_APP_PASSWORD = "abcd efgh ijkl mnop";
  delete process.env.ADMIN_EMAIL;
  process.env.SUPABASE_URL = "https://kxnwaeksfzsmfwsebfjo.supabase.co";
});

test("reference and date formatting", () => {
  assert.equal(reference(booking), "MX-3F2A9C1E");
  assert.equal(longDate("2026-10-16"), "Friday, 16 October 2026");
});

test("customer email has the booking details and escapes user input", () => {
  const { subject, html, text } = customerEmail(booking, { whatsappNumber: "2348000000000", responseTime: "within 24 hours" });
  assert.match(subject, /We've received your booking request — Artsy Couple \(MX-3F2A9C1E\)/);
  for (const s of ["Artsy Couple", "Friday, 16 October 2026", "3 guests", "₦294,000 per couple", "₦588,000", "within 24 hours", "wa.me/2348000000000"]) {
    assert.ok(html.includes(s), `html missing ${s}`);
  }
  assert.ok(!html.includes("<b>Obi</b>"), "user HTML must be escaped");
  assert.match(html, /Thank you, Ada &lt;b&gt;Obi&lt;\/b&gt;\.|Thank you, Ada\./);
  assert.match(text, /Estimated total: ₦588,000/);
});

test("admin email has contact details and a link to the bookings table", () => {
  const { subject, html, text } = adminEmail(booking);
  assert.match(subject, /^New booking request: Artsy Couple — Ada <b>Obi<\/b>, Friday, 16 October 2026 \(3 guests\)$/);
  assert.ok(html.includes("mailto:ada@example.com"));
  assert.ok(html.includes("tel:+2348012345678"));
  assert.ok(html.includes("utm_source=instagram"));
  assert.ok(html.includes("https://supabase.com/dashboard/project/kxnwaeksfzsmfwsebfjo/editor"));
  assert.ok(!html.includes("<b>Obi</b>"));
  assert.match(text, /Phone: \+234 801 234 5678/);
});

test("sends both emails with the right recipients and reply-to", async () => {
  const origLog = console.log; console.log = () => {};
  process.env.ADMIN_EMAIL = "ops@example.com";
  const t = fakeTransport();
  const result = await sendBookingEmails(booking, { transport: t, contact: {} });
  assert.deepEqual(result, { customer: "sent", admin: "sent" });
  const [toCustomer, toAdmin] = t.sent;
  assert.equal(toCustomer.to, "ada@example.com");
  assert.equal(toCustomer.replyTo, "ops@example.com");
  assert.deepEqual(toCustomer.from, { name: "Muvment Experience", address: "muvment@gmail.com" });
  assert.equal(toAdmin.to, "ops@example.com");
  assert.deepEqual(toAdmin.replyTo, { name: "Ada <b>Obi</b>", address: "ada@example.com" });
});

test("admin email defaults to the Gmail account", async () => {
  const t = fakeTransport();
  await sendBookingEmails(booking, { transport: t });
  assert.equal(t.sent[1].to, "muvment@gmail.com");
});

test("one failed email doesn't stop the other or throw", async () => {
  const t = fakeTransport({ fail: ["ada@example.com"] });
  const orig = console.error; console.error = () => {};
  const result = await sendBookingEmails(booking, { transport: t });
  console.error = orig;
  assert.deepEqual(result, { customer: "failed", admin: "sent" });
});

test("skips quietly when Gmail isn't configured", async () => {
  delete process.env.GMAIL_USER;
  assert.deepEqual(await sendBookingEmails(booking), { customer: "skipped", admin: "skipped" });
});

test("Brevo: sends both emails through the Brevo API", async () => {
  process.env.BREVO_API_KEY = "xkeysib-test";
  process.env.SENDER_EMAIL = "chinwe@gmail.com";
  process.env.ADMIN_EMAIL = "ops@example.com, owner@example.com";
  delete process.env.GMAIL_USER;
  const calls = [];
  global.fetch = async (url, opts) => {
    calls.push({ url, headers: opts.headers, body: JSON.parse(opts.body) });
    return { ok: true, status: 201, json: async () => ({ messageId: "m" }) };
  };
  const result = await sendBookingEmails(booking, { contact: {} });
  assert.deepEqual(result, { customer: "sent", admin: "sent" });
  assert.equal(calls.length, 2);
  for (const c of calls) {
    assert.equal(c.url, "https://api.brevo.com/v3/smtp/email");
    assert.equal(c.headers["api-key"], "xkeysib-test");
    assert.deepEqual(c.body.sender, { email: "chinwe@gmail.com", name: "Muvment Experience" });
    assert.ok(c.body.htmlContent.includes("Artsy Couple"));
    assert.ok(c.body.textContent.includes("Artsy Couple"));
  }
  const [toCustomer, toAdmin] = calls.map((c) => c.body);
  assert.deepEqual(toCustomer.to, [{ email: "ada@example.com" }]);
  assert.deepEqual(toCustomer.replyTo, { email: "ops@example.com" });
  assert.deepEqual(toAdmin.to, [{ email: "ops@example.com" }, { email: "owner@example.com" }]);
  assert.deepEqual(toAdmin.replyTo, { email: "ada@example.com", name: "Ada <b>Obi</b>" });
});

test("Brevo: an API error is reported as failed, not thrown", async () => {
  process.env.BREVO_API_KEY = "xkeysib-test";
  process.env.SENDER_EMAIL = "chinwe@gmail.com";
  global.fetch = async () => ({ ok: false, status: 401, text: async () => "unauthorized" });
  const orig = console.error; console.error = () => {};
  const result = await sendBookingEmails(booking);
  console.error = orig;
  assert.deepEqual(result, { customer: "failed", admin: "failed" });
});

test("Brevo is preferred over Gmail when both are set", async () => {
  process.env.BREVO_API_KEY = "xkeysib-test";
  process.env.SENDER_EMAIL = "chinwe@gmail.com";
  let used = false;
  global.fetch = async () => { used = true; return { ok: true, json: async () => ({}) }; };
  await sendBookingEmails(booking);
  assert.ok(used);
});

test("both emails list exactly what the booked experience includes", () => {
  const b = { ...booking, includes: ["CeraCerni's Art Hub — Spin and Spill session for two", "George Residence — opulent suite & breakfast"] };
  const admin = adminEmail(b);
  const customer = customerEmail(b, { responseTime: "as soon as possible" });
  for (const { html, text } of [admin, customer]) {
    assert.ok(html.includes("<strong>CeraCerni&#39;s Art Hub</strong> — Spin and Spill session for two"));
    assert.ok(html.includes("opulent suite &amp; breakfast"), "inclusions are escaped");
    assert.ok(text.includes("  - George Residence — opulent suite & breakfast"));
  }
  assert.ok(admin.html.includes("To set up"));
  assert.ok(admin.html.includes("has requested <strong>Artsy Couple</strong>"));
  assert.ok(customer.html.includes("email you as soon as possible"));
});

test("emails show the package photos: one large, then two side by side", () => {
  const photos = [
    { url: "https://muvment.example/assets/img/a.jpg", alt: "First <photo>" },
    { url: "https://muvment.example/assets/img/b.jpg", alt: "Second" },
    { url: "https://muvment.example/assets/img/c.jpg", alt: "Third" },
  ];
  for (const { html } of [adminEmail({ ...booking, photos }), customerEmail({ ...booking, photos }, {})]) {
    assert.equal((html.match(/<img /g) || []).length, 3);
    assert.ok(html.includes('src="https://muvment.example/assets/img/a.jpg"'));
    assert.ok(html.includes('width="504"') && html.includes('width="246"'));
    assert.ok(html.includes('alt="First &lt;photo&gt;"'), "alt text is escaped");
  }
});

test("no photos means no image block", () => {
  assert.ok(!adminEmail(booking).html.includes("<img"));
});

test("booking alerts go to the Concierge inbox, plus any ADMIN_EMAIL extras, without duplicates", async () => {
  const { conciergeRecipients } = require("../lib/email.js");
  const contact = { bookingsInbox: "support@autogirl.ng" };
  delete process.env.ADMIN_EMAIL;
  assert.deepEqual(conciergeRecipients(contact), ["support@autogirl.ng"]);
  process.env.ADMIN_EMAIL = "chinwe@gmail.com, SUPPORT@autogirl.ng";
  assert.deepEqual(conciergeRecipients(contact), ["support@autogirl.ng", "chinwe@gmail.com"]);

  delete process.env.ADMIN_EMAIL;
  const t = fakeTransport();
  const orig = console.log; console.log = () => {};
  await sendBookingEmails(booking, { transport: t, contact });
  console.log = orig;
  const [toCustomer, toConcierge] = t.sent;
  assert.equal(toConcierge.to, "support@autogirl.ng");
  assert.equal(toCustomer.replyTo, "support@autogirl.ng", "customer replies reach the Concierge");
  assert.equal(toCustomer.to, "ada@example.com");
});
