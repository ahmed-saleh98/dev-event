import { Suspense } from 'react';
import EventDetails from '@/components/EventDetails';
import SkeletonEventDetails from '@/components/SkeleonEventDetails';

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const slug = params.then((p) => p.slug);

  return (
    <main>
      <Suspense fallback={<SkeletonEventDetails />}>
        <EventDetails params={slug} />
      </Suspense>
    </main>
  );
};
export default EventDetailsPage;
