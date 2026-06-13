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
          href="/esercizio?data=2025-12-01&inizio=10%3A40&fine=15%3A30"
          className="text-blue-500 hover:text-blue-400"
        >
          2025-12-01 10:40 ~ 15:31
        </Link>
        <br />
        <Link
          href="/esercizio?data=2025-12-01&inizio=15%3A30&fine=20%3A30"
          className="text-blue-500 hover:text-blue-400"
        >
          2025-12-01 15:30 ~ 20:30
        </Link>
        <br />
        <Link
          href="/esercizio?data=2025-12-01&inizio=06%3A40&fine=10%3A41"
          className="text-blue-500 hover:text-blue-400"
        >
          2025-12-01 6:40 ~ 10:41
        </Link>
        <br />
        <Link
          href="/esercizio?data=2025-12-01&inizio=15%3A29&fine=20%3A30"
          className="text-blue-500 hover:text-blue-400"
        >
          2025-12-01 15:29 ~ 20:30
        </Link>
        <Search />
        <Materiali materialeRotabile={materialeRotabile} />
      </div>
    );
  }
}
