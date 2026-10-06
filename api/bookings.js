/*
 * POST /api/bookings — saves a booking request to Supabase.
 *
 * Runs as a Vercel serverless function. Needs two environment variables,
 * set in Vercel → Project → Settings → Environment Variables:
 *   SUPABASE_URL          e.g. https://abcd1234.supabase.co
 *   SUPABASE_SECRET_KEY   the project's secret (service_role) key
 * The key never reaches the browser.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

// Package names and prices come from the same file the website uses, so the
// stored price always matches what the visitor saw and can't be edited by them.
let packagesCache = null;
function loadPackages() {
  if (packagesCache) return packagesCache;
  const source = fs.readFileSync(path.join(__dirname, "..", "assets", "js", "config.js"), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { timeout: 1000 });
  packagesCache = new Map(sandbox.window.MUVMENT_CONFIG.packages.map((p) => [p.id, p]));
  return packagesCache;
}

function fullTitle(pkg) {
  return pkg.tier ? `${pkg.title} — ${pkg.tier}` : pkg.title;
}

function estimateFor(pkg, size) {
  return pkg.priceBasis === "couple" ? pkg.price * Math.ceil(size / 2) : pkg.price * size;
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

// Same rules as the form in the browser; checked again here because anyone
// can call this endpoint directly.
function validate(body, packages) {
  const str = (v) => (typeof v === "string" ? v.trim() : "");
  const name = str(body.name);
  const email = str(body.email);
  const phone = str(body.phone);
  const date = str(body.preferredDate);
  const groupSize = Number(body.groupSize);
  const pkg = packages.get(str(body.packageId));

  if (!pkg) return { field: "package", error: "Please choose an experience." };
  if (name.length < 2 || name.length > 120) return { field: "name", error: "Please enter your full name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return { field: "email", error: "Please enter a valid email address." };
  }
  const digits = phone.replace(/\D/g, "");
  if (!/^[\d\s()+-]+$/.test(phone) || digits.length < 7 || digits.length > 15) {
    return { field: "phone", error: "Please enter a valid phone number." };
  }
  // The browser asks for tomorrow onwards; the server allows today (UTC) so a
  // visitor near midnight in Lagos isn't rejected.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || date < todayUtc()) {
    return { field: "date", error: "Please choose a date from tomorrow onwards." };
  }
  if (!Number.isInteger(groupSize) || groupSize < 1 || groupSize > 100) {
    return { field: "groupSize", error: "Group size must be a whole number of at least 1." };
  }
  return { pkg, name, email, phone, date, groupSize };
}

function cleanUtm(source) {
  const utm = {};
  if (source && typeof source === "object") {
    for (const [k, v] of Object.entries(source)) {
      if (/^utm_[a-z_]{1,20}$/.test(k) && typeof v === "string") utm[k] = v.slice(0, 200);
    }
  }
  return utm;
}

async function insertBooking(row) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL or SUPABASE_SECRET_KEY is not set");

  const headers = { apikey: key, "Content-Type": "application/json", Prefer: "return=representation" };
  // Legacy service_role keys are JWTs and also go in Authorization; the newer
  // sb_secret_… keys are sent as apikey only.
  if (!key.startsWith("sb_")) headers.Authorization = `Bearer ${key}`;

  const res = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/bookings`, {
    method: "POST",
    headers,
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`Supabase insert failed: ${res.status} ${await res.text()}`);
  const [saved] = await res.json();
  return saved;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || typeof body !== "object") return res.status(400).json({ error: "Send the booking as JSON." });

  // Spam trap: the form has a hidden "website" field people never see.
  // Bots fill it in; pretend success and store nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return res.status(201).json({ ok: true });
  }

  const checked = validate(body, loadPackages());
  if (checked.error) return res.status(400).json(checked);

  const { pkg, name, email, phone, date, groupSize } = checked;
  const row = {
    package_id: pkg.id,
    package_title: fullTitle(pkg),
    price_ngn: pkg.price,
    price_basis: pkg.priceBasis,
    estimated_total_ngn: estimateFor(pkg, groupSize),
    name,
    email,
    phone,
    preferred_date: date,
    group_size: groupSize,
    utm: cleanUtm(body.source),
  };

  try {
    const saved = await insertBooking(row);
    return res.status(201).json({ ok: true, id: saved && saved.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "We couldn't save your request just now." });
  }
};

module.exports.validate = validate;
module.exports.loadPackages = loadPackages;
