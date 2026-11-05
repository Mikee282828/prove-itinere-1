import { ConvoglioRaggruppato, fetchComposizioniDisponibili, fetchStazioni, fetchTreniDisponibili } from "@/app/lib/data";
import { CodiciTreno, Convoglio, DaUnoAVenti, Stazione } from "@/app/lib/definitions";
import Form from "@/app/ui/esercizio/crea-corsa";

export default async function Page(props: {
  searchParams?: Promise<{
    data?: string;
    orario?: string;
    stazione?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const data = searchParams?.data || "";
  const orario = searchParams?.orario || "";
  const stazione = searchParams?.stazione || "";

  let convogliDisponibili: ConvoglioRaggruppato[] | null = null;
  let treniDisponibili : CodiciTreno | null = null;
  if(data){
    treniDisponibili = await fetchTreniDisponibili(data);
  }

  if (data && orario && stazione) {
    try {
      convogliDisponibili = await fetchComposizioniDisponibili(data, orario, stazione);
    }catch(e){
      alert(e);
    }
  }
  return (
    <main>
      <Form
        convogli={convogliDisponibili}
        codiciTreni={treniDisponibili}
      />

    </main>
  );
}
