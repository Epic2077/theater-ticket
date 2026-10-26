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
  intro: "روایتی از شهاب به زندگی انقلابی و چیریکی و مشکلات آن",
  genre: "درام",
  durationMinutes: 45,
  language: "فارسی",
  ageRating: "مناسب برای ۱۵ سال و بالاتر",

  about: {
    paragraphs: [
      "«پردهٔ خاموش» قصهٔ مردانی و زنانی است که در آپارتمانی قدیمی، سال‌هاست کنار هم زندگی می‌کنند اما هرگز یکدیگر را ندیده‌اند. شبِ قطعی برق، همه به راه‌پلهٔ مشترک خانه می‌آیند و در تاریکی، برای نخستین بار، حرف‌های نگفته رو می‌شوند.",
      "این اجرا میان تئاتر فیزیکال و درام کلاسیک حرکت می‌کند؛ بدن بازیگران، نورِ دست‌ساز و سکوتِ طولانی، ستون‌های روایت هستند. هر شب، بخشی از اجرا به‌صورت بداهه و با حضور تماشاگران شکل می‌گیرد و هیچ دو اجرایی شبیه هم نیستند.",
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
    phone: "۰۲۱-۶۶۴۰۰۰۰۰",
    email: "info@example.ir",
    instagram: "https://instagram.com/",
    website: "https://example.ir",
  },

  closingLine: "تئاتر، آنجا آغاز می‌شود که کلام تمام می‌شود.",
} as const;

export type TheaterConfig = typeof theater;
