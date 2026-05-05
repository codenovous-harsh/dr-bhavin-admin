import { PromptEditor } from '@/features/prompts/components/prompt-editor';

export default async function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PromptEditor id={id} />;
}
