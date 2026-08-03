'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { HOME_EASE } from '../lib/motion';

const DOORS = [
  {
    href: '/vehicles',
    label: 'Vehicles',
    image:
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    href: '/plates',
    label: 'Plates',
    image:
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=80',
  },
] as const;

export function HomeDoorways() {
  const reduceMotion = useReducedMotion();

  return (
    <section aria-label="Marketplaces" className="page-container pb-16 md:pb-24">
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        {DOORS.map((door) => (
          <motion.div
            key={door.href}
            whileHover={reduceMotion ? undefined : { scale: 1.01 }}
            transition={{ duration: 0.3, ease: HOME_EASE }}
          >
            <Link
              href={door.href}
              className="group relative block aspect-[16/9] overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Image
                src={door.image}
                alt=""
                fill
                className={
                  reduceMotion
                    ? 'object-cover'
                    : 'object-cover transition duration-700 group-hover:brightness-110'
                }
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"
                aria-hidden
              />
              <p className="absolute bottom-5 start-5 font-display text-2xl font-semibold text-white md:text-3xl">
                {door.label}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
