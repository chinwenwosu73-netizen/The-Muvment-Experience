/*
 * Muvment Experience — page behaviour.
 * Content comes from config.js (window.MUVMENT_CONFIG); this file only
 * renders it and handles the booking request.
 */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const config = window.MUVMENT_CONFIG;
  const { contact, booking, categories, packages, partners } = config;
  const categoryName = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const packageById = Object.fromEntries(packages.map((p) => [p.id, p]));

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value == null || value === false) continue;
      if (key === "text") node.textContent = value;
      else if (key === "class") node.className = value;
      else node.setAttribute(key, value === true ? "" : value);
    }
    for (const child of [].concat(children)) {
      if (child != null) node.append(child);
    }
    return node;
  }

  const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
  const formatPrice = (n) => naira.format(n);
  const basisLabel = (basis) => (basis === "couple" ? "per couple" : "per person");
  const fullTitle = (p) => (p.tier ? `${p.title} — ${p.tier}` : p.title);

  /* ---------- Analytics (FR-08) ---------- */

  // Pushes to dataLayer (Google Tag Manager) and calls gtag if present.
  // Add your analytics snippet to index.html and these events flow through.
  window.dataLayer = window.dataLayer || [];
  function track(event, data = {}) {
    const payload = { event, ...data, utm: utmParams() };
    window.dataLayer.push(payload);
    if (typeof window.gtag === "function") window.gtag("event", event, data);
  }
  function utmParams() {
    const params = new URLSearchParams(location.search);
    const utm = {};
    for (const [k, v] of params) if (k.startsWith("utm_")) utm[k] = v;
    return utm;
  }

  /* ---------- Contact links ---------- */

  function whatsappUrl(pkg) {
    let text = "Hi Muvment Concierge, I'd like to know more about your experiences.";
    if (pkg) {
      text = `Hi Muvment Concierge, I'd like to book ${fullTitle(pkg)} (${formatPrice(pkg.price)} ${basisLabel(pkg.priceBasis)}). Preferred date: ___. Group size: ___.`;
    }
    return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(text)}`;
  }

  $$("[data-whatsapp]").forEach((a) => (a.href = whatsappUrl()));
  $$("[data-email]").forEach((a) => { a.href = `mailto:${contact.email}`; a.textContent = contact.email; });
  $$("[data-phone]").forEach((a) => { a.href = `tel:${contact.phoneDisplay.replace(/[^\d+]/g, "")}`; a.textContent = contact.phoneDisplay; });
  $$("[data-main-site]").forEach((a) => (a.href = contact.mainSiteUrl));
  $$("[data-instagram]").forEach((a) => (a.href = contact.instagramUrl));
  $$("[data-privacy]").forEach((a) => (a.href = contact.privacyPolicyUrl));
  $$("[data-year]").forEach((s) => (s.textContent = new Date().getFullYear()));

  document.addEventListener("click", (e) => {
    const tracked = e.target.closest("[data-track]");
    if (tracked) track(tracked.dataset.track, { package: tracked.dataset.package });
  });

  /* ---------- Hero ---------- */

  if (config.heroVideo) {
    const video = el("video", { src: config.heroVideo, autoplay: true, muted: true, loop: true, playsinline: true });
    video.muted = true;
    $("[data-hero-media]").prepend(video);
  }

  const marqueeWords = categories.map((c) => c.name).concat(["Lagos", "Concierge-handled"]);
  const marquee = $('[data-marquee="categories"]');
  // Two copies so the -50% translate loops seamlessly.
  for (let i = 0; i < 2; i++) marqueeWords.forEach((w) => marquee.append(el("span", { text: w })));

  /* ---------- Catalog ---------- */

  const cardsRoot = $("[data-cards]");
  const filtersRoot = $("[data-filters]");

  function includeItem(text) {
    // "Venue — what you get" → venue in bold.
    const [venue, ...rest] = text.split(" — ");
    if (!rest.length) return el("li", { text });
    return el("li", {}, [el("strong", { text: venue }), ` — ${rest.join(" — ")}`]);
  }

  function cardArt(pkg) {
    const [deep, mid, glow] = pkg.palette || ["#1a1a1a", "#3a3a3a", "#c9a96e"];
    const art = el("div", { class: "card__art" });
    // Colour artwork is always drawn; a photo, when present, sits on top.
    // If the photo file is missing, it is removed and the artwork shows.
    const bg = el("div", { class: "card__art-bg", "aria-hidden": "true" });
    bg.style.background = `radial-gradient(120% 90% at 85% 10%, ${glow}55, transparent 55%),
      radial-gradient(90% 80% at 10% 100%, ${mid}, transparent 70%),
      linear-gradient(160deg, ${deep}, ${mid} 60%, ${deep})`;
    art.append(bg, el("div", { class: "card__grain", "aria-hidden": "true" }));
    art.append(el("span", { class: "card__art-word", "aria-hidden": "true", text: categoryName[pkg.category] }));
    const photos = pkg.images || (pkg.image ? [{ src: pkg.image, alt: pkg.imageAlt }] : []);
    const imgs = photos.map((photo, i) => {
      const img = el("img", { src: photo.src, alt: photo.alt || fullTitle(pkg), loading: "lazy", decoding: "async", class: i === 0 ? "is-active" : null });
      img.addEventListener("load", () => art.classList.add("has-photo"));
      img.addEventListener("error", () => dropPhoto(img));
      return img;
    });
    art.append(...imgs);

    // Several photos: dots to switch, and a tap on the photo shows the next.
    const dots = el("div", { class: "card__dots" });
    if (imgs.length > 1) {
      imgs.forEach((img, i) => {
        const dot = el("button", { type: "button", class: "card__dot", "aria-label": `Show photo ${i + 1} of ${imgs.length}`, "aria-current": String(i === 0) });
        dot.addEventListener("click", () => show(img));
        img.dot = dot;
        dots.append(dot);
      });
      art.addEventListener("click", (e) => {
        if (e.target.tagName !== "IMG") return;
        const live = imgs.filter((im) => im.isConnected);
        show(live[(live.indexOf(e.target) + 1) % live.length]);
      });
    }
    function show(img) {
      imgs.forEach((im) => {
        im.classList.toggle("is-active", im === img);
        if (im.dot) im.dot.setAttribute("aria-current", String(im === img));
      });
    }
    function dropPhoto(img) {
      const wasActive = img.classList.contains("is-active");
      img.remove();
      if (img.dot) img.dot.remove();
      const live = imgs.filter((im) => im.isConnected);
      if (wasActive && live.length) show(live[0]);
      if (live.length < 2) dots.remove();
    }

    art.append(el("span", { class: "card__tag", text: categoryName[pkg.category] }));
    if (pkg.tier) art.append(el("span", { class: "card__tier", text: pkg.tier }));
    if (imgs.length > 8) dots.classList.add("card__dots--many");
    if (imgs.length > 1) art.append(dots);
    return art;
  }

  function renderCard(pkg) {
    const price = el("div", { class: "card__price" }, [
      el("span", { class: "card__amount", text: formatPrice(pkg.price) }),
      el("span", { class: "card__basis", text: basisLabel(pkg.priceBasis) }),
      pkg.groupExample
        ? el("span", { class: "card__group", text: `${formatPrice(pkg.groupExample.total)} for a group of ${pkg.groupExample.size}` })
        : null,
    ]);

    const actions = el("div", { class: "card__actions" }, [
      el("button", { type: "button", class: "btn btn--primary", "data-book": pkg.id, "data-track": "cta_book", "data-package": pkg.id, text: "Book This Experience" }),
      el("a", { class: "card__wa", href: whatsappUrl(pkg), target: "_blank", rel: "noopener", "data-track": "whatsapp_card", "data-package": pkg.id, text: "or ask on WhatsApp" }),
    ]);

    return el("article", { class: "card reveal", "data-category": pkg.category, "aria-labelledby": `t-${pkg.id}` }, [
      cardArt(pkg),
      el("div", { class: "card__body" }, [
        el("h3", { class: "card__title", id: `t-${pkg.id}`, text: fullTitle(pkg) }),
        el("p", { class: "card__tagline", text: pkg.tagline }),
        el("ul", { class: "card__includes" }, pkg.includes.map(includeItem)),
        el("div", { class: "card__foot" }, [price, actions]),
      ]),
    ]);
  }

  packages.forEach((pkg) => cardsRoot.append(renderCard(pkg)));

  const filterOptions = [{ id: "all", name: "All" }].concat(categories);
  filterOptions.forEach((cat) => {
    filtersRoot.append(el("button", { type: "button", class: "filter", "data-filter": cat.id, "aria-pressed": String(cat.id === "all"), text: cat.name }));
  });
  filtersRoot.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    const id = btn.dataset.filter;
    $$("[data-filter]", filtersRoot).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    $$(".card", cardsRoot).forEach((card) => {
      card.hidden = id !== "all" && card.dataset.category !== id;
      card.classList.add("is-in");
    });
    track("filter_category", { category: id });
  });

  /* ---------- Partners ---------- */

  const partnersRoot = $("[data-partners]");
  partners.forEach((name) => partnersRoot.append(el("li", { text: name })));

  /* ---------- Booking dialog ---------- */

  const dialog = $("[data-booking]");
  const form = $("[data-booking-form]");
  const done = $("[data-booking-done]");
  const select = $("[data-package-select]");
  const estimate = $("[data-estimate]");
  const status = $("[data-status]");
  const submitBtn = $("[data-submit]");
  const dateInput = form.elements.date;

  packages.forEach((pkg) => {
    select.append(el("option", { value: pkg.id, text: `${fullTitle(pkg)} · ${formatPrice(pkg.price)} ${basisLabel(pkg.priceBasis)}` }));
  });

  function isoDate(d) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  function tomorrow() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return isoDate(d);
  }

  function selectedPackage() {
    return packageById[select.value];
  }

  function estimateFor(pkg, size) {
    if (!pkg || !Number.isInteger(size) || size < 1) return null;
    if (pkg.priceBasis === "couple") {
      const couples = Math.ceil(size / 2);
      return { total: pkg.price * couples, note: `${couples} couple${couples > 1 ? "s" : ""} × ${formatPrice(pkg.price)}` };
    }
    return { total: pkg.price * size, note: `${size} guest${size > 1 ? "s" : ""} × ${formatPrice(pkg.price)}` };
  }

  // FR-10: estimated total, clearly labelled as an estimate.
  function updateSummary() {
    const pkg = selectedPackage();
    $("[data-booking-title]").textContent = pkg ? fullTitle(pkg) : "Your experience";
    $("[data-booking-price]").textContent = pkg ? `${formatPrice(pkg.price)} ${basisLabel(pkg.priceBasis)}` : "";
    const est = estimateFor(pkg, Number(form.elements.groupSize.value));
    estimate.replaceChildren();
    if (est) {
      estimate.append("Estimated total ", el("strong", { text: formatPrice(est.total) }), ` — ${est.note}. Final price is confirmed by the Concierge.`);
    }
  }

  function openBooking(pkgId) {
    form.reset();
    clearErrors();
    status.textContent = "";
    form.hidden = false;
    done.hidden = true;
    dateInput.min = tomorrow();
    if (pkgId) select.value = pkgId;
    updateSummary();
    dialog.showModal();
    form.elements.name.focus();
    track("booking_open", { package: select.value });
  }

  document.addEventListener("click", (e) => {
    const book = e.target.closest("[data-book]");
    if (book) openBooking(book.dataset.book);
    if (e.target.closest("[data-booking-close]")) dialog.close();
  });
  // Click on the backdrop closes the dialog.
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });

  select.addEventListener("change", updateSummary);
  form.elements.groupSize.addEventListener("input", updateSummary);

  /* ---------- Validation (FR-04) ---------- */

  const validators = {
    name: (v) => (v.trim().length >= 2 ? "" : "Please enter your full name."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address."),
    phone: (v) => {
      const digits = v.replace(/\D/g, "");
      return /^[\d\s()+-]+$/.test(v.trim()) && digits.length >= 7 && digits.length <= 15 ? "" : "Please enter a valid phone number.";
    },
    date: (v) => (v && v >= tomorrow() ? "" : "Please choose a date from tomorrow onwards."),
    groupSize: (v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= 100 ? "" : "Group size must be a whole number of at least 1.";
    },
  };

  function setError(name, message) {
    const input = form.elements[name];
    const slot = $(`[data-error-for="${name}"]`, form);
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (message) input.setAttribute("aria-describedby", `err-${name}`);
    else input.removeAttribute("aria-describedby");
    slot.id = `err-${name}`;
    slot.textContent = message;
  }
  function clearErrors() {
    Object.keys(validators).forEach((name) => setError(name, ""));
  }
  function validate() {
    let firstInvalid = null;
    for (const [name, check] of Object.entries(validators)) {
      const message = check(form.elements[name].value);
      setError(name, message);
      if (message && !firstInvalid) firstInvalid = form.elements[name];
    }
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }
  Object.keys(validators).forEach((name) => {
    form.elements[name].addEventListener("blur", () => {
      if (form.elements[name].value) setError(name, validators[name](form.elements[name].value));
    });
  });

  /* ---------- Submit (FR-05, FR-06) ---------- */

  function buildRequest() {
    const pkg = selectedPackage();
    const groupSize = Number(form.elements.groupSize.value);
    const est = estimateFor(pkg, groupSize);
    return {
      package: fullTitle(pkg),
      packageId: pkg.id,
      listedPrice: `${formatPrice(pkg.price)} ${basisLabel(pkg.priceBasis)}`,
      estimatedTotal: est ? formatPrice(est.total) : "",
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      preferredDate: form.elements.date.value,
      groupSize,
      submittedAt: new Date().toISOString(),
      source: utmParams(),
      website: form.elements.website.value,
    };
  }

  function mailtoFor(request) {
    const lines = [
      `Package: ${request.package}`,
      `Listed price: ${request.listedPrice}`,
      `Estimated total: ${request.estimatedTotal}`,
      `Name: ${request.name}`,
      `Email: ${request.email}`,
      `Phone: ${request.phone}`,
      `Preferred date: ${request.preferredDate}`,
      `Group size: ${request.groupSize}`,
      `Submitted: ${request.submittedAt}`,
    ];
    const subject = `Booking request — ${request.package}`;
    return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  }

  function showDone(message) {
    form.hidden = true;
    done.hidden = false;
    $("[data-done-text]").textContent = message;
    $("[data-booking-close]", done).focus();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    if (!validate()) return;

    const request = buildRequest();

    const sendByEmail = (channel) => {
      window.location.href = mailtoFor(request);
      track("form_submit", { package: request.packageId, channel });
      showDone(`Your email app should now open with your request for ${request.package} ready to send — just press Send. The Muvment Concierge will respond ${contact.responseTime}.`);
    };

    if (!booking.formEndpoint) {
      sendByEmail("mailto");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    try {
      let res = null;
      try {
        res = await fetch(booking.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(request),
        });
      } catch (err) {
        res = null; // offline, or no backend (site opened as a file)
      }

      if (res && res.ok) {
        track("form_submit", { package: request.packageId, channel: "form" });
        showDone(`We've received your request for ${request.package}. The Muvment Concierge will contact you ${contact.responseTime} to confirm your booking.`);
      } else if (res && res.status === 400) {
        // The server found a problem with a field: show it like the browser checks do.
        const data = await res.json().catch(() => ({}));
        if (data.field && form.elements[data.field] && data.field !== "package") {
          setError(data.field, data.error);
          form.elements[data.field].focus();
        } else {
          status.textContent = data.error || "Please check your details and try again.";
        }
        track("form_error", { package: request.packageId, reason: "invalid" });
      } else {
        // Backend missing or down: don't lose the lead, hand it to email instead.
        track("form_error", { package: request.packageId, reason: res ? `http_${res.status}` : "network" });
        sendByEmail("mailto_fallback");
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send booking request";
    }
  });

  /* ---------- Nav + reveal ---------- */

  const nav = $("[data-nav]");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((node, i) => {
      node.style.transitionDelay = `${Math.min(i % 4, 3) * 80}ms`;
      io.observe(node);
    });
  } else {
    $$(".reveal").forEach((node) => node.classList.add("is-in"));
  }
})();
