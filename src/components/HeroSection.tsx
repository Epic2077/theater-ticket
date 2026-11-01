import { theater } from "../config/theater";
import { toPersianDigits } from "../utils/format";
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
      className="relative flex items-center overflow-hidden bg-[radial-gradient(60%_45%_at_50%_0%,rgba(169,45,56,0.16),transparent_70%),radial-gradient(40%_35%_at_85%_90%,rgba(194,164,109,0.08),transparent_70%),var(--color-bg)] pb-16 pt-[clamp(7rem,12vh,9rem)] print:hidden lg:min-h-svh"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[clamp(14rem,34vw,30rem)] font-black leading-none text-transparent [-webkit-text-stroke:1px_rgba(194,164,109,0.14)]"
      >
        {toPersianDigits(theater.productionNumber)}
      </span>

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <p className="mb-[1.6rem] flex items-center justify-center gap-[1rem] text-[0.82rem] tracking-[0.3em] text-gold">
              <span className="h-px w-12 bg-gold" aria-hidden="true" />
              {theater.groupName}
              <span className="h-px w-12 bg-gold" aria-hidden="true" />
            </p>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="text-[clamp(3rem,9vw,4.6rem)] font-black leading-[1.08] tracking-[-0.01em]">
              {theater.productionTitle}
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-[1.3rem] font-display text-[clamp(1.15rem,2.6vw,1.7rem)] text-ink-muted">
              {theater.tagline}
            </p>
          </Reveal>
          <Reveal delay={260}>
            <p className="mx-auto mt-[1.1rem] max-w-[52ch] text-[0.98rem] text-ink-muted">
              {theater.intro}
            </p>
          </Reveal>
          <Reveal delay={340}>
            <dl className="mx-auto mt-9 flex max-w-2xl flex-wrap items-center justify-center gap-x-10 gap-y-[1.2rem] border-y border-line py-[1.3rem]">
              {heroFacts.map((fact) => (
                <div key={fact.label} className="text-center">
                  <dt className="mb-1 text-[0.72rem] tracking-[0.2em] text-ink-muted">
                    {fact.label}
                  </dt>
                  <dd className="m-0 text-[0.95rem] font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={420}>
            <div className="mt-[2.4rem] flex flex-wrap justify-center gap-[0.9rem]">
              <a href="#booking" className="btn btn-primary btn-lg">
                رزرو بلیت
              </a>
              <a href="#about" className="btn btn-ghost btn-lg">
                دربارهٔ نمایش
              </a>
            </div>
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
