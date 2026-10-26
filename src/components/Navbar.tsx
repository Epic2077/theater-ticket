import { useEffect, useState } from "react";
import { theater } from "../config/theater";

const NAV_LINKS = [
  { href: "#about", label: "دربارهٔ نمایش" },
  { href: "#gallery", label: "تصاویر" },
  { href: "#cast", label: "عوامل" },
  { href: "#booking", label: "رزرو بلیت" },
];

const linkUnderline =
  "relative py-[0.3rem]  transition-colors duration-300 ease-theater hover:text-ink after:absolute after:bottom-0 after:start-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-[350ms] after:ease-theater after:content-[''] hover:after:origin-right hover:after:scale-x-100";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const brandMark =
    theater.brandMark || theater.productionTitle.trim().charAt(0);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[1000] border-b px-[clamp(1.5rem,6vw,6rem)] transition-[background-color,border-color,padding] duration-[400ms] ease-theater print:hidden ${
        scrolled || menuOpen
          ? "border-line bg-bg/85 py-[0.55rem] backdrop-blur-md"
          : "border-transparent py-[0.9rem]"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between gap-4">
          <a
            href="#top"
            className="inline-flex min-w-0 items-center gap-[0.7rem]"
            onClick={closeMenu}
          >
            <span
              className="inline-grid size-[2.3rem] shrink-0 place-items-center border border-gold font-display text-[0.95rem] font-bold tracking-[-0.05em] text-gold"
              aria-hidden="true"
            >
              {brandMark}
            </span>
            <span className="truncate font-display text-base font-bold">
              {theater.productionTitle}
            </span>
          </a>

          <nav
            className="hidden gap-8 text-[0.92rem] text-ink-muted lg:flex"
            aria-label="ناوبری اصلی"
          >
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className={linkUnderline}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="#booking" className="btn btn-primary btn-sm hidden sm:inline-flex">
              رزرو بلیت
            </a>
            <button
              type="button"
              className="group flex size-11 cursor-pointer flex-col justify-center gap-[6px] border border-line-strong bg-transparent lg:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="mx-auto block h-[1.5px] w-[18px] bg-ink transition-transform duration-300 ease-theater group-aria-expanded:translate-y-[3.75px] group-aria-expanded:rotate-45" />
              <span className="mx-auto block h-[1.5px] w-[18px] bg-ink transition-transform duration-300 ease-theater group-aria-expanded:-translate-y-[3.75px] group-aria-expanded:-rotate-45" />
            </button>
          </div>
        </div>
      </div>

      <div
        className="fixed inset-x-0 top-full border-b border-line bg-bg/95 px-5 pb-9 pt-6 animate-menu-in"
        hidden={!menuOpen}
      >
        <nav className="flex flex-col gap-[0.4rem]" aria-label="منوی موبایل">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="border-b border-line px-2 py-[0.9rem] font-display text-[1.35rem] transition-[color,padding] duration-[250ms] ease-theater hover:ps-4 hover:text-gold"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
