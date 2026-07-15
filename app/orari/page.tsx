import z from "zod";
import { fetchStazioni, fetchTracceCorrenti } from "../lib/data";
import { Stazione, TracciaCorrente } from "../lib/definitions";
import SezioneOrari from "../ui/orari/sezione-orari";
import { notFound } from "next/navigation";

export default async function Page(props: {
  searchParams?: Promise<{
    dataTreno?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const dataTreno = searchParams?.dataTreno || "";
  let tracce: TracciaCorrente[] | null = null;
  let stazioni: Stazione[] | null = null;

  const dateSchema = z.coerce.date("Inserire una data valida!");

  //se esiste la data allora controlla se è valida
  if (dataTreno) {
    const validatedDate = dateSchema.safeParse(dataTreno);

    if (!validatedDate.success) {
      notFound();
    }
    
    tracce = await fetchTracceCorrenti(new Intl.DateTimeFormat('sv-SE').format(validatedDate.data));
    stazioni = await fetchStazioni();

  }

  return (
    <div className="h-screen">
      <SezioneOrari stazioni={stazioni} tracce={tracce} active={true} />
    </div>
  )
}