import { redirect } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

export default async function ListingEditRedirectPage({ params }: Props) {
  const { id } = await params;
  redirect(`/vehicles/${id}/edit`);
}
