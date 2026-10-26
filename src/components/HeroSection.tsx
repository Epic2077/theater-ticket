import { theater } from "../config/theater";
import { toPersianDigits } from "../utils/format";
import { ArtImage } from "./ArtImage";
import { Reveal } from "./Reveal";

const heroFacts = [
  { label: "ژانر", value: theater.genre },
  { label: "مدت", value: `${toPersianDigits(theater.durationMinutes)} دقیقه` },
  { label: "زبان", value: theater.language },
  { label: "ردهٔ سنی", value: theater.ageRating },
];

export function HeroSection() {
  return (
    <section
      id="top"
      className="relative flex items-center overflow-hidden bg-[radial-gradient(58%_45%_at_82%_12%,rgba(169,45,56,0.14),transparent_70%),radial-gradient(40%_35%_at_8%_90%,rgba(194,164,109,0.07),transparent_70%),var(--color-bg)] pb-16 pt-[clamp(7rem,12vh,9rem)] print:hidden lg:min-h-svh"
    >
      <div className="container">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-[clamp(2rem,6vw,5rem)]">
          <div>
            <Reveal>
              <p className="mb-[1.4rem] flex items-center gap-[0.9rem] text-[0.82rem] tracking-[0.25em] text-gold">
                <span className="h-px w-12 bg-gold" aria-hidden="true" />
                {theater.groupName}
              </p>
            </Reveal>
            <Reveal delay={90}>
              <h1 className="relative z-[2] text-[clamp(3.2rem,11vw,4rem)] font-black leading-[1.12] tracking-[-0.01em]">
                {theater.productionTitle}
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-[1.2rem] font-display text-[clamp(1.15rem,2.6vw,1.7rem)] text-ink-muted">
                {theater.tagline}
              </p>
            </Reveal>
            <Reveal delay={260}>
              <p className="mt-[1.1rem] max-w-[44ch] text-[0.98rem] text-ink-muted">
                {theater.intro}
              </p>
            </Reveal>
            <Reveal delay={340}>
              <dl className="m-0 mt-8 flex flex-wrap gap-x-8 gap-y-[1.2rem] border-t border-line pt-[1.4rem] lg:gap-[2.2rem]">
                {heroFacts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="mb-1 text-[0.75rem] tracking-[0.2em] text-ink-muted">
                      {fact.label}
                    </dt>
                    <dd className="m-0 text-[0.95rem] font-medium">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={420}>
              <div className="mt-[2.2rem] flex flex-wrap gap-[0.9rem]">
                <a href="#booking" className="btn btn-primary btn-lg">
                  رزرو بلیت
                </a>
                <a href="#about" className="btn btn-ghost btn-lg">
                  دربارهٔ نمایش
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal className="relative z-1 " delay={200}>
            <figure className="relative my-0 mx-auto max-w-104 lg:mx-0 lg:ms-[clamp(-2rem,-5vw,-2rem)] lg:max-w-none">
              <ArtImage
                src="/images/poster.jpg"
                alt={`پوستر نمایش ${theater.productionTitle}`}
                fallbackLabel={theater.productionTitle}
                eager
                className="aspect-10/10 w-full border border-line object-cover shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9),0_0_0_1px_rgba(0,0,0,0.4)]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-[1.6rem] -end-[0.6rem] z-[2] font-display text-[clamp(3rem,7vw,5.5rem)] font-black text-transparent [-webkit-text-stroke:1px_rgba(194,164,109,0.5)] lg:-top-[2.2rem] lg:-end-[1.2rem]"
              >
                {toPersianDigits(theater.productionNumber)}
              </span>
              <figcaption className="mt-[0.8rem] block border-t border-line pt-[0.8rem] text-[0.78rem] tracking-[0.12em] text-ink-muted">
                {theater.productionType}
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-[1.6rem] left-1/2 -translate-x-1/2"
      >
        <span className="block h-[3.2rem] w-px bg-gradient-to-b from-gold to-transparent animate-hint-drop" />
      </div>
    </section>
  );
}
