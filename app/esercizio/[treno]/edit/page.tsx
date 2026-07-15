import { fetchStazioni, fetchTracceCorrentiConId, fetchTreno } from "@/app/lib/data";
import Form from "@/app/ui/esercizio/modifica-corsa";
import { notFound } from "next/navigation";
import z from "zod";

export default async function Page(props: { params: Promise<{ treno: string }> }) {
  const params = await props.params;
  const schemaNumeroData = z.string().regex(/^\d+_\d{4}-\d{2}-\d{2}$/, { message: "Il formato deve essere 'numero_YYYY-MM-DD' (es. 123_2070-01-01)" });
  const treno = params.treno;

  // uscita anticipata
  if (!schemaNumeroData.safeParse(treno).success) {
    notFound();
  }

  // dati treno
  const [codiceTreno, dataTreno] = treno.split("_");

  // ottieni oggetto treno
  const oggettoTreno = await fetchTreno(dataTreno,codiceTreno);

  // ottieni tracce
  const tracce = await fetchTracceCorrentiConId(dataTreno, codiceTreno);
  
  const stazioni = await fetchStazioni();
  
  // se non ci sono tracce allora uscita anticipata
  if (tracce.length === 0)
    notFound();

  return (
    <div>
      <Form stazioni={stazioni} tracce={tracce} treno={oggettoTreno}/>
    </div>
  )
}