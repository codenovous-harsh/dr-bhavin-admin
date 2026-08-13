import StudyForm from '@/features/research/components/study-form';

export const metadata = { title: 'Edit study | Clinical research' };

export default async function EditStudyPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudyForm studyId={id} />;
}
