'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Badge, cn } from '@/components/ui';
import type { LabVehicle } from './lab-data';

type Size = 'default' | 'large' | 'compact';

/**
 * Prototype vehicle card — Apple / Tesla / Rivian inspired.
 * Isolated from production ListingCard; design-lab only.
 */
export function PremiumVehicleCard({
  vehicle,
  size = 'default',
  className,
}: {
  vehicle: LabVehicle;
  size?: Size;
  className?: string;
}) {
  const aspect =
    size === 'large' ? 'aspect-[16/10]' : size === 'compact' ? 'aspect-[4/3]' : 'aspect-[3/2]';

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'group overflow-hidden rounded-2xl bg-surface ring-1 ring-border',
        className,
      )}
    >
      <div className={cn('relative overflow-hidden bg-surface-muted', aspect)}>
        <Image
          src={vehicle.image}
          alt={vehicle.title}
          fill
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 400px"
          unoptimized
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
        <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
          {vehicle.featured ? <Badge tone="brand">Featured</Badge> : null}
          {vehicle.verified ? (
            <span className="inline-flex rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-ink backdrop-blur-sm">
              Verified
            </span>
          ) : null}
        </div>
        <p className="absolute bottom-3 start-3 end-3 font-display text-lg font-semibold tracking-tight text-white drop-shadow-sm sm:text-xl">
          {vehicle.price}{' '}
          <span className="text-sm font-medium text-white/80">{vehicle.currency}</span>
        </p>
      </div>
      <div className="space-y-2 p-4 sm:p-5">
        <h3 className="font-display text-base font-semibold tracking-tight text-ink sm:text-lg">
          {vehicle.title}
        </h3>
        <p className="text-sm text-ink-secondary">
          {vehicle.year} · {vehicle.mileage} · {vehicle.city}
        </p>
        {vehicle.dealer ? (
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
            {vehicle.dealer}
          </p>
        ) : null}
      </div>
    </motion.article>
  );
}
