import type { Variants } from 'framer-motion'

const easeOut = [0.25, 0.1, 0.25, 1] as const
const easeOutExpo = [0.16, 1, 0.3, 1] as const
const durationFast = 0.2
const durationNormal = 0.35
const durationSmooth = 0.4
const durationSlow = 0.5

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durationSmooth, ease: easeOutExpo },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durationNormal, ease: easeOut },
  },
}

export const fadeInUpSlow: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durationSlow, ease: easeOutExpo },
  },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durationNormal, ease: easeOut },
  },
}

export const staggerItemFast: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durationFast, ease: easeOut },
  },
}

/** Transição de entrada/saída para troca de view (login → dashboard, etc.) */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: durationSmooth, ease: easeOutExpo },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: durationFast, ease: easeOut },
  },
}

/** Valores para usar em transition do Framer Motion */
export const motionTransition = {
  fast: { duration: durationFast, ease: easeOut },
  normal: { duration: durationNormal, ease: easeOut },
  smooth: { duration: durationSmooth, ease: easeOutExpo },
  slow: { duration: durationSlow, ease: easeOutExpo },
} as const
