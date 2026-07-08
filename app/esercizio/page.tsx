import {
  ConvoglioRaggruppato,
  fetchComposizioni,
  fetchMaterialeEsercizio,
  fetchStazioni,
  fetchTracceCorrenti,
} from "../lib/data";
import { MaterialeRotabile, Stazione, TracciaCorrente} from "../lib/definitions";
import Pagine from "../ui/esercizio/pagine";

export default async function Page(props: {
  searchParams?: Promise<{
    dataTreno?: string;
    data?: string;
    inizio?: string;
    fine?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const data = searchParams?.data || "";
  const inizio = searchParams?.inizio || "";
  const fine = searchParams?.fine || "";
  const dataTreno = searchParams?.dataTreno || "";

  let materialeRotabile: MaterialeRotabile[] | null = null;
  let tracce: TracciaCorrente[] | null = null;
  let stazioni: Stazione[] | null = null;
  const composizioni: ConvoglioRaggruppato[] = await fetchComposizioni();

  if (data && inizio && fine) {
    materialeRotabile = await fetchMaterialeEsercizio(data, inizio, fine);
  } else if (dataTreno) {
    tracce = await fetchTracceCorrenti(dataTreno);
    stazioni = await fetchStazioni();
  }

  return (
    <div className="flex-1">
      <Pagine
        materialeRotabile={materialeRotabile}
        composizioni={composizioni}
        tracce={tracce}
        stazioni={stazioni}
      />
    </div>
  );
}
