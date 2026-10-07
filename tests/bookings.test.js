// Run with: npm install, then npm test   (Node 20+)
const test = require("node:test");
const assert = require("node:assert/strict");
const handler = require("../api/bookings.js");

function future(days) {
  return new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);
}

function validBody(overrides = {}) {
  return {
    packageId: "artsy-couple",
    name: "Ada Obi",
    email: "ada@example.com",
    phone: "+234 801 234 5678",
    preferredDate: future(7),
    groupSize: 3,
    source: { utm_source: "instagram", evil: "x" },
    website: "",
    ...overrides,
  };
}

function call(body, method = "POST") {
  return new Promise((resolve) => {
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(k, v) { this.headers[k] = v; },
      status(code) { this.statusCode = code; return this; },
      json(data) { resolve({ status: this.statusCode, data, headers: this.headers }); return this; },
    };
    handler({ method, body }, res);
  });
}

function mockSupabase() {
  const calls = [];
  global.fetch = async (url, opts) => {
    calls.push({ url, opts, row: JSON.parse(opts.body) });
    return { ok: true, status: 201, json: async () => [{ id: "uuid-1" }], text: async () => "" };
  };
  return calls;
}

test.beforeEach(() => {
  process.env.SUPABASE_URL = "https://example.supabase.co/";
  process.env.SUPABASE_SECRET_KEY = "sb_secret_test";
  delete process.env.GMAIL_USER; // no real email in these tests
});

test("saves a valid booking with the server-side price", async () => {
  const calls = mockSupabase();
  const { status, data } = await call(validBody({ price: 1 }));
  assert.equal(status, 201);
  assert.equal(data.id, "uuid-1");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://example.supabase.co/rest/v1/bookings");
  assert.equal(calls[0].opts.headers.apikey, "sb_secret_test");
  assert.equal(calls[0].opts.headers.Authorization, undefined);
  const row = calls[0].row;
  assert.equal(row.package_title, "Artsy Couple");
  assert.equal(row.price_ngn, 294000);
  assert.equal(row.price_basis, "couple");
  assert.equal(row.estimated_total_ngn, 588000); // 3 guests = 2 couples
  assert.deepEqual(row.utm, { utm_source: "instagram" });
});

test("per-person packages multiply by group size", async () => {
  const calls = mockSupabase();
  await call(validBody({ packageId: "corporate-cafe-strategy", groupSize: 8 }));
  assert.equal(calls[0].row.estimated_total_ngn, 1200000);
});

test("legacy JWT keys are also sent as a Bearer token", async () => {
  process.env.SUPABASE_SECRET_KEY = "eyJhbGciOi.legacy";
  const calls = mockSupabase();
  await call(validBody());
  assert.equal(calls[0].opts.headers.Authorization, "Bearer eyJhbGciOi.legacy");
});

for (const [field, overrides] of [
  ["package", { packageId: "nightlife-turnup-pass" }],
  ["name", { name: "A" }],
  ["name", { name: "Ada\r\nBcc: x@example.com" }],
  ["email", { email: "not-an-email" }],
  ["phone", { phone: "12" }],
  ["date", { preferredDate: "2020-01-01" }],
  ["date", { preferredDate: "soon" }],
  ["groupSize", { groupSize: 0 }],
  ["groupSize", { groupSize: 2.5 }],
]) {
  test(`rejects a bad ${field}: ${JSON.stringify(overrides)}`, async () => {
    const calls = mockSupabase();
    const { status, data } = await call(validBody(overrides));
    assert.equal(status, 400);
    assert.equal(data.field, field);
    assert.equal(calls.length, 0);
  });
}

test("spam trap: pretends success and stores nothing", async () => {
  const calls = mockSupabase();
  const { status } = await call(validBody({ website: "http://spam.example" }));
  assert.equal(status, 201);
  assert.equal(calls.length, 0);
});

test("only POST is allowed", async () => {
  const { status, headers } = await call(null, "GET");
  assert.equal(status, 405);
  assert.equal(headers.Allow, "POST");
});

test("database failure returns 500 so the site falls back to email", async () => {
  global.fetch = async () => ({ ok: false, status: 503, text: async () => "down" });
  const orig = console.error; console.error = () => {};
  const { status } = await call(validBody());
  console.error = orig;
  assert.equal(status, 500);
});

test("missing configuration returns 500", async () => {
  delete process.env.SUPABASE_URL;
  const orig = console.error; console.error = () => {};
  const { status } = await call(validBody());
  console.error = orig;
  assert.equal(status, 500);
});

test("accepts a JSON string body", async () => {
  mockSupabase();
  const { status } = await call(JSON.stringify(validBody()));
  assert.equal(status, 201);
});

test("booking still succeeds when emails fail", async () => {
  process.env.GMAIL_USER = "muvment@gmail.com";
  process.env.GMAIL_APP_PASSWORD = "app-password";
  const nodemailer = require("nodemailer");
  const real = nodemailer.createTransport;
  nodemailer.createTransport = () => ({ sendMail: async () => { throw new Error("smtp down"); } });
  const calls = mockSupabase();
  const orig = console.error; console.error = () => {};
  const { status } = await call(validBody());
  console.error = orig;
  nodemailer.createTransport = real;
  assert.equal(status, 201);
  assert.equal(calls.length, 1);
});
