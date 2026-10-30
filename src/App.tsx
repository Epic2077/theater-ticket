import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { GallerySection } from './components/GallerySection';
import { CastSection } from './components/CastSection';
import { BookingSection } from './components/BookingSection';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';
import { AdminDashboard } from './pages/AdminDashboard';
import { PaymentCallback } from './pages/PaymentCallback';

/** Tiny hash router: "#/admin" shows the admin dashboard, anything else the site. */
function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHashRoute();
  if (hash.startsWith('#/admin')) return <AdminDashboard />;
  if (hash.startsWith('#/payment/callback')) return <PaymentCallback />;

  return (
    <>
      <a
        href="#booking"
        className="fixed left-1/2 top-3 z-[3000] -translate-x-1/2 -translate-y-[300%] bg-accent px-[1.2rem] py-[0.6rem] text-[0.85rem] text-ink transition-transform duration-[250ms] ease-theater focus-visible:translate-y-0 print:hidden"
      >
        پرش به رزرو بلیت
      </a>
      <CustomCursor />
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <GallerySection />
        <CastSection />
        <BookingSection />
      </main>
      <Footer />
    </>
  );
}
