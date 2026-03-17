import CreateForm from '@/components/CreateForm';

export default async function CreatePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  
  return (
    <main className="main-container">
      <CreateForm type={type} />
    </main>
  );
}
