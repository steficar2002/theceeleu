# Shopify Theme Translation Tasks: Serbian → English

All user-facing Serbian (Latin script) text needs to be translated to English.
Each task is independent and can be worked on by a separate agent.

**Convention:** When translating, preserve all Liquid variables (`{{ }}`, `{% %}`), HTML tags, and Shopify translation key references (`t:...`). Only translate the human-readable Serbian text.

---

## Status Legend
- [ ] Not started
- [x] Completed

---

## TASK 1: Locale file — `locales/sr.json`
**Scope:** ~350 translation keys across all theme UI strings
**File:** `locales/sr.json`

This is the main Serbian locale file containing the full theme UI translation (accessibility labels, actions, cart, checkout, account, orders, etc.). All values are in Serbian and need English translations.

**Key sections to translate:**
- `accessibility.*` — screen reader labels (Nalog, Korpa, Meni, etc.)
- `actions.*` — button/action labels (Dodaj u korpu, Zatvori, Nastavi kupovinu, etc.)
- `blocks.*` — form labels, unit prices, payment methods
- `blogs.*` — comment headings, form labels
- `content.*` — cart, checkout, search, inventory, pricing, product badges
- `fields.*` — field separators
- `gift_cards.*` — gift card UI
- `placeholders.*` — input placeholders
- `products.*` — add to cart, sold out, unavailable
- `shopify.sentence.*` — word connectors
- `shopify.checkout.*` — full checkout flow (contact, shipping, payment, thank you, order summary)
- `shopify.customer_accounts.*` — account pages (orders, addresses, settings, sign-in)

**Note:** This file is minified (single line). Format it for readability before editing.

- [x] Translate `locales/sr.json`

---

## TASK 2: Homepage template — `templates/index.json`
**Scope:** ~40+ Serbian strings in section settings
**File:** `templates/index.json`

Hardcoded Serbian content in homepage section configurations:

- **Hero product slides:** headlines, subheadlines, button labels
  - "Oživite koren kose uz našu kombinaciju ulja, šampona, mleka i tonika."
  - "Snaga kolagena u najčistijem obliku"
  - "Istraži serum", "Saznaj više o nama", "Istraži naše proizvode"
  - "Bez veštačkih mirisa"
- **Slideshow texts:** product descriptions for skincare/haircare collections
- **Shop by concern section:** concern titles and descriptions (skin texture, pigmentation, wrinkles, dryness, hair loss, oral health)
- **Find product section:** heading "Pronađi Svoj Idealni Proizvod", subheading, labels ("Tražim", "da rešim", "Pogledaj rešenje"), product type mappings, concern mappings
- **Collection list:** "Naše kolekcije"
- **Product bundle:** "Kolagenski set za zatezanje i sjaj kože"
- **Brand values/FAQ:** all value titles and descriptions (Čista Brend, Manje je Više, Stručnjak za Negu Kože, etc.), section title "Naše Vrednosti"
- **Stats block:** "Zadovoljnih korisnika širom sveta", "Od Dubaia do Amsterdama..."

**Note:** This file is minified JSON. Format before editing, re-minify after if needed.

- [x] Translate `templates/index.json`

---

## TASK 3: Product template — `templates/product.json`
**Scope:** ~25+ Serbian strings
**File:** `templates/product.json`

- **Quantity discount block:** "Uštedi 0%", "Uštedi" (prefix)
- **WhatsApp order button:** "Naruči preko WhatsApp-a"
- **Product set finder:** "Ovaj proizvod možete pronaći u...", "Ovaj set sadrži", "Sledeći proizvodi se nalaze u ovom setu"
- **Product ingredients subheading:** "Otkrijte zašto su naši proizvodi lideri..."
- **How it works section:** "Kako funkcioniše?", "Jednostavni koraci da izvučete maksimum..."
- **Stats block:** "Zadovoljnih korisnika širom sveta" (duplicated from homepage)
- **Brand values/FAQ:** all values (same content as homepage, duplicated in this template)
- **Hero text:** "Istražite naš ceo asortiman"

- [x] Translate `templates/product.json`

---

## TASK 4: Vitamins product template — `templates/product.vitamini.json`
**Scope:** ~6 Serbian strings
**File:** `templates/product.vitamini.json`

