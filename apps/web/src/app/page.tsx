import type { Metadata } from 'next';
import { HomePageView } from '@/features/home/HomePageView';

export const metadata: Metadata = {
  title: 'AutoHub — Iraq’s premium marketplace for cars & plates',
  description:
    'Find vehicles and license plates across Iraq. Search first. Cars are the hero.',
};

export default function HomePage() {
  return <HomePageView />;
}
