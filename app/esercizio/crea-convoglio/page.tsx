import { fetchMateriale } from "@/app/lib/data";
import { MaterialeRotabile } from "@/app/lib/definitions";
import Form from "@/app/ui/esercizio/crea-convoglio";

export default async function Page() {
  const materialeRotabile: MaterialeRotabile[] = await fetchMateriale();
  return (
    <div className="p-8">
      
      <Form materialeRotabile={materialeRotabile} />

    </div>
  );
}
