/** Prototype-only mock data. Never imported by production marketplace routes. */

export const LAB_PHOTOS = {
  hero: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=2000&q=80',
  sedan: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80',
  suv: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
  coupe: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  night: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80',
  dealer: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1600&q=80',
  showroom: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=80',
} as const;

export type LabVehicle = {
  id: string;
  title: string;
  price: string;
  currency: string;
  year: string;
  mileage: string;
  city: string;
  image: string;
  featured?: boolean;
  verified?: boolean;
  dealer?: string;
};

export const LAB_VEHICLES: LabVehicle[] = [
  {
    id: '1',
    title: '2021 Toyota Camry SE',
    price: '18,500,000',
    currency: 'IQD',
    year: '2021',
    mileage: '45,000 km',
    city: 'Baghdad',
    image: LAB_PHOTOS.sedan,
    featured: true,
    verified: true,
    dealer: 'Al-Noor Motors',
  },
  {
    id: '2',
    title: '2020 Lexus RX 350',
    price: '42,000,000',
    currency: 'IQD',
    year: '2020',
    mileage: '38,000 km',
    city: 'Erbil',
    image: LAB_PHOTOS.suv,
    verified: true,
    dealer: 'Kurdistan Auto',
  },
  {
    id: '3',
    title: '2019 Porsche 911 Carrera',
    price: '95,000',
    currency: 'USD',
    year: '2019',
    mileage: '22,000 km',
    city: 'Basra',
    image: LAB_PHOTOS.coupe,
    featured: true,
    dealer: 'Gulf Prestige',
  },
];

export const LAB_NAV = [
  { href: '/design-lab', label: 'Lab Home' },
  { href: '/design-lab/homepage', label: 'Homepage' },
  { href: '/design-lab/cards', label: 'Vehicle Card' },
  { href: '/design-lab/search', label: 'Search' },
  { href: '/design-lab/sell', label: 'Sell Wizard' },
  { href: '/design-lab/vehicle', label: 'Vehicle Details' },
  { href: '/design-lab/my-listings', label: 'My Listings' },
  { href: '/design-lab/dealer', label: 'Dealer' },
  { href: '/design-lab/motion', label: 'Motion' },
  { href: '/design-lab/dark', label: 'Dark Theme' },
  { href: '/design-lab/components', label: 'Components' },
] as const;
