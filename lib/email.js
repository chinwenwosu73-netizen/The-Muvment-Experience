/*
 * Booking emails, sent through a Gmail account with nodemailer.
 *
 * Environment variables (Vercel → Settings → Environment Variables):
 *   GMAIL_USER          the Gmail address that sends, e.g. muvment@gmail.com
 *   GMAIL_APP_PASSWORD  a 16-character Google "app password" for that account
 *   ADMIN_EMAIL         where new-booking alerts go (optional; defaults to
 *                       GMAIL_USER). Several addresses: separate with commas.
 * If GMAIL_USER or GMAIL_APP_PASSWORD is missing, no email is sent and the
 * booking is still saved.
 */
const nodemailer = require("nodemailer");

const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const ngn = (n) => naira.format(n);
const basisLabel = (b) => (b === "couple" ? "per couple" : "per person");

function longDate(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Short, human-friendly booking reference from the database id.
function reference(booking) {
  return `MX-${String(booking.id || "").replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function supabaseTableUrl() {
  const m = /^https:\/\/([a-z0-9]+)\.supabase\.co/i.exec(process.env.SUPABASE_URL || "");
  return m ? `https://supabase.com/dashboard/project/${m[1]}/editor` : null;
}

/* ---------- Shared layout ---------- */

const C = { ink: "#1c1813", muted: "#6b6359", line: "#e8e2d8", gold: "#8f6b34", bg: "#faf8f4" };

function layout({ preheader, eyebrow, title, intro, rows, after }) {
  const rowsHtml = rows
    .map(([label, value]) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${C.line};color:${C.muted};font-size:13px;width:38%;vertical-align:top">${esc(label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${C.line};color:${C.ink};font-size:15px;vertical-align:top">${value}</td>
      </tr>`)
    .join("");
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:${C.bg};font-family:Helvetica,Arial,sans-serif;color:${C.ink}">
  <span style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${C.line};border-radius:6px">
        <tr><td style="padding:28px 28px 8px">
          <div style="font-weight:900;letter-spacing:2px;font-size:16px">MUVMENT</div>
          <div style="font-family:Georgia,serif;font-style:italic;color:${C.gold};font-size:15px">Experience</div>
        </td></tr>
        <tr><td style="padding:16px 28px 0">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.muted}">${esc(eyebrow)}</div>
          <h1 style="margin:8px 0 12px;font-size:24px;line-height:1.2">${esc(title)}</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${C.ink}">${intro}</p>
        </td></tr>
        <tr><td style="padding:0 28px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
        </td></tr>
        <tr><td style="padding:20px 28px 28px;font-size:14px;line-height:1.6;color:${C.ink}">${after}</td></tr>
      </table>
      <p style="font-size:12px;color:${C.muted};margin:16px 0 0">Muvment Experience · Lagos, Nigeria</p>
    </td></tr>
  </table>
</body></html>`;
}

/* ---------- The two emails ---------- */

function customerEmail(b, contact) {
  const ref = reference(b);
  const firstName = b.name.split(/\s+/)[0];
  const whatsapp = contact && contact.whatsappNumber ? `https://wa.me/${contact.whatsappNumber}` : null;
  const rows = [
    ["Experience", `<strong>${esc(b.package_title)}</strong>`],
    ["Preferred date", esc(longDate(b.preferred_date))],
    ["Group size", esc(`${b.group_size} ${b.group_size === 1 ? "guest" : "guests"}`)],
    ["Price", esc(`${ngn(b.price_ngn)} ${basisLabel(b.price_basis)}`)],
    ["Estimated total", `<strong>${esc(ngn(b.estimated_total_ngn))}</strong>`],
    ["Reference", esc(ref)],
  ];
  const html = layout({
    preheader: `We've received your request for ${b.package_title}.`,
    eyebrow: "Booking request received",
    title: `Thank you, ${firstName}.`,
    intro: `We've received your booking request for <strong>${esc(b.package_title)}</strong>. Here are the details you sent us.`,
    rows,
    after: `
      <p style="margin:0 0 12px"><strong>What happens next</strong><br>
      The Muvment Concierge will confirm availability with our partner venues and contact you ${esc((contact && contact.responseTime) || "shortly")} on ${esc(b.phone)} or by email to finalise your booking.</p>
      <p style="margin:0 0 12px;color:${C.muted}">The estimated total is a guide; your final price is confirmed by the Concierge.</p>
      <p style="margin:0">Questions? Just reply to this email${whatsapp ? `, or <a href="${whatsapp}" style="color:${C.gold}">chat with us on WhatsApp</a>` : ""}.</p>`,
  });
  const text = [
    `Thank you, ${firstName}.`,
    ``,
    `We've received your booking request for ${b.package_title}.`,
    ``,
    `Experience: ${b.package_title}`,
    `Preferred date: ${longDate(b.preferred_date)}`,
    `Group size: ${b.group_size}`,
    `Price: ${ngn(b.price_ngn)} ${basisLabel(b.price_basis)}`,
    `Estimated total: ${ngn(b.estimated_total_ngn)}`,
    `Reference: ${ref}`,
    ``,
    `What happens next: the Muvment Concierge will confirm availability with our partner venues and contact you ${(contact && contact.responseTime) || "shortly"} to finalise your booking. The estimated total is a guide; your final price is confirmed by the Concierge.`,
    ``,
    `Questions? Just reply to this email.`,
  ].join("\n");
  return { subject: `We've received your booking request — ${b.package_title} (${ref})`, html, text };
}

function adminEmail(b) {
  const ref = reference(b);
  const tableUrl = supabaseTableUrl();
  const utm = b.utm && Object.keys(b.utm).length ? Object.entries(b.utm).map(([k, v]) => `${k}=${v}`).join(", ") : "direct";
  const rows = [
    ["Experience", `<strong>${esc(b.package_title)}</strong>`],
    ["Preferred date", `<strong>${esc(longDate(b.preferred_date))}</strong>`],
    ["Group size", esc(b.group_size)],
    ["Listed price", esc(`${ngn(b.price_ngn)} ${basisLabel(b.price_basis)}`)],
    ["Estimated total", `<strong>${esc(ngn(b.estimated_total_ngn))}</strong>`],
    ["Customer", esc(b.name)],
    ["Email", `<a href="mailto:${esc(b.email)}" style="color:${C.gold}">${esc(b.email)}</a>`],
    ["Phone", `<a href="tel:${esc(b.phone.replace(/[^\d+]/g, ""))}" style="color:${C.gold}">${esc(b.phone)}</a>`],
    ["Source", esc(utm)],
    ["Reference", esc(ref)],
  ];
  const html = layout({
    preheader: `${b.name} · ${b.package_title} · ${longDate(b.preferred_date)}`,
    eyebrow: "New booking request",
    title: b.package_title,
    intro: `<strong>${esc(b.name)}</strong> has requested this experience. Confirm availability with the partner venues, then contact them to finalise.`,
    rows,
    after: `
      <p style="margin:0 0 12px">Reply to this email to answer the customer directly.</p>
      ${tableUrl ? `<p style="margin:0"><a href="${tableUrl}" style="color:${C.gold}">Open bookings in Supabase</a> to update the status to <em>contacted</em> or <em>confirmed</em>.</p>` : ""}`,
  });
  const text = [
    `New booking request ${ref}`,
    ``,
    `Experience: ${b.package_title}`,
    `Preferred date: ${longDate(b.preferred_date)}`,
    `Group size: ${b.group_size}`,
    `Listed price: ${ngn(b.price_ngn)} ${basisLabel(b.price_basis)}`,
    `Estimated total: ${ngn(b.estimated_total_ngn)}`,
    `Customer: ${b.name}`,
    `Email: ${b.email}`,
    `Phone: ${b.phone}`,
    `Source: ${utm}`,
    tableUrl ? `\nBookings: ${tableUrl}` : "",
  ].join("\n");
  return {
    subject: `New booking request: ${b.package_title} — ${b.name}, ${longDate(b.preferred_date)} (${b.group_size} ${b.group_size === 1 ? "guest" : "guests"})`,
    html,
    text,
  };
}

/* ---------- Sending ---------- */

let transporter = null;
function getTransport() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "") },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });
  }
  return transporter;
}

