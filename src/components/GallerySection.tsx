import { useCallback, useEffect, useState } from 'react';
import { ArtImage } from './ArtImage';
import { Reveal } from './Reveal';

interface GalleryItem {
  src: string;
  alt: string;
  label: string;
  className: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    src: '/images/gallery-1.jpg',
    alt: 'صحنهٔ مونولوگ سکوت',
    label: 'صحنهٔ نخست',
    className: 'col-span-1 row-span-2 lg:col-span-5 lg:row-span-4',
  },
  {
    src: '/images/gallery-2.jpg',
    alt: 'نورپردازی پردهٔ قرمز',
    label: 'پردهٔ قرمز',
    className: 'col-span-2 row-span-2 lg:col-span-7 lg:row-span-3 lg:mt-10',
  },
  {
    src: '/images/gallery-3.jpg',
    alt: 'تمرین گروه در سالن',
    label: 'تمرین',
    className: 'col-span-1 row-span-2 lg:col-span-4 lg:row-span-3',
  },
  {
    src: '/images/gallery-4.jpg',
    alt: 'پشت صحنه، دقایق پیش از آغاز',
    label: 'پشت صحنه',
    className: 'col-span-1 row-span-2 lg:col-span-3 lg:row-span-4 lg:-mt-6',
  },
];

export function GallerySection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  const step = useCallback((dir: 1 | -1) => {
    setOpenIndex((current) =>
      current === null
        ? current
        : (current + dir + GALLERY_ITEMS.length) % GALLERY_ITEMS.length,
    );
  }, []);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(1);
      if (e.key === 'ArrowRight') step(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [openIndex, close, step]);

  const current = openIndex === null ? null : GALLERY_ITEMS[openIndex];

  return (
    <section
      id="gallery"
      className="section print:hidden"
      aria-labelledby="gallery-title"
    >
      <div className="container">
        <Reveal>
          <p className="section-kicker">تصاویر</p>
          <h2 id="gallery-title" className="section-title">
            قاب‌هایی از صحنه
          </h2>
          <p className="section-lead">
            گزیده‌ای از ثبت‌های صحنه، تمرین و پشت صحنه؛ برای دیدن اندازهٔ
            کامل روی هر قاب بزنید.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 auto-rows-[7.5rem] gap-[clamp(0.7rem,1.6vw,1.2rem)] sm:auto-rows-[9rem] lg:grid-cols-12 lg:auto-rows-[5.5rem]">
          {GALLERY_ITEMS.map((item, i) => (
            <Reveal key={item.src} delay={i * 90} className={item.className}>
              <button
                type="button"
                className="group relative block h-full w-full cursor-pointer overflow-hidden border border-line bg-surface p-0"
                onClick={() => setOpenIndex(i)}
                aria-label={`بزرگ‌نمایی تصویر: ${item.alt}`}
              >
                <ArtImage
                  src={item.src}
                  alt={item.alt}
                  className="h-full w-full object-cover grayscale-[0.35] contrast-105 transition-[transform,filter] duration-[800ms] ease-theater group-focus-visible:scale-[1.045] group-focus-visible:grayscale-0 group-hover:scale-[1.045] group-hover:grayscale-0"
                />
                <span className="absolute bottom-0 start-0 translate-y-[6px] bg-bg/70 px-[0.9rem] py-[0.45rem] text-[0.75rem] tracking-[0.18em] text-ink opacity-0 transition-[opacity,transform] duration-[350ms] ease-theater group-focus-visible:translate-y-0 group-focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
                  {item.label}
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {current && (
        <div
          className="fixed inset-0 z-[1500] grid place-items-center p-5"
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
        >
          <div
            className="absolute inset-0 bg-[#080808]/90 backdrop-blur-[6px] animate-fade-in"
            onClick={close}
          />
          <figure className="relative m-0 w-full max-w-[min(64rem,100%)] animate-lightbox-in">
            <ArtImage
              src={current.src}
              alt={current.alt}
              fallbackClassName="aspect-[4/3] w-[min(38rem,90vw)]"
              className="mx-auto max-h-[76vh] w-auto max-w-full border border-line-strong object-contain"
            />
            <figcaption className="flex justify-between gap-4 pt-[0.9rem] text-[0.9rem] text-ink-muted">
              <span>{current.alt}</span>
              <span>
                {(openIndex ?? 0) + 1} / {GALLERY_ITEMS.length}
              </span>
            </figcaption>
            <div className="absolute end-4 top-4 z-[2] flex gap-2">
              <button
                type="button"
                className="grid size-[46px] cursor-pointer place-items-center border border-line-strong bg-surface/85 text-[1.05rem] text-ink transition-[border-color,color] duration-[250ms] hover:border-gold hover:text-gold"
                onClick={() => step(1)}
                aria-label="تصویر بعدی"
              >
                ›
              </button>
              <button
                type="button"
                className="grid size-[46px] cursor-pointer place-items-center border border-line-strong bg-surface/85 text-[1.05rem] text-ink transition-[border-color,color] duration-[250ms] hover:border-gold hover:text-gold"
                onClick={() => step(-1)}
                aria-label="تصویر قبلی"
              >
                ‹
              </button>
              <button
                type="button"
                className="grid size-[46px] cursor-pointer place-items-center border border-line-strong bg-surface/85 text-[1.05rem] text-ink transition-[border-color,color] duration-[250ms] hover:border-gold hover:text-gold"
                onClick={close}
                aria-label="بستن"
              >
                ✕
              </button>
            </div>
          </figure>
        </div>
      )}
    </section>
  );
}

