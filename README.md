# The Muvment Experience

Muvment Experience is a standalone, premium landing page that showcases 8 curated Phase 1 experience packages across 5 categories in Lagos and captures booking requests for Muvment's operations team. It sits outside the main Muvment app, so the booking flow is deliberately lightweight: enquiry in, operations follows up.

The full requirements are in [`docs/Muvment_Experience_PRD.pdf`](docs/Muvment_Experience_PRD.pdf).

## What's on the page

1. **Hero:** oversized headline and an "Explore Experiences" button.
2. **How it works:** three steps, from choosing an experience to the Concierge handling it.
3. **Experiences:** all 8 packages with their inclusions, prices and category filters.
4. **Partners:** the premium partner names.
5. **Footer:** contact details, social links and the privacy policy.

Every package card has a **Book This Experience** button that opens the booking form, plus an **or ask on WhatsApp** link with a pre-filled message. The form checks every field and shows an estimated total.

## See it on your computer

It's plain HTML, CSS and JavaScript, with no build step. Either:

- double-click `index.html`, or
- run `python3 -m http.server 8000` in this folder and open http://localhost:8000

## Changing content (no coding needed)

Everything editable is in **`assets/js/config.js`**:

| To change… | Edit… |
|---|---|
| WhatsApp number, email, phone, links | `contact` |
| Where booking requests go | `booking.formEndpoint` (see below) |
| A package's name, inclusions or price | that package in `packages` |
| Partner names | `partners` |
| Package photos | drop the photo into `assets/img/packages/` using the file name listed in that folder's README |
| Hero video | set `heroVideo: "assets/video/hero.mp4"` |

### Must do before launch

- [ ] Set the real `whatsappNumber` and `email` in `config.js`. They are placeholders now.
- [ ] Set `booking.formEndpoint` so requests go straight to the operations inbox. Create a free form at [Formspree](https://formspree.io), copy its URL (`https://formspree.io/f/…`) and paste it in. Until then, the form opens the visitor's email app with the request already written.
- [ ] Add package photography and an `og:image` for link previews.
- [ ] Add your analytics snippet (Google Analytics or Tag Manager) to `index.html`. These events are already sent: `cta_book`, `booking_open`, `form_submit`, `whatsapp_card`, `whatsapp_nav`, `filter_category`.
- [ ] Resolve the remaining open questions in PRD section 9.

## Publishing

Any static host works. The simplest is **GitHub Pages**: open the repo's **Settings → Pages**, choose the branch, and save.