function isConfigured() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

/**
 * Sends the customer confirmation and the admin alert. Never throws: a
 * failed email is logged, and the booking (already saved) still succeeds.
 * Returns { customer, admin } with "sent", "failed" or "skipped".
 */
async function sendBookingEmails(booking, { contact, transport } = {}) {
  if (!transport && !isConfigured()) return { customer: "skipped", admin: "skipped" };
  const mailer = transport || getTransport();
  const from = { name: "Muvment Experience", address: process.env.GMAIL_USER };
  const adminTo = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;

  const c = customerEmail(booking, contact);
  const a = adminEmail(booking);
  const [customer, admin] = await Promise.allSettled([
    mailer.sendMail({ from, to: booking.email, replyTo: adminTo, subject: c.subject, html: c.html, text: c.text }),
    mailer.sendMail({ from, to: adminTo, replyTo: { name: booking.name, address: booking.email }, subject: a.subject, html: a.html, text: a.text }),
  ]);
  for (const [who, r] of [["customer", customer], ["admin", admin]]) {
    if (r.status === "rejected") console.error(`Booking email to ${who} failed:`, r.reason && r.reason.message);
  }
  return {
    customer: customer.status === "fulfilled" ? "sent" : "failed",
    admin: admin.status === "fulfilled" ? "sent" : "failed",
  };
}

module.exports = { sendBookingEmails, customerEmail, adminEmail, reference, longDate };
