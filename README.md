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

The website is plain HTML, CSS and JavaScript, with no build step. Either:

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
- [ ] Connect the booking database: follow **Booking database** below. Until it's connected, the form opens the visitor's email app with the request already written.
- [ ] Add package photography and an `og:image` for link previews.
- [ ] Add your analytics snippet (Google Analytics or Tag Manager) to `index.html`. These events are already sent: `cta_book`, `booking_open`, `form_submit`, `whatsapp_card`, `whatsapp_nav`, `filter_category`.
- [ ] Resolve the remaining open questions in PRD section 9.

## Booking database

Booking requests are saved to a [Supabase](https://supabase.com) database by a small backend in this repo:

| File | What it does |
|---|---|
| `api/bookings.js` | The backend. Vercel runs it at `/api/bookings`. It checks the request, takes the package name and price from `assets/js/config.js` (visitors can't change them), and saves the row. |
| `supabase/schema.sql` | Creates the `bookings` table and locks it so the public can't read it. |
| `tests/bookings.test.js` | Automated tests. Run them with `npm test` (Node 20+, nothing to install). |

Each row stores the package, its price and price basis, an estimated total, the visitor's name, email, phone, preferred date and group size, the UTM campaign tags, and a `status` (`new`, `contacted`, `confirmed`, `cancelled`) plus `notes` for your team.

If the database can't be reached, the form opens the visitor's email app with the request pre-written, so no booking is lost. A hidden spam-trap field quietly drops bot submissions.

### One-time setup (about 10 minutes)

1. **Create the database.** Sign up at [supabase.com](https://supabase.com) (free), click **New project**, name it `muvment-experience`, choose a strong database password, and pick the region nearest Lagos (for example *West EU (Ireland)*).
2. **Create the table.** In the project, open **SQL Editor**, then **New query**. Paste everything from `supabase/schema.sql` and click **Run**.
3. **Copy two values.** Open **Project Settings → API**. Copy the **Project URL**, then the **secret** key (on older projects this is the `service_role` key). Keep the secret key private and never put it in the website code.
4. **Give them to Vercel.** In your Vercel project, open **Settings → Environment Variables** and add both for **Production** and **Preview**:
   - `SUPABASE_URL` = the Project URL
   - `SUPABASE_SECRET_KEY` = the secret key
5. **Redeploy.** In Vercel, open **Deployments**, then the **⋯** menu on the latest deployment, then **Redeploy**.
6. **Test it.** Submit a booking on the live site, then open Supabase **Table Editor → bookings**. The request should be there.

### Viewing and managing bookings

In Supabase, go to **Table Editor → bookings**. Sort by `created_at` to see the newest requests first, change `status` as you follow up, and add `notes`. To share bookings with your team, invite them under **Project Settings → Team**. To get a spreadsheet, use **Export → CSV**.

## Publishing

The site is deployed on **Vercel**, and every merge into `main` publishes it automatically. The backend only runs on Vercel. GitHub Pages or a plain local server will show the site, but bookings will fall back to email.

To test the backend on your computer, install the [Vercel CLI](https://vercel.com/docs/cli), run `vercel env pull`, then run `vercel dev`.
