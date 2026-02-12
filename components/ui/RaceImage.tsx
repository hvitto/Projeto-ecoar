'use client'

import { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { RaceImageHeroConfig } from '@/data/races'

type RaceImageVariant = 'card' | 'hero'

interface RaceImageProps {
  variant: RaceImageVariant
  src: string
  alt: string
  delay?: number
  className?: string
  heroConfig?: RaceImageHeroConfig
}

const heroDefaults: Required<Omit<RaceImageHeroConfig, 'style'>> & { style: Required<NonNullable<RaceImageHeroConfig['style']>> } = {
  width: 380,
  height: 900,
  offsetLeft: '-9%',
  offsetTop: '0',
  translateX: '-60%',
  translateY: '0',
  zIndex: 0,
  style: {
    width: '20rem',
    height: '26rem',
    maxWidth: '560px',
  },
}

export default function RaceImage({
  variant,
  src,
  alt,
  delay = 0,
  className = '',
  heroConfig,
}: RaceImageProps) {
  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-300 overflow-hidden ${className}`}
      >
        <Image
          src={src}
          alt={alt}
          width={40}
          height={40}
          className="w-10 h-10 object-cover"
          sizes="40px"
        />
      </motion.div>
    )
  }

  const mergedConfig: Required<Omit<RaceImageHeroConfig, 'style'>> & { style: Required<NonNullable<RaceImageHeroConfig['style']>> } = {
    ...heroDefaults,
    ...heroConfig,
    style: {
      ...heroDefaults.style,
      ...(heroConfig?.style ?? {}),
    },
  }

  const wrapperStyle: CSSProperties = {
    left: mergedConfig.offsetLeft,
    top: mergedConfig.offsetTop,
    zIndex: mergedConfig.zIndex,
    transform: `translate(${mergedConfig.translateX}, ${mergedConfig.translateY})`,
    overflowX: 'hidden',
    overflowY: 'visible',
  }

  const imageStyle: CSSProperties = {
    width: mergedConfig.style.width,
    height: mergedConfig.style.height,
    maxWidth: mergedConfig.style.maxWidth,
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay,
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={`pointer-events-none absolute ${className}`}
      style={wrapperStyle}
    >
      <Image
        src={src}
        alt={alt}
        width={mergedConfig.width ?? heroDefaults.width}
        height={mergedConfig.height ?? heroDefaults.height}
        className="object-contain"
        style={imageStyle}
        priority
      />
    </motion.div>
  )
}

