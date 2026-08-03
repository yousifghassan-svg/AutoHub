'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { VehicleListQuery, VehicleSearchQuery } from '@/features/vehicles/domain/types';
import { Skeleton } from '@/components/ui';
import { useNearViewport } from '../hooks/useNearViewport';
import { useHomeVehicleList, useHomeVehicleSearch } from '../hooks/useHomeSectionQuery';
import { HOME_EASE } from '../lib/motion';
import { HomeVehicleCard } from './HomeVehicleCard';

type ListProps = {
  mode: 'list';
  query: VehicleListQuery;
};

type SearchProps = {
  mode: 'search';
  query: VehicleSearchQuery;
  /** Extra gate (e.g. wait for catalog ids). Defaults true. */
  queryReady?: boolean;
};

type HomeVehicleSectionProps = {
  id: string;
  title: string;
  subtitle: string;
  viewAllHref: string;
  /** Load immediately (Featured). Others wait until near viewport. */
  eager?: boolean;
} & (ListProps | SearchProps);

export function HomeVehicleSection(props: HomeVehicleSectionProps) {
  const { id, title, subtitle, viewAllHref, eager = false } = props;
  const { ref, near } = useNearViewport();
  const enabled =
    (eager || near) && (props.mode === 'list' || props.queryReady !== false);

  const listQuery = useHomeVehicleList(
    props.mode === 'list' ? props.query : { pageSize: 6 },
    props.mode === 'list' && enabled,
  );
  const searchQuery = useHomeVehicleSearch(
    props.mode === 'search' ? props.query : { pageSize: 6 },
    props.mode === 'search' && enabled,
  );

  const query = props.mode === 'list' ? listQuery : searchQuery;
  const reduceMotion = useReducedMotion();
  const items = query.data?.items ?? [];

  if (!query.isLoading && enabled && items.length === 0) {
    return null;
  }

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-20 py-16 md:py-24"
    >
      <div className="page-container">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
          <div className="max-w-xl">
            <h2
              id={`${id}-heading`}
              className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl"
            >
              {title}
            </h2>
            <p className="mt-2 text-sm text-ink-secondary md:text-base">{subtitle}</p>
          </div>
          <Link
            href={viewAllHref}
            className="text-sm font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            View all
          </Link>
        </div>

        {query.isLoading || !enabled ? (
          <div className="flex gap-4 overflow-hidden md:grid md:grid-cols-3 md:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/2] min-w-[78vw] md:min-w-0" />
            ))}
          </div>
        ) : (
          <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
            {items.slice(0, 6).map((listing, i) => (
              <motion.li
                key={listing.id}
                className="w-[78vw] shrink-0 snap-start sm:w-[58vw] md:w-auto"
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  delay: reduceMotion ? 0 : Math.min(i, 2) * 0.04,
                  duration: 0.35,
                  ease: HOME_EASE,
                }}
              >
                <HomeVehicleCard listing={listing} priority={eager && i === 0} />
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
