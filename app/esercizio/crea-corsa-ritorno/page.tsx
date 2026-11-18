import { ConvoglioRaggruppato, fetchTreniDisponibili } from "@/app/lib/data";
import { CodiciTreno } from "@/app/lib/definitions";
import Form from "@/app/ui/esercizio/crea-corsa-ritorno";
import { notFound } from "next/navigation";

export default async function Page(props: {
  searchParams: Promise<{
    data: string;
    orario: string;
    stazione: string;
    convoglio: string;
    codiceTreno: string;
    tempo_ritorno_min: string;
    codiceTreno_ritorno: string;
    data_ritorno: string
  }>;
}) {
  const searchParams = await props.searchParams;
  //andata
  const data = searchParams?.data || "";
  const orario = searchParams?.orario || "";
  const stazione = searchParams?.stazione || "";
  const convoglio = searchParams?.convoglio || "";
  const codiceTreno = searchParams?.codiceTreno || "";

  //ritorno
  const tempo_ritorno_min = searchParams?.tempo_ritorno_min || "";
  const data_ritorno = searchParams?.data_ritorno || "";
  const codiceTreno_ritorno = searchParams?.codiceTreno_ritorno || "";

  let treniDisponibili: CodiciTreno | null = null;

  if (data_ritorno) {
    try {
      treniDisponibili = await fetchTreniDisponibili(data_ritorno);
    } catch (error) {
      console.error(error);
    }
  }

  if (data && orario && stazione && convoglio && codiceTreno && tempo_ritorno_min) {
  }
  else {
    notFound();
  }
  return (
    <main>
      <Form
        data={data}
        orario={orario}
        stazione={stazione}
        convoglio={convoglio}
        codiceTreno={codiceTreno}
        tempo_ritorno_min={tempo_ritorno_min}
        treniDisponibili={treniDisponibili}
      />

    </main>
  );
}
