'use client';



import Link from 'next/link';

import { useMemo, useState } from 'react';

import { ListingCard } from '@/components/ListingCard';

import { Button, EmptyState, Input, SectionHeader, Select, Skeleton } from '@/components/ui';

import { formatPrice } from '@/features/listings/domain/mappers';

import type { ListingCardModel } from '@/features/listings/domain/types';

import { LicensePlate, licensePlateFromListing } from '@/features/plates';

import {
  GOVERNORATES,
  governorateFromFormatCode,
} from '@/features/plates/domain/governorates';
import type { IraqiGovernorate } from '@/features/plates/domain/types';

import { useMarketplaceSearchInfinite } from '@/features/search/hooks/useMarketplaceSearch';



function matchesPlateFilters(

  item: ListingCardModel,

  governorate: string,

  code: string,

  letter: string,

  number: string,

): boolean {

  const plate = licensePlateFromListing(item.plateDetails);

  if (!plate) return false;



  if (governorate) {

    const gov = governorateFromFormatCode(item.plateDetails?.formatCode);

    if (gov !== governorate) return false;

  }

  if (code && !plate.code.includes(code.trim())) return false;

  if (letter && !plate.letter.toUpperCase().includes(letter.trim().toUpperCase())) return false;

  if (number && !plate.number.includes(number.trim())) return false;

  return true;

}



export default function PlatesPage() {

  const [governorate, setGovernorate] = useState('');

  const [code, setCode] = useState('');

  const [letter, setLetter] = useState('');

  const [number, setNumber] = useState('');

  const [submitted, setSubmitted] = useState({ code: '', letter: '', number: '' });



  const q = useMemo(() => {

    const parts = [submitted.code, submitted.letter, submitted.number].filter(Boolean);

    return parts.join(' ').trim() || undefined;

  }, [submitted]);



  const search = useMarketplaceSearchInfinite(

    { categoryCode: 'PLATE', q, pageSize: 48, sort: 'NEWEST' },

    true,

  );



  const items = useMemo(() => {
    const raw = search.data?.pages.flatMap((p) => p.items) ?? [];
    return raw.filter((item) =>
      matchesPlateFilters(item, governorate, submitted.code, submitted.letter, submitted.number),
    );
  }, [search.data?.pages, governorate, submitted.code, submitted.letter, submitted.number]);



  const featured = items.slice(0, 4);

  const rest = items.slice(4);



  return (

    <div className="page-container space-y-10 py-10">

      <SectionHeader

        title="Iraqi license plates"

        subtitle="Browse plate listings with professional SVG previews by governorate."

        action={

          <Link href="/sell">

            <Button>Sell a plate</Button>

          </Link>

        }

      />



      <form

        className="grid gap-3 rounded-xl border border-border bg-surface p-4 shadow-card sm:grid-cols-2 lg:grid-cols-5"

        onSubmit={(e) => {

          e.preventDefault();

          setSubmitted({ code, letter, number });

        }}

      >

        <Select

          label="Governorate"

          value={governorate}

          onChange={(e) => setGovernorate(e.target.value)}

        >

          <option value="">All governorates</option>

          {(Object.keys(GOVERNORATES) as IraqiGovernorate[]).map((g) => (

            <option key={g} value={g}>

              {GOVERNORATES[g].nameEn}

            </option>

          ))}

        </Select>

        <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="11" />

        <Input

          label="Letter"

          value={letter}

          onChange={(e) => setLetter(e.target.value.toUpperCase())}

          placeholder="A"

          maxLength={3}

        />

        <Input

          label="Number"

          value={number}

          onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}

          placeholder="12345"

        />

        <div className="flex items-end">

          <Button type="submit" className="w-full">

            Search plates

          </Button>

        </div>

      </form>



      {search.isLoading ? (

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {Array.from({ length: 6 }).map((_, i) => (

            <Skeleton key={i} className="aspect-[700/220] w-full" />

          ))}

        </div>

      ) : search.isError ? (

        <EmptyState

          title="Could not load plates"

          description={search.error instanceof Error ? search.error.message : undefined}

        />

      ) : items.length === 0 ? (

        <EmptyState

          title="No plates found"

          description="Try different filters or broaden your search."

        />

      ) : (

        <>

          {featured.length > 0 ? (

            <div className="grid gap-4 lg:grid-cols-2">

              {featured.map((item) => {

                const plate = licensePlateFromListing(item.plateDetails);

                return (

                  <Link

                    key={item.id}

                    href={`/plates/${item.id}`}

                    className="rounded-2xl border border-border bg-surface p-5 shadow-card transition hover:shadow-lift"

                  >

                    {plate ? (

                      <LicensePlate {...plate} framed size="fill" className="w-full" />

                    ) : null}

                    <div className="mt-4 flex items-center justify-between gap-3">

                      <div>

                        <p className="font-semibold text-ink">{item.title}</p>

                        <p className="text-sm text-ink-secondary">{item.location}</p>

                      </div>

                      <p className="font-bold text-brand">

                        {formatPrice(item.price, item.currencyCode)}

                      </p>

                    </div>

                  </Link>

                );

              })}

            </div>

          ) : null}



          {rest.length > 0 ? (

            <div>

              <h2 className="mb-4 font-display text-xl font-semibold text-ink">All plate listings</h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {rest.map((item) => (

                  <ListingCard key={item.id} listing={item} href={`/plates/${item.id}`} />

                ))}

              </div>

            </div>

          ) : null}



          {search.hasNextPage ? (

            <div className="text-center">

              <Button

                variant="secondary"

                disabled={search.isFetchingNextPage}

                onClick={() => void search.fetchNextPage()}

              >

                {search.isFetchingNextPage ? 'Loading…' : 'Load more'}

              </Button>

            </div>

          ) : null}

        </>

      )}

    </div>

  );

}

