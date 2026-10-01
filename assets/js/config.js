/*
 * Muvment Experience — site content.
 *
 * Everything a non-developer should need to change lives in this file:
 * contact details, where booking requests are sent, and every package's
 * copy and price. Edit the values, save, and reload the page.
 *
 * Prices are final client prices in naira (no commas). Never put vendor
 * costs or margins in here — this file is public.
 */
window.MUVMENT_CONFIG = {
  contact: {
    // TODO: replace with the real Concierge WhatsApp number, digits only,
    // international format without "+" (e.g. 2348012345678).
    whatsappNumber: "2340000000000",
    // TODO: replace with the real operations inbox.
    email: "concierge@muvment.example",
    phoneDisplay: "+234 000 000 0000",
    mainSiteUrl: "https://muvment.example",
    privacyPolicyUrl: "https://muvment.example/privacy",
    instagramUrl: "https://instagram.com/",
    responseTime: "within 24 hours",
  },

  booking: {
    // Where the lead form is POSTed as JSON. Works with Formspree
    // (https://formspree.io → create a form → paste its URL here) or any
    // endpoint that accepts JSON. Leave empty to fall back to opening the
    // visitor's email app with the request pre-written to contact.email.
    formEndpoint: "",
  },

  // Optional full-screen hero video (mp4). Leave empty to use the
  // animated backdrop.
  heroVideo: "",

  categories: [
    { id: "romance", name: "Romance" },
    { id: "artsy-couple", name: "Artsy Couple" },
    { id: "soft-life", name: "Soft Life" },
    { id: "culture", name: "Culture" },
    { id: "executive", name: "Executive" },
    { id: "nightlife", name: "Nightlife" },
  ],

  /*
   * priceBasis is one of: "person", "couple".
   * groupExample (optional) shows a quoted total for a group size.
   * image (optional) is a path such as "assets/img/artsy-couple.jpg";
   * without one, the card shows its colour artwork instead.
   */
  packages: [
    {
      id: "executive-oceanic-romance",
      category: "romance",
      title: "The Executive Oceanic Romance",
      tagline: "A private evening on the water.",
      includes: [
        "Private 1.5-hour luxury boat charter with a curated romantic soundscape",
        "Bespoke 3-course gourmet dinner",
        "Sommelier-selected premium vintage red wine",
      ],
      price: 432000,
      priceBasis: "couple",
      palette: ["#1f4e5a", "#4f8a92", "#e6d3b0"],
    },
    {
      id: "artsy-couple",
      category: "artsy-couple",
      title: "Artsy Couple",
      tagline: "Create, dine and stay in style.",
      includes: [
        "CeraCerni's Art Hub — Spin and Spill session for two",
        "Fired and Iced Restaurant — exclusive, curated intimate dining",
        "George Residence — opulent suite with glass-encased bathroom, soaking tub, streaming entertainment and gourmet breakfast",
      ],
      price: 294000,
      priceBasis: "couple",
      palette: ["#8a4b36", "#c07a5a", "#f1dcc6"],
    },
    {
      id: "soft-life-saturday-regular",
      category: "soft-life",
      tier: "Regular",
      title: "Soft Life Saturday",
      tagline: "Pampered, cultured, well fed.",
      includes: [
        "ORÍKÌ Spa — 45-min Signature Deluxe Pedicure",
        "J. Randle Centre for Yorùbá Culture & History — guided heritage tour",
        "Fired and Iced Restaurant — group dining with premium shared platters",
      ],
      price: 51600,
      priceBasis: "person",
      groupExample: { size: 8, total: 412800 },
      palette: ["#9c7f68", "#c8ab90", "#f5e9da"],
    },
    {
      id: "soft-life-saturday-premium",
      category: "soft-life",
      tier: "Premium",
      title: "Soft Life Saturday",
      tagline: "The full day of indulgence.",
      includes: [
        "ORÍKÌ Spa — 105-min Deluxe Manicure & Pedicure",
        "J. Randle Centre — guided heritage tour",
        "ILÉ Eros — Dambunama rolls, main course, Classic Chapman, premium water",
        "George Residence — opulent suite with gourmet breakfast",
        "Private Cinema — private screening (groups only)",
      ],
      price: 272850,
      priceBasis: "person",
      // No groupExample: the source's group-of-8 total doesn't match the
      // per-person price (PRD section 9). Add one once it's confirmed.
      palette: ["#6e5440", "#a9876a", "#efdcc2"],
    },
    {
      id: "afrocentric-culture-weekday",
      category: "culture",
      tier: "Weekday",
      title: "Afrocentric Culture",
      tagline: "Taste and history, Lagos-style.",
      includes: [
        "ILÉ Eros — bespoke culinary journey",
        "Kalakuta Museum — guided immersion into Fela's legacy and Afrobeats history",
      ],
      price: 66600,
      priceBasis: "person",
      palette: ["#8a6326", "#c39a4f", "#f3dfb3"],
    },
    {
      id: "afrocentric-culture-sunday",
      category: "culture",
      tier: "Sunday",
      title: "Afrocentric Culture",
      tagline: "Sunday at the Shrine, VIP.",
      includes: [
        "ILÉ Eros — bespoke culinary journey",
        "New Afrika Shrine — Sunday VIP live concert with VIP seating, concierge, palm wine, beverages, 2-course meal and traditional appetisers",
      ],
      price: 175200,
      priceBasis: "couple",
      palette: ["#7a3a26", "#b5643f", "#f0c9a3"],
    },
    {
      id: "corporate-cafe-strategy",
      category: "executive",
      title: "The Corporate Café Strategy",
      tagline: "Plan the quarter. Then play.",
      includes: [
        "Cafe One — morning boardroom strategy session with cake and pastry breakfast",
        "Fired and Iced Restaurant — Pan-African executive group dinner",
        "Landmark Ecosystem Synergy Combo — 1-hour All Access Pass at Carven (console, dance, racing) plus Deluxe Adult Package at ArrowsDen Archery, POP Landmark (12 arrows, expert guidance)",
      ],
      price: 134595,
      priceBasis: "person",
      groupExample: { size: 8, total: 1076760 },
      palette: ["#3c4b55", "#7d8f99", "#e3e8ea"],
    },
    {
      id: "creative-ignition-off-site",
      category: "executive",
      title: "The Creative Ignition Off-Site",
      tagline: "Team bonding with a competitive edge.",
      includes: [
        "Leisure Sports Paintball — Group Package 1 (up to 10 players), full tactical gear, small chops from Autogirl",
        "Fired and Iced Restaurant — networking reception with crafted drinks and sharing platters",
      ],
      price: 50250,
      priceBasis: "person",
      groupExample: { size: 8, total: 402000 },
      palette: ["#4f5a3a", "#8a9466", "#e8e9cf"],
    },
    {
      id: "nightlife-turnup-pass",
      category: "nightlife",
      title: "Nightlife Turnup Pass",
      tagline: "Lagos after dark, front of the line.",
      includes: [
        "Zaza Lagos — VIP table with signature premium bottle service",
        "The Library Lagos — priority VIP access and late-night transition",
      ],
      price: 330000,
      priceBasis: "person",
      palette: ["#3b2f5c", "#7a64a8", "#e4d9f2"],
    },
  ],

  partners: ["George Residence", "ORÍKÌ Spa", "ILÉ Eros", "Zaza Lagos", "Cafe One"],
};
