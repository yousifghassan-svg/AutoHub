import Link from 'next/link';
import { Button } from '@/components/ui';

export function HomeSellBand() {
  return (
    <section
      aria-labelledby="home-sell-heading"
      className="bg-[#171B21] px-5 py-16 text-white md:px-8 md:py-20"
    >
      <div className="mx-auto max-w-2xl space-y-5 text-center">
        <h2
          id="home-sell-heading"
          className="font-display text-3xl font-semibold tracking-tight md:text-4xl"
        >
          List your vehicle
        </h2>
        <p className="text-base text-white/70 md:text-lg">
          A calm path from draft to showroom-ready listing.
        </p>
        <Link href="/sell" className="inline-block">
          <Button type="button" className="h-12 px-10">
            Start selling
          </Button>
        </Link>
      </div>
    </section>
  );
}
