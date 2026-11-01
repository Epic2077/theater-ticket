/**
 * Production & branding configuration.
 * Edit this single file to rebrand the whole website:
 * names, copy, venue and contact details all flow from here.
 *
 * NOTE: The contact details below are intentional placeholders.
 * Replace them with the theater's real information before publishing.
 */
export const theater = {
  groupName: "تئاتر سایه",
  /** Small typographic mark shown in the navbar. */
  brandMark: "",
  productionTitle: "مصائب روزگار از دست رفته",
  productionType: "اجرای صحنه‌ای",
  productionNumber: 3,
  tagline: "هیچ چیز از حالت معمولش خارج نمیشه.",
  intro: "روایتی از خشم تاریکی",
  genre: "درام",
  durationMinutes: 75,
  language: "فارسی",
  ageRating: "مناسب برای 14 سال و بالاتر",
  about: {
    paragraphs: [
      "«مصائب روزگار از دست رفته» کشمکش عشق و مبارزه جایی که شهاب و مریم راویان بی عدالتی جهان می شوند .",
    ],
    highlights: [
      "«ما آنچه را که نمی‌گوییم، هر شب روی پرده می‌نویسیم.»",
      "«تاریکی، صادق‌ترین نورِ صحنه است.»",
    ],
  },

  venue: {
    name: "سالن فجر",
    // Placeholder — replace with the real venue address.
    address: "شیراز، خیابان دانشجو، دانشگاه شیراز، سالن فجر",
  },

  contact: {
    // Placeholders — replace with real contact channels before publishing.
    phone: "۰۹۳۳۸۴۸۴۷۹۶",
    email: "info@example.ir",
    instagram: "https://instagram.com/",
    website: "https://example.ir",
  },

  closingLine: "تئاتر، آنجا آغاز می‌شود که کلام تمام می‌شود.",
} as const;

export type TheaterConfig = typeof theater;
