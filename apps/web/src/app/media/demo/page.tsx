'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { MediaUploader, VehicleGallery } from '@/features/media';
import type { GalleryItem } from '@/features/media';

const DEMO_GALLERY: GalleryItem[] = [
  {
    id: 'demo-1',
    url: 'https://picsum.photos/seed/autohub-gallery-1/1200/900',
    kind: 'IMAGE',
    blurDataUrl:
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAUABQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGfAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEABj8Cf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8hf//Z',
  },
  {
    id: 'demo-2',
    url: 'https://picsum.photos/seed/autohub-gallery-2/1200/900',
    kind: '360_MEDIA',
  },
  {
    id: 'demo-3',
    url: 'https://picsum.photos/seed/autohub-gallery-3/1200/900',
    kind: 'IMAGE',
  },
  {
    id: 'demo-4',
    url: 'https://picsum.photos/seed/autohub-gallery-4/1200/900',
    kind: 'IMAGE',
  },
];

export default function MediaDemoPage() {
  return (
    <div className="page-container space-y-12 py-10">
      <header className="space-y-2">
        <p className="text-sm font-medium text-brand">Sprint 17</p>
        <h1 className="font-display text-3xl font-bold text-ink">Media platform demo</h1>
        <p className="max-w-2xl text-ink-secondary">
          Acceptance surface for the multi-file uploader (presign → PUT → complete, with server
          upload fallback) and the vehicle gallery lightbox.
        </p>
        <Link href="/">
          <Button variant="ghost">Back home</Button>
        </Link>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-ink">Uploader</h2>
        <p className="text-sm text-ink-secondary">
          Sign in to upload against the live API. Drag to reorder; star sets primary.
        </p>
        <MediaUploader ownerModule="demo" />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-ink">Gallery</h2>
        <div className="max-w-2xl">
          <VehicleGallery items={DEMO_GALLERY} title="Demo vehicle" />
        </div>
      </section>
    </div>
  );
}
