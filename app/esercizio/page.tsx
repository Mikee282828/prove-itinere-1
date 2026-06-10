import Link from "next/link";
import { fetchMaterialeEsercizio } from "../lib/data";
import { MaterialeRotabile } from "../lib/definitions";
import Materiali from "../ui/esercizio/materiali";
import Search from "../ui/search";

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
  if (data && inizio && fine) {
    materialeRotabile = await fetchMaterialeEsercizio(data, inizio, fine);
  }
  return (
    <div className="flex-1 py-4">
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <Link href="http://localhost:3000/esercizio?data=2025-12-01&inizio=23%3A23&fine=23%3A23" className="text-blue-500 hover:text-blue-400">
          http://localhost:3000/esercizio?data=2025-12-01&inizio=23%3A23&fine=23%3A23
        </Link>
        <Search />
        <Materiali materialeRotabile={materialeRotabile} />
      </div>
    </div>
  );
}
