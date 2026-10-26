import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

type RevealTag = 'div' | 'li' | 'figure' | 'section';

interface RevealProps {
  children: ReactNode;
  as?: RevealTag;
  delay?: number;
  className?: string;
}

/**
 * Fades/slides children in when they enter the viewport.
 * Entirely disabled (content always visible) for users who prefer
 * reduced motion — see the media query in index.css.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className = '',
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style: CSSProperties = delay ? { transitionDelay: `${delay}ms` } : {};

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      style={style}
      className={`transition-[opacity,transform] duration-[900ms] ease-theater will-change-[opacity,transform] motion-reduce:translate-y-0 motion-reduce:opacity-100 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[26px]'
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
