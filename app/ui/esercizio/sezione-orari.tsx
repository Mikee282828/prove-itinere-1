import { TracciaCorrente } from "@/app/lib/definitions";
import Search from "./cerca/searchTreno";
import Link from "next/link";

export default function SezioneOrari({
  active,
  tracce,
}: {
  active: boolean;
  tracce: TracciaCorrente[] | null;
}) {
  if (active) {
    return (
      <div className="p-8">
        <Link
          href="/esercizio?dataTreno=2070-01-01"
          className="text-blue-500 hover:text-blue-400"
        >
          2070-01-01
        </Link>
        <Search />
        {tracce?.length == 0 ? (
          <div className="text-red-500"> Nessun elemento trovato</div>
        ) : (
          tracce?.map((traccia, index) => (
            <div key={index}>
              <div>arrivo: {traccia.orario_arrivo?.slice(0, 5)}</div>
              <div>partenza : {traccia.orario_partenza?.slice(0, 5)}</div>
              <div>
                Tipo : {traccia.progressivo == 1 ? "Andata" : "Ritorno"}
              </div>
              <div>stazione : {traccia.stazione}</div>
              <div>data: {traccia.data.toLocaleDateString("it")}</div>
              <div>treno : {traccia.treno}</div>
              <div>
                -------------------------------------------------------------------------------------------
              </div>
            </div>
          ))
        )}
      </div>
    );
  }
}
