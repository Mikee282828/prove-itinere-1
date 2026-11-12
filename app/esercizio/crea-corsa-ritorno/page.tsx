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
    orario_ritorno: string;
    data_ritorno: string;
    codiceTreno_ritorno: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const data = searchParams?.data || "";
  const orario = searchParams?.orario || "";
  const stazione = searchParams?.stazione || "";
  const convoglio = searchParams?.convoglio || "";
  const codiceTreno = searchParams?.codiceTreno || "";
  const orario_ritorno = searchParams?.orario_ritorno || "";
  const data_ritorno = searchParams?.data_ritorno || "";
  const codiceTreno_ritorno = searchParams?.codiceTreno_ritorno || "";

  let treniDisponibili: CodiciTreno | null = null;

  if (data_ritorno) {
    try {
      treniDisponibili = await fetchTreniDisponibili(data);
    } catch (error) {
      alert(error);
    }
  }
  if (data && orario && stazione && convoglio && orario_ritorno && codiceTreno && data_ritorno) {
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
        orario_ritorno={orario_ritorno}
        data_ritorno={data_ritorno}
        codiciTreni={treniDisponibili}
      />

    </main>
  );
}
