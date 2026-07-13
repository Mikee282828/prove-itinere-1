import Link from "next/link";
import Search from "./cerca/search";
import Materiali from "./materiali";
import { MaterialeRotabile } from "@/app/lib/definitions";

export default function SezioneMateriale({
  materialeRotabile,
  active,
}: {
  materialeRotabile: MaterialeRotabile[] | null;
  active: boolean;
}) {
  if (active) {
    return (
      <div className="p-8">
        <Link
          href="/esercizio?data=2070-01-01&inizio=10%3A40&fine=10%3A50"
          className="text-blue-500 hover:text-blue-400"
        >
          2070-01-01 10:40 ~ 10:50 (esterno - interno)
        </Link>
        <br />
        <Link
          href="/esercizio?data=2070-01-01&inizio=10%3A56&fine=10%3A56"
          className="text-blue-500 hover:text-blue-400"
        >
          2070-01-01 10:56 ~ 10:56 (interno)
        </Link>
        <br />
        <Link
          href="/esercizio?data=2070-01-01&inizio=15%3A29&fine=15%3A32"
          className="text-blue-500 hover:text-blue-400"
        >
          2070-01-01 15:29 ~ 15:32 (interno - esterno)
        </Link>
        <Link
          href="/esercizio?data=2070-01-01&inizio=15%3A30&fine=15%3A32"
          className="text-blue-500 hover:text-blue-400"
        >
          2070-01-01 15:30 ~ 15:32 (esterno)
        </Link>
        <br />
        <Search />
        <Materiali materialeRotabile={materialeRotabile} />
      </div>
    );
  }
}