- "Bez veštačkih boja"
- "Napravljeno od pažljivo odabranih biljnih ekstrakata i vitamina."
- "Pogodno za sve, bez sastojaka životinjskog porekla i bez glutena..."
- "Kupuješ + Pomažeš"
- "Sa svakom porudžbinom, deo prihoda doniramo u humanitarne svrhe..."
- "Istražite našu celu kolekciju"

- [x] Translate `templates/product.vitamini.json`

---

## TASK 5: Collection template — `templates/collection.vitaminske-bombone.json`
**Scope:** ~3 Serbian strings
**File:** `templates/collection.vitaminske-bombone.json`

- Subtitle about gummy vitamins routine
- "VitaCEEL gumene bombone za kožu"

- [x] Translate `templates/collection.vitaminske-bombone.json`

---

## TASK 6: Contact page template — `templates/page.contact.json`
**Scope:** 1 Serbian string
**File:** `templates/page.contact.json`

- Submit button label: "Pošalji upit"

- [x] Translate `templates/page.contact.json`

---

## TASK 7: Cart template — `templates/cart.json`
**Scope:** 1 Serbian string
**File:** `templates/cart.json`

- Cart title: "Korpa"

- [x] Translate `templates/cart.json`

---

## TASK 8: Chatbot JavaScript — `assets/chatbot.js`
**Scope:** ~50+ Serbian strings across ~1500 lines of JS
**File:** `assets/chatbot.js`

All hardcoded Serbian strings in the chatbot logic:

- **Welcome messages:** "Zdravo! Kako mogu da vam pomognem danas?" and product-specific variant
- **Error messages:** network errors, server errors, timeout errors, add-to-cart errors (~6 strings)
- **System prompt instructions:** AI persona description, rules (=== PRAVILA ===), product info sections, ingredient notes, usage notes, bundle/set recommendations, special offers
- **Keyword arrays:** ~40+ Serbian keywords for skin concerns, product types, recommendation triggers (kolagen, retinol, suva koža, masna koža, etc.)

- [ ] Translate `assets/chatbot.js`

---

## TASK 9: Chatbot modal snippet — `snippets/chatbot-modal.liquid`
**Scope:** ~7 Serbian strings
**File:** `snippets/chatbot-modal.liquid`

- Toast title: "Pitajte nas bilo šta! 💬"
- Toast message: "Pritisnite ikonicu za ćaskanje..."
- Modal title: "Pitajte nas bilo šta o proizvodima"
- Button text: "Završi kupovinu"
- Input placeholder: "Napišite pitanje..."
- Send button aria-label: "Pošalji"
- JS welcome message: "Zdravo! 👋 Tu sam da ti pomognem..."

- [ ] Translate `snippets/chatbot-modal.liquid`

---

## TASK 10: Chatbot product info snippet — `snippets/chatbot-product-info.liquid`
**Scope:** ~25+ lines of Serbian system prompt instructions
**File:** `snippets/chatbot-product-info.liquid`

- System prompt: "Ti si korisni asistent i prodavac za..."
- All AI instruction rules in Serbian (use only product info, admit unknowns, correct spelling, friendly tone, seller behavior, bundle recommendations, etc.)
- Email reference: help@ceel.rs (keep as-is, just translate surrounding text)

- [ ] Translate `snippets/chatbot-product-info.liquid`

---

## TASK 11: Header actions snippet — `snippets/header-actions.liquid`
**Scope:** 1 Serbian string
**File:** `snippets/header-actions.liquid`

- Line 541: "Dodato u korpu. Pritisnite dugme za korpu da završite kupovinu"

- [ ] Translate `snippets/header-actions.liquid`

---

## TASK 12: Product bundle section — `sections/product-bundle.liquid`
**Scope:** 4 Serbian strings
**File:** `sections/product-bundle.liquid`

- "Originalna cena" (line 382)
- "Ušteda {{ savings | money }}" (line 387)
- "Dodaj set u korpu" (line 398)
- JS error: "Greška prilikom dodavanja" (line 516)

- [ ] Translate `sections/product-bundle.liquid`

---

## TASK 13: Product set finder section — `sections/product-set-finder.liquid`
**Scope:** 5 Serbian strings + schema defaults
**File:** `sections/product-set-finder.liquid`

- CSS content: "← Povucite da vidite više →" (line 190)
- Subheading: "Svi proizvodi koji su uključeni u ovaj set" (line 249)
- Schema defaults: "Ovaj proizvod možete pronaći u...", "Ovaj set sadrži", "Sledeći proizvodi se nalaze u ovom setu"

- [ ] Translate `sections/product-set-finder.liquid`

