import { TracciaCorrente, Treno } from "@/app/lib/definitions";
import Search from "./cerca/searchTreno";

export default function SezioneOrari({
  active,
  tracce,
}: {
  active: boolean,
  tracce: TracciaCorrente[] | null,
}) {
  if (active) {
    return (
      <div className="p-8">
        <Search/>
        {tracce?.map((traccia, index) => (
          <div key={index}>
            <div>arrivo: {traccia.orario_arrivo?.slice(0,5)}</div>
            <div>partenza : {traccia.orario_partenza?.slice(0,5)}</div>
            <div>Tipo : {traccia.progressivo == 1 ? "Andata" : "Ritorno"}</div>
            <div>stazione : {traccia.stazione}</div>
            <div>data: {traccia.data.toLocaleDateString("it")}</div>
            <div>treno : {traccia.treno}</div>
            <div>
              -------------------------------------------------------------------------------------------
            </div>
          </div>
        ))}
      </div>
    );
  }
}
