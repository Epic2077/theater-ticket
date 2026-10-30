import { theater } from "../config/theater";
import { toPersianDigits } from "../utils/format";

const footerLinks = [
  { href: "#about", label: "دربارهٔ نمایش" },
  { href: "#gallery", label: "تصاویر" },
  { href: "#cast", label: "عوامل" },
  { href: "#booking", label: "رزرو بلیت" },
];

export function Footer() {
  const year = toPersianDigits(new Date().getFullYear());
  const brandMark =
    theater.brandMark || theater.productionTitle.trim().charAt(0);

  return (
    <footer className="border-t border-line bg-surface print:hidden">
      <div className="container">
        <div className="grid grid-cols-1 gap-10 py-[clamp(3rem,7vw,5rem)] md:grid-cols-[minmax(0,5fr)_minmax(0,3fr)_minmax(0,4fr)]">
          <div>
            <a href="#top" className="inline-flex items-center gap-[0.7rem]">
              <span
                className="inline-grid size-[2.3rem] place-items-center border border-gold font-display text-[0.95rem] font-bold text-gold"
                aria-hidden="true"
              >
                {brandMark}
              </span>
              <span className="font-display text-lg font-bold">
                {theater.productionTitle}
              </span>
            </a>
            <p className="mt-4 max-w-[40ch] text-[0.92rem] text-ink-muted">
              {theater.intro}
            </p>
          </div>

          <nav aria-label="پیوندهای سایت">
            <h3 className="mb-4 text-[0.8rem] tracking-[0.25em] text-gold">
              دسترسی سریع
            </h3>
            <ul className="m-0 list-none p-0">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block py-[0.35rem] text-[0.92rem] text-ink-muted transition-[color,padding] duration-[250ms] ease-theater hover:ps-2 hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="mb-4 text-[0.8rem] tracking-[0.25em] text-gold">
              تماس و نشانی
            </h3>
            <ul className="m-0 list-none space-y-[0.6rem] p-0 text-[0.92rem] text-ink-muted">
              <li>
                {theater.venue.name} — {theater.venue.address}
              </li>
              <li>
                <a
                  href={`tel:${theater.contact.phone}`}
                  className="text-ink-muted transition-colors duration-[250ms] hover:text-gold"
                >
                  {theater.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${theater.contact.email}`}
                  className="text-ink-muted transition-colors duration-[250ms] hover:text-gold"
                >
                  {theater.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={theater.contact.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-muted transition-colors duration-[250ms] hover:text-gold"
                >
                  اینستاگرام
                </a>
                {" · "}
                <a
                  href={theater.contact.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-muted transition-colors duration-[250ms] hover:text-gold"
                >
                  وب‌سایت
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 border-t border-line py-[1.8rem] text-center">
          <p className="m-0 font-display text-[1.05rem] text-ink-muted">
            {theater.closingLine}
          </p>
          <p className="m-0 text-[0.78rem] text-ink-muted">
            © {year} {theater.groupName} — تمامی حقوق محفوظ است.
          </p>
          <a
            href="#/admin"
            className="text-[0.78rem] text-ink-muted transition-colors duration-[250ms] hover:text-gold"
          >
            ورود مدیر
          </a>
        </div>
      </div>
    </footer>
  );
}