---

## TASK 14: Hero product section — `sections/hero-product.liquid`
**Scope:** 4 Serbian strings
**File:** `sections/hero-product.liquid`

- aria-label: "Sledeći slajd" (line 828)
- alt text: "Sledeći slajd" (line 830)
- Schema default: "Bez veštačkih mirisa" (line 1417)
- Schema default: "Ruzmarin, kofein i pantenol — jačaju koren..." (line 1532)

- [ ] Translate `sections/hero-product.liquid`

---

## TASK 15: Brand values FAQ section — `sections/brand-values-faq.liquid`
**Scope:** ~15 Serbian strings in schema defaults and presets
**File:** `sections/brand-values-faq.liquid`

- Section title default: "Naše Vrednosti"
- Subtitle default: "Saznajte više o tome kako brinemo..."
- Value title default: "Naša Vrednost"
- Value description default
- All preset values: "Čista Brend", "Mali ali Sažet Sadržaj", "Stručnjak za Negu Kože" + their descriptions

- [ ] Translate `sections/brand-values-faq.liquid`

---

## TASK 16: Find product section — `sections/find-product.liquid`
**Scope:** ~20+ Serbian strings in HTML options, JS arrays, and schema
**File:** `sections/find-product.liquid`

- HTML select options: "Čistač", "Šampon"
- JS concern arrays: "Hidratacija i suva koža", "Fleke i neujednačen ten", "Akne i upaljena koža", etc. (~12 concerns)
- JS product type mappings: "Čistač", "Šampon" with their specific concerns
- Section name: "Pronađi Proizvod"
- Schema defaults: heading, subheading, labels

- [ ] Translate `sections/find-product.liquid`

---

## TASK 17: Header section — `sections/header.liquid`
**Scope:** 1 Serbian string
**File:** `sections/header.liquid`

- Schema content: "Konfigurišite ikone za support bar na mobilnim uređajima" (line 1184)

- [ ] Translate `sections/header.liquid`

---

## TASK 18: Delivery time block — `blocks/delivery-time.liquid`
**Scope:** 2 arrays of Serbian strings
**File:** `blocks/delivery-time.liquid`

- Serbian day names array: nedelja, ponedeljak, utorak, sreda, četvrtak, petak, subota (line 16)
- Serbian month abbreviations array: jan, feb, mar, apr, maj, jun, jul, avg, sep, okt, nov, dec (line 17)

- [ ] Translate `blocks/delivery-time.liquid`

---

## TASK 19: WhatsApp order button block — `blocks/whatsapp-order-button.liquid`
**Scope:** 4 occurrences of same string
**File:** `blocks/whatsapp-order-button.liquid`

- "Naruči preko WhatsApp-a" appears as default text in 4 places (lines 91, 104, 131, 186)

- [ ] Translate `blocks/whatsapp-order-button.liquid`

---

## TASK 20: Price snippet comment — `snippets/price.liquid`
**Scope:** 1 code comment
**File:** `snippets/price.liquid`

- Comment contains "PRAZNIČNI POPUST" (line 21) — translate to English for code consistency

- [ ] Translate `snippets/price.liquid`

---

## Priority Order (suggested)

| Priority | Tasks | Reason |
|----------|-------|--------|
| **P0 - Critical** | 1, 8, 9, 10 | Locale file + chatbot = most visible user-facing text |
| **P1 - High** | 2, 3, 12, 13, 16 | Homepage + product pages = core shopping experience |
| **P2 - Medium** | 4, 5, 6, 7, 11, 14, 15, 18, 19 | Secondary templates and components |
| **P3 - Low** | 17, 20 | Admin-facing or code comments only |

---

## Notes for Agents

1. **JSON templates** (`templates/*.json`) are usually minified on a single line. Use `jq` or similar to format before editing.
2. **Schema defaults** inside `{% schema %}` blocks in `.liquid` files are JSON — be careful with escaping.
3. **Do not touch** translation key references like `"t:actions.add_to_cart"` — these are already handled by the locale system.
4. **Preserve** all Liquid syntax (`{{ }}`, `{% %}`), HTML attributes, CSS properties, and JavaScript logic.
5. **The `locales/sr.json` file** (Task 1) handles the Shopify translation system. The other tasks are about hardcoded strings that bypass the translation system entirely.
6. **Some content is duplicated** across templates (e.g., brand values appear in both `index.json` and `product.json`). Use consistent translations.
