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
