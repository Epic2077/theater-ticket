import { cast } from "../data/cast";
import { ArtImage } from "./ArtImage";
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
              key={member.id}
              delay={i * 60}
              className="group list-none border-b border-line first:border-t"
            >
              <div className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-[0.2rem] py-[1.35rem] transition-colors duration-[350ms] ease-theater group-hover:bg-ink/[0.025] sm:grid-cols-[minmax(7rem,10rem)_1fr_auto] sm:gap-6">
                <span className="col-start-1 row-start-1 text-[0.78rem] tracking-[0.22em] text-gold sm:col-start-auto sm:row-start-auto">
                  {member.role}
                </span>
                <span className="col-start-1 row-start-2 font-display text-[clamp(1.3rem,3.2vw,2.1rem)] font-bold transition-colors duration-[350ms] ease-theater group-hover:text-gold sm:col-start-auto sm:row-start-auto">
                  {member.name}
                </span>
                <span className="col-start-2 row-span-2 self-center sm:col-start-auto sm:row-auto">
                  {member.image ? (
                    <ArtImage
                      src={member.image}
                      alt={`پرترهٔ ${member.name}`}
                      compact
                      className="size-[4.2rem] border border-line-strong object-cover grayscale-[0.5] transition-[filter,transform] duration-[400ms] ease-theater group-hover:-rotate-2 group-hover:scale-[1.08] group-hover:grayscale-0"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="block h-px w-[4.2rem] bg-line-strong"
                    />
                  )}
                </span>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
