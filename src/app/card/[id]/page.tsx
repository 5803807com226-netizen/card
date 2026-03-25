import CardDetailPage from '@/components/card-detail/CardDetailPage';

export const metadata = {
  title: 'รายละเอียดการ์ด | CardQuant TH',
};

export default function Page({ params }: { params: { id: string } }) {
  return <CardDetailPage id={params.id} />;
}
