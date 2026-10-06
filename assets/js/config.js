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
  ],

  /*
   * priceBasis is one of: "person", "couple".
   * groupExample (optional) shows a quoted total for a group size.
   * image is the package photo. Drop a file with exactly that name into
   * assets/img/packages/ and it appears on the card; until then the card
   * shows its colour artwork. imageAlt describes the photo for screen
   * readers. For several photos on one card, use images instead:
   * a list of { src, alt } — the card shows dots to switch between them. Landscape, about 1600×1200 px, under 400 KB works best.
   */
  packages: [
    {
      id: "executive-oceanic-romance",
      image: "assets/img/packages/executive-oceanic-romance.jpg",
      imageAlt: "A couple sharing dinner and wine aboard a private boat on the Lagos lagoon at sunset",
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
      images: [
        { src: "assets/img/packages/artsy-couple-paint-and-sip.jpg", alt: "Guests laughing and sipping wine as they paint portraits at a CeraCerni's Art Hub session" },
        { src: "assets/img/packages/artsy-couple-art-hub.jpg", alt: "CeraCerni's Art Hub studio with graffiti-covered walls and a painted ocean floor" },
        { src: "assets/img/packages/fired-and-iced-garden-terrace.jpg", alt: "Fired and Iced garden terrace at night under string lights, with wooden tables and iron chairs" },
        { src: "assets/img/packages/fired-and-iced-sharing-platters.jpg", alt: "Fired and Iced sharing platters: a burger, suya-spiced skewers, fried calamari and puff-puff" },
        { src: "assets/img/packages/fired-and-iced-dishes.jpg", alt: "Fired and Iced dishes of fried plantain, crispy chicken and Caesar salad beside a branded napkin" },
        { src: "assets/img/packages/george-residence-wood-suite.jpg", alt: "George Residence suite with a velvet headboard, wood-panelled wall and globe pendant lights" },
        { src: "assets/img/packages/george-residence-cove-suite.jpg", alt: "George Residence suite with cove lighting, a king bed and a towel swan" },
        { src: "assets/img/packages/george-residence-marble-suite.jpg", alt: "Spacious George Residence suite with marble floors, a work desk and a walk-in wardrobe" },
      ],
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
      images: [
        { src: "assets/img/packages/oriki-spa-couples-suite.jpg", alt: "ORÍKÌ Spa double treatment room with robes, rolled towels and candles" },
        { src: "assets/img/packages/oriki-spa-ivy-room.jpg", alt: "ORÍKÌ Spa treatment room with an ivy-framed mirror and warm wood panelling" },
        { src: "assets/img/packages/oriki-spa-treatment-room.jpg", alt: "ORÍKÌ Spa treatment bed with a towel swan under soft cove lighting" },
        { src: "assets/img/packages/j-randle-royal-regalia.jpg", alt: "J. Randle Centre display of Yorùbá royal regalia with a beaded crown, staff and carved door panel" },
        { src: "assets/img/packages/j-randle-masquerade-gallery.jpg", alt: "J. Randle Centre gallery of masquerade costumes and carved figures under a timber ceiling" },
        { src: "assets/img/packages/j-randle-egungun.jpg", alt: "A sequinned Egúngún masquerade costume against a bold painted mural at the J. Randle Centre" },
        { src: "assets/img/packages/j-randle-cowrie-crown.jpg", alt: "A cowrie-shell headpiece displayed in a glass case at the J. Randle Centre" },
        { src: "assets/img/packages/fired-and-iced-garden-terrace.jpg", alt: "Fired and Iced garden terrace at night under string lights, with wooden tables and iron chairs" },
        { src: "assets/img/packages/fired-and-iced-sharing-platters.jpg", alt: "Fired and Iced sharing platters: a burger, suya-spiced skewers, fried calamari and puff-puff" },
        { src: "assets/img/packages/fired-and-iced-dishes.jpg", alt: "Fired and Iced dishes of fried plantain, crispy chicken and Caesar salad beside a branded napkin" },
      ],
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
      images: [
        { src: "assets/img/packages/george-residence-wood-suite.jpg", alt: "George Residence suite with a velvet headboard, wood-panelled wall and globe pendant lights" },
        { src: "assets/img/packages/george-residence-cove-suite.jpg", alt: "George Residence suite with cove lighting, a king bed and a towel swan" },
        { src: "assets/img/packages/george-residence-marble-suite.jpg", alt: "Spacious George Residence suite with marble floors, a work desk and a walk-in wardrobe" },
        { src: "assets/img/packages/oriki-spa-ivy-room.jpg", alt: "ORÍKÌ Spa treatment room with an ivy-framed mirror and warm wood panelling" },
        { src: "assets/img/packages/oriki-spa-treatment-room.jpg", alt: "ORÍKÌ Spa treatment bed with a towel swan under soft cove lighting" },
        { src: "assets/img/packages/oriki-spa-couples-suite.jpg", alt: "ORÍKÌ Spa double treatment room with robes, rolled towels and candles" },
        { src: "assets/img/packages/ile-eros-dining-room.jpg", alt: "ILÉ Eros dining room with terracotta walls, woven panels and a sculptural tree centrepiece" },
        { src: "assets/img/packages/ile-eros-red-canopy.jpg", alt: "ILÉ Eros restaurant under a red ceiling installation, with patterned chairs and set tables" },
        { src: "assets/img/packages/ile-eros-bar.jpg", alt: "ILÉ Eros bar glowing amber, with raffia pendant lights and gold wall plates" },
        { src: "assets/img/packages/j-randle-royal-regalia.jpg", alt: "J. Randle Centre display of Yorùbá royal regalia with a beaded crown, staff and carved door panel" },
        { src: "assets/img/packages/j-randle-masquerade-gallery.jpg", alt: "J. Randle Centre gallery of masquerade costumes and carved figures under a timber ceiling" },
        { src: "assets/img/packages/j-randle-egungun.jpg", alt: "A sequinned Egúngún masquerade costume against a bold painted mural at the J. Randle Centre" },
        { src: "assets/img/packages/j-randle-cowrie-crown.jpg", alt: "A cowrie-shell headpiece displayed in a glass case at the J. Randle Centre" },
      ],
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
      price: 300000,
      priceBasis: "person",
      palette: ["#6e5440", "#a9876a", "#efdcc2"],
    },
    {
      id: "afrocentric-culture-weekday",
      images: [
        { src: "assets/img/packages/ile-eros-dining-room.jpg", alt: "ILÉ Eros dining room with terracotta walls, woven panels and a sculptural tree centrepiece" },
        { src: "assets/img/packages/ile-eros-red-canopy.jpg", alt: "ILÉ Eros restaurant under a red ceiling installation, with patterned chairs and set tables" },
        { src: "assets/img/packages/ile-eros-bar.jpg", alt: "ILÉ Eros bar glowing amber, with raffia pendant lights and gold wall plates" },
      ],
      category: "culture",
      tier: "Weekday",
      title: "Afrocentric Culture",
      tagline: "Taste and history, Lagos-style.",
      includes: [
        "ILÉ Eros — bespoke culinary journey",
        "Kalakuta Museum — guided immersion into Fela's legacy and Afrobeats history",
      ],
      price: 70000,
      priceBasis: "person",
      palette: ["#8a6326", "#c39a4f", "#f3dfb3"],
    },
    {
      id: "afrocentric-culture-sunday",
      images: [
        { src: "assets/img/packages/new-afrika-shrine-concert.jpg", alt: "Live Afrobeat performance at the New Afrika Shrine, with a saxophonist, drummers and dancers on stage" },
        { src: "assets/img/packages/ile-eros-bar.jpg", alt: "ILÉ Eros bar glowing amber, with raffia pendant lights and gold wall plates" },
        { src: "assets/img/packages/ile-eros-dining-room.jpg", alt: "ILÉ Eros dining room with terracotta walls, woven panels and a sculptural tree centrepiece" },
        { src: "assets/img/packages/ile-eros-red-canopy.jpg", alt: "ILÉ Eros restaurant under a red ceiling installation, with patterned chairs and set tables" },
      ],
      category: "culture",
      tier: "Sunday",
      title: "Afrocentric Culture",
      tagline: "Sunday at the Shrine, VIP.",
      includes: [
        "ILÉ Eros — bespoke culinary journey",
        "New Afrika Shrine — Sunday VIP live concert with VIP seating, concierge, palm wine, beverages, 2-course meal and traditional appetisers",
      ],
      price: 200000,
      priceBasis: "couple",
      palette: ["#7a3a26", "#b5643f", "#f0c9a3"],
    },
    {
      id: "corporate-cafe-strategy",
      images: [
        { src: "assets/img/packages/cafe-one-lounge.jpg", alt: "Café One lounge with a curved grey sofa, branded red and white cushions and a board game table" },
        { src: "assets/img/packages/cafe-one-boardroom-tables.jpg", alt: "Café One meeting tables with red chairs beside a CREATIVE wall" },
        { src: "assets/img/packages/cafe-one-workspace.jpg", alt: "Café One workspace with lounge seating, shared desks and the coffee bar" },
        { src: "assets/img/packages/cafe-one-games-tables.jpg", alt: "Bright Café One floor with chess sets on white tables and red-backed chairs" },
        { src: "assets/img/packages/fired-and-iced-garden-terrace.jpg", alt: "Fired and Iced garden terrace at night under string lights, with wooden tables and iron chairs" },
        { src: "assets/img/packages/fired-and-iced-sharing-platters.jpg", alt: "Fired and Iced sharing platters: a burger, suya-spiced skewers, fried calamari and puff-puff" },
        { src: "assets/img/packages/fired-and-iced-dishes.jpg", alt: "Fired and Iced dishes of fried plantain, crispy chicken and Caesar salad beside a branded napkin" },
        { src: "assets/img/packages/carven-gaming-arena.jpg", alt: "Carven gaming arena with rows of red and black gaming chairs and screens" },
        { src: "assets/img/packages/carven-racing-simulators.jpg", alt: "Carven racing simulators with steering wheels and bucket seats" },
        { src: "assets/img/packages/arrowsden-archery-archer.jpg", alt: "An archer drawing a recurve bow at the ArrowsDen Archery outdoor range" },
        { src: "assets/img/packages/arrowsden-archery-target.jpg", alt: "ArrowsDen Archery indoor lane with a target board and branded banner" },
      ],
      category: "executive",
      title: "The Corporate Café Strategy",
      tagline: "Plan the quarter. Then play.",
      includes: [
        "Cafe One — morning boardroom strategy session with cake and pastry breakfast",
        "Fired and Iced Restaurant — Pan-African executive group dinner",
        "Landmark Ecosystem Synergy Combo — 1-hour All Access Pass at Carven (console, dance, racing) plus Deluxe Adult Package at ArrowsDen Archery, POP Landmark (12 arrows, expert guidance)",
      ],
      price: 150000,
      priceBasis: "person",
      groupExample: { size: 8, total: 1200000 },
      palette: ["#3c4b55", "#7d8f99", "#e3e8ea"],
    },
    {
      id: "creative-ignition-off-site",
      images: [
        { src: "assets/img/packages/paintball-action.jpg", alt: "A paintball player in full tactical gear aiming from behind an inflatable bunker" },
        { src: "assets/img/packages/paintball-team.jpg", alt: "A paintball team in masks and vests posing among tyre barriers at Leisure Sports Paintball, Landmark" },
        { src: "assets/img/packages/paintball-kneeling-shot.jpg", alt: "A player kneeling and firing between inflatable bunkers at Leisure Sports Paintball" },
        { src: "assets/img/packages/fired-and-iced-garden-terrace.jpg", alt: "Fired and Iced garden terrace at night under string lights, with wooden tables and iron chairs" },
        { src: "assets/img/packages/fired-and-iced-sharing-platters.jpg", alt: "Fired and Iced sharing platters: a burger, suya-spiced skewers, fried calamari and puff-puff" },
        { src: "assets/img/packages/fired-and-iced-dishes.jpg", alt: "Fired and Iced dishes of fried plantain, crispy chicken and Caesar salad beside a branded napkin" },
      ],
      category: "executive",
      title: "The Creative Ignition Off-Site",
      tagline: "Team bonding with a competitive edge.",
      includes: [
        "Leisure Sports Paintball — Group Package 1 (up to 10 players), full tactical gear, small chops from Autogirl",
        "Fired and Iced Restaurant — networking reception with crafted drinks and sharing platters",
      ],
      price: 55000,
      priceBasis: "person",
      groupExample: { size: 8, total: 440000 },
      palette: ["#4f5a3a", "#8a9466", "#e8e9cf"],
    },
  ],

  partners: ["George Residence", "ORÍKÌ Spa", "ILÉ Eros", "Cafe One"],
};
