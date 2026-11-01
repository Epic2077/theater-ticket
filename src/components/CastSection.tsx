import { cast } from "../data/cast";
import { Reveal } from "./Reveal";

export function CastSection() {
  return (
    <section
      id="cast"
      className="section border-y border-line bg-surface print:hidden"
      aria-labelledby="cast-title"
    >
      <div className="container">
        <Reveal>
          <p className="section-kicker">عوامل</p>
          <h2 id="cast-title" className="section-title">
            هنرمندان صحنه
          </h2>
        </Reveal>

        <ul className="m-0 list-none p-0">
          {cast.map((member, i) => (
            <Reveal
              as="li"
              key={`${member.id}-${i}`}
              delay={i * 50}
              className="group list-none border-b border-line first:border-t"
            >
              <div className="flex items-baseline justify-between gap-6 py-[1.35rem] transition-colors duration-[350ms] ease-theater group-hover:bg-ink/[0.025]">
                <div className="flex min-w-0 items-baseline gap-[1.1rem]">
                  <span
                    className="shrink-0 font-mono text-[0.78rem] text-ink-muted"
                    dir="ltr"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate font-display text-[clamp(1.3rem,3.2vw,2.1rem)] font-bold transition-colors duration-[350ms] ease-theater group-hover:text-gold">
                    {member.name}
                  </span>
                </div>
                <span className="shrink-0 text-[0.82rem] tracking-[0.18em] text-gold">
                  {member.role}
                </span>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
