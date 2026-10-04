import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }) {
  const location = useLocation();

  useEffect(() => {
    // Instantiate Lenis with heavy, weighted cinematic inertia and smooth luxury damping
    const lenis = new Lenis({
      lerp: 0.045, // Lower lerp factor = heavy, high-mass cinematic glide
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.85, // Heavy resistance with deliberate, weighted response
      touchMultiplier: 1.0,
      infinite: false,
      autoResize: true,
    });

    window.__lenis = lenis;

    // Connect Lenis scroll events to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Synchronize GSAP ticker with Lenis requestAnimationFrame
    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  // Smoothly reset scroll on route transition & stop on fixed 3D app routes
  useEffect(() => {
    if (window.__lenis) {
      if (location.pathname === "/brain") {
        window.__lenis.stop();
      } else {
        window.__lenis.start();
        window.__lenis.scrollTo(0, { immediate: true });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return children || null;
}
