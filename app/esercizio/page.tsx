import {
  ConvoglioRaggruppato,
  fetchComposizioni,
  fetchMaterialeEsercizio,
} from "../lib/data";
import { MaterialeRotabile } from "../lib/definitions";
import Pagine from "../ui/esercizio/pagine";

export default async function Page(props: {
  searchParams?: Promise<{
    data?: string;
    inizio?: string;
    fine?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const data = searchParams?.data || "";
  const inizio = searchParams?.inizio || "";
  const fine = searchParams?.fine || "";

  let materialeRotabile: MaterialeRotabile[] | null = null;
  const composizioni: ConvoglioRaggruppato[] = await fetchComposizioni();
  console.log(composizioni);
  if (data && inizio && fine) {
    materialeRotabile = await fetchMaterialeEsercizio(data, inizio, fine);
  }

  return (
    <div className="flex-1">
      <Pagine
        materialeRotabile={materialeRotabile}
        composizioni={composizioni}
      />
    </div>
  );
}
