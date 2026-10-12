import { fetchMateriale } from "@/app/lib/data";
import Form from "@/app/ui/esercizio/modifica-convoglio";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const materialeRotabile = await fetchMateriale();
  return (
    <div className="p-8">
      <Form id={id} materialeRotabile={materialeRotabile}/>
    </div>
  )
}
