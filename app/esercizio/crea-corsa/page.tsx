import { ConvoglioRaggruppato, fetchComposizioniDisponibili, fetchStazioni } from "@/app/lib/data";
import { Convoglio, Stazione } from "@/app/lib/definitions";
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

  if (data && orario && stazione) {
    try {
      convogliDisponibili = await fetchComposizioniDisponibili(data, orario, stazione);
    }catch(e){
      alert(e);
    }
  }
  const stazioni: Stazione[] = await fetchStazioni();
  return (
    <main>
      <Form
        convogli={convogliDisponibili}
        stazioni={stazioni}
      />

    </main>
  );
}
