export const GSAP_CONFIG = {
  duration: {
    fast: 0.3,
    base: 0.5,
    slow: 0.8,
    verySlow: 1.2,
    intro: 1.5,
  },
  ease: {
    standard: 'power2.out',
    smooth: 'power3.out',
    bouncy: 'back.out(1.7)',
    elegant: 'power2.inOut',
  },
  stagger: {
    small: 0.1,
    medium: 0.2,
    large: 0.3,
  }
};

export const fadeInUp = {
  y: 30,
  opacity: 0,
  duration: GSAP_CONFIG.duration.slow,
  ease: GSAP_CONFIG.ease.smooth,
};

export const fadeIn = {
  opacity: 0,
  duration: GSAP_CONFIG.duration.slow,
  ease: GSAP_CONFIG.ease.smooth,
};
