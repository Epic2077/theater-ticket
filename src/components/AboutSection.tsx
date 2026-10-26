import { theater } from "../config/theater";
import { toPersianDigits } from "../utils/format";
import { ArtImage } from "./ArtImage";
import { Reveal } from "./Reveal";

const dropCap =
  "first-letter:float-start first-letter:me-[0.35em] first-letter:pt-[0.08em] first-letter:font-display first-letter:text-[2.6em] first-letter:font-black first-letter:leading-none first-letter:text-accent";

const aboutFacts = [
  { label: "ژانر", value: theater.genre },
  { label: "مدت", value: `${toPersianDigits(theater.durationMinutes)} دقیقه` },
  { label: "زبان", value: theater.language },
  { label: "ردهٔ سنی", value: theater.ageRating },
];

export function AboutSection() {
  return (
    <section
      id="about"
      className="section border-t border-line bg-[linear-gradient(var(--color-bg),var(--color-surface)_140%)] print:hidden "
      aria-labelledby="about-title"
    >
      <div className="container">
        <div className="grid grid-cols-1 items-center gap-[clamp(2.5rem,6vw,5rem)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div>
            <Reveal>
              <p className="section-kicker">دربارهٔ نمایش</p>
              <h2 id="about-title" className="section-title">
                {theater.productionTitle}
              </h2>
            </Reveal>
            <Reveal>
              {theater.about.paragraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className={`mb-[1.4rem] max-w-[58ch] text-[1.02rem] text-ink-muted ${
                    i === 0 ? dropCap : ""
                  }`}
                >
                  {paragraph}
                </p>
              ))}
              <blockquote className="m-0 mt-[2.2rem] border-s-2 border-accent ps-[1.4rem] font-display text-[clamp(1.2rem,2.4vw,1.6rem)] font-bold leading-[1.8]">
                {theater.about.highlights[0]}
              </blockquote>
            </Reveal>
          </div>

          <div>
            <Reveal delay={120}>
              <ArtImage
                src="/images/stage.jpg"
                alt={`صحنهٔ نمایش ${theater.productionTitle}`}
                fallbackLabel="صحنه"
                className="aspect-[4/3] w-full border border-line object-cover"
              />
              <dl className="m-0 mt-8 border-t border-line">
                {aboutFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="flex justify-between gap-4 border-b border-line py-[0.85rem] text-[0.92rem]"
                  >
                    <dt className="text-ink-muted">{fact.label}</dt>
                    <dd className="m-0 text-end">{fact.value}</dd>
                  </div>
                ))}
              </dl>
              <blockquote className="m-0 mt-[2.2rem] border-s-2 border-gold ps-[1.4rem] font-display text-[clamp(1rem,2vw,1.25rem)] font-bold leading-[1.8] text-ink-muted">
                {theater.about.highlights[1]}
              </blockquote>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
