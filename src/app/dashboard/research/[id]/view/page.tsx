import StudyView from '@/features/research/components/study-view';

export const metadata = { title: 'View study | Clinical research' };

export default async function ViewStudyPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudyView studyId={id} />;
}
